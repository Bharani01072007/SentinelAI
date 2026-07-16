import time
import logging
import os
from datetime import datetime
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.schemas.log import (
    ActivityLogInput, AnomalyResult, RiskEngineResult, ExplainabilityReport,
    AccessDecision, AnalysisResponse, BatchAnalysisRequest, BatchAnalysisResponse
)
from app.repositories.log import employee_log_repository, risk_score_repository
from app.repositories.threat import alert_repository, incident_repository
from app.services.employee import employee_service
from app.ai.feature_engineering import FeatureEngineer
from app.ai.isolation_forest import IsolationForestModel
from app.ai.risk_engine import RiskEngine
from app.ai.explainable_ai import ExplainabilityEngine

logger = logging.getLogger("sentinelai.services.threat")

class ThreatService:
    """Orchestrates threat detection feature engineering, ML scoring, and alert generation."""
    
    def __init__(self):
        self.feature_engineer = FeatureEngineer()
        self.isolation_forest = IsolationForestModel()
        self.risk_engine = RiskEngine()
        self.explainability_engine = ExplainabilityEngine()
        
        # Load pre-trained model or train default
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "isolation_forest.joblib")
        # Ensure directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        self.model_path = model_path
        
        try:
            if os.path.exists(model_path):
                self.isolation_forest.load(model_path)
            else:
                logger.warning(f"Weights file not found at {model_path}. Training a default baseline...")
                self.isolation_forest.train_default_baseline()
                self.isolation_forest.save(model_path)
        except Exception as e:
            logger.error(f"Failed to bootstrap Isolation Forest: {str(e)}. Initializing default baseline...", exc_info=True)
            self.isolation_forest.train_default_baseline()

    async def analyze_activity(self, db: Session, log: ActivityLogInput) -> AnalysisResponse:
        """
        Runs a log telemetry through ML + Policy pipeline.
        Saves log, scores, and triggers Alerts / Incidents where appropriate.
        """
        start_time = time.perf_counter()
        
        # 1. Fetch or create employee profile & load baselines
        emp = employee_service.get_employee_badge_or_create_default_profile(db, log.employee_id)
        profile = employee_service.get_behaviour_profile(db, log.employee_id)
        
        # 2. Enrich log with behaviour baseline details
        log.historical_avg_login_hour = profile.avg_login_hour
        log.historical_avg_downloads = profile.avg_downloads
        # Get prior risk score if any
        prior_scores = db.query(risk_score_repository.model).filter_by(employee_id=emp.id).order_by(risk_score_repository.model.calculated_at.desc()).limit(1).first()
        log.historical_risk_score = float(prior_scores.score) if prior_scores else 10.0

        # 3. Extract features & evaluate via ML
        feature_vector = self.feature_engineer.extract_features(log)
        norm_score, confidence, prediction = self.isolation_forest.predict(feature_vector)
        
        anomaly_res = AnomalyResult(
            anomaly_score=norm_score - 0.5, # Map normalized back to raw approximation for display
            normalized_score=norm_score,
            prediction=prediction,
            confidence=confidence
        )

        # 4. Run Risk Engine combining ML anomaly + Business Rules
        risk_res, decision_res = self.risk_engine.evaluate(log, anomaly_res)

        # 5. Generate Explainability Report
        explain_res = self.explainability_engine.generate_report(risk_res, log)

        # 6. Persist Activity Log to Database
        log_obj = {
            "employee_id": emp.id,
            "login_time": log.login_time,
            "logout_time": log.logout_time,
            "session_duration_minutes": log.session_duration_minutes,
            "login_frequency_7d": log.login_frequency_7d,
            "failed_login_attempts": log.failed_login_attempts,
            "device_id": log.device_id,
            "device_known": log.device_known,
            "browser": log.browser,
            "operating_system": log.operating_system,
            "ip_address": log.ip_address,
            "vpn_used": log.vpn_used,
            "login_location": log.login_location,
            "location_anomaly": log.location_anomaly,
            "database_accessed": log.database_accessed,
            "sensitive_db_accessed": log.sensitive_db_accessed,
            "server_accessed": log.server_accessed,
            "sensitive_files_accessed": log.sensitive_files_accessed,
            "files_downloaded": log.files_downloaded,
            "download_size_mb": log.download_size_mb,
            "usb_connected": log.usb_connected,
            "password_changed": log.password_changed,
            "privilege_escalation": log.privilege_escalation,
            "permission_modified": log.permission_modified,
            "timestamp": datetime.utcnow()
        }
        db_log = employee_log_repository.create(db, obj_in=log_obj)

        # 7. Persist Risk Evaluation
        db_risk = risk_score_repository.create(db, obj_in={
            "employee_id": emp.id,
            "score": risk_res.risk_score,
            "anomaly_score": norm_score,
            "risk_level": risk_res.risk_level,
            "calculated_at": datetime.utcnow()
        })

        # 8. Trigger Incident Case Management & Alerts if policy violation detected
        if decision_res.create_incident:
            # Insert Alert
            db_alert = alert_repository.create(db, obj_in={
                "employee_id": emp.id,
                "title": risk_res.risk_label,
                "description": explain_res.summary,
                "risk_score": risk_res.risk_score,
                "severity": decision_res.incident_severity,
                "status": "open"
            })
            
            # Insert Incident Ticket
            incident_repository.create(db, obj_in={
                "employee_id": emp.id,
                "alert_id": db_alert.id,
                "title": f"Investigate Incident: {emp.name} ({log.employee_id})",
                "description": f"Risk Score reached {risk_res.risk_score:.1f}. Explainability breakdown:\n- " + "\n- ".join([f.description for f in explain_res.top_factors]),
                "severity": decision_res.incident_severity,
                "status": "open",
                "assigned_to_id": None
            })

        processing_ms = (time.perf_counter() - start_time) * 1000.0

        return AnalysisResponse(
            employee_id=log.employee_id,
            timestamp=datetime.utcnow(),
            anomaly_result=anomaly_res,
            risk_result=risk_res,
            explainability=explain_res,
            access_decision=decision_res,
            processing_time_ms=processing_ms,
            model_version="1.0.0"
        )

    async def analyze_batch(self, db: Session, payload: BatchAnalysisRequest) -> BatchAnalysisResponse:
        """Processes collection of logs for batch security validation."""
        start_time = time.perf_counter()
        results: List[AnalysisResponse] = []
        critical_count = 0
        high_risk_count = 0
        
        for log in payload.logs:
            res = await self.analyze_activity(db, log)
            results.append(res)
            if res.risk_result.risk_level == "critical":
                critical_count += 1
            elif res.risk_result.risk_level == "high_risk":
                high_risk_count += 1
                
        processing_ms = (time.perf_counter() - start_time) * 1000.0
        
        return BatchAnalysisResponse(
            results=results,
            total_analyzed=len(payload.logs),
            critical_count=critical_count,
            high_risk_count=high_risk_count,
            processing_time_ms=processing_ms
        )

    def retrain_model(self, db: Session, contamination: float, n_estimators: int) -> dict:
        """Retrains Isolation Forest algorithm on all activity logs stored in the database."""
        # Query logs from database
        all_db_logs = db.query(employee_log_repository.model).all()
        
        if len(all_db_logs) < 10:
            # Fall back to default fit if data is sparse
            logger.warning("Log database contains insufficient records to retrain. Re-running default baseline.")
            self.isolation_forest.train_default_baseline()
            self.isolation_forest.save(self.model_path)
            return {"message": "Retrained model using standard default baseline dataset (sparse database logs)."}

        # Extract features
        logs_schemas = []
        for log in all_db_logs:
            # Fetch employee to construct schema
            emp = db.query(employee_service.model).get(log.employee_id)
            dept = emp.department.name if emp and emp.department else "Retail Banking"
            role = emp.role.name if emp and emp.role else "Employee"
            
            logs_schemas.append(ActivityLogInput(
                employee_id=emp.employee_id if emp else "emp-unknown",
                department=dept,
                role=role,
                login_time=log.login_time,
                logout_time=log.logout_time if log.logout_time is not None else 17.0,
                session_duration_minutes=log.session_duration_minutes,
                login_frequency_7d=log.login_frequency_7d,
                failed_login_attempts=log.failed_login_attempts,
                device_id=log.device_id,
                device_known=log.device_known,
                browser=log.browser or "Chrome",
                operating_system=log.operating_system or "Windows",
                ip_address=log.ip_address,
                vpn_used=log.vpn_used,
                login_location=log.login_location,
                location_anomaly=log.location_anomaly,
                database_accessed=log.database_accessed,
                sensitive_db_accessed=log.sensitive_db_accessed,
                server_accessed=log.server_accessed,
                sensitive_files_accessed=log.sensitive_files_accessed,
                files_downloaded=log.files_downloaded,
                download_size_mb=log.download_size_mb,
                usb_connected=log.usb_connected,
                password_changed=log.password_changed,
                privilege_escalation=log.privilege_escalation,
                permission_modified=log.permission_modified
            ))

        X = self.feature_engineer.extract_batch(logs_schemas)
        
        # Fit new model state
        new_forest = IsolationForestModel(contamination=contamination, n_estimators=n_estimators)
        new_forest.fit(X)
        new_forest.save(self.model_path)
        
        # Hot-swap engine model
        self.isolation_forest = new_forest
        return {"message": f"Successfully retrained Isolation Forest model on {len(all_db_logs)} database session logs."}

threat_service = ThreatService()
