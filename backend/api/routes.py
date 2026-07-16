"""
SentinelAI AI Engine — API Routes

FastAPI route handlers for executing threat analysis, managing model state,
and serving active telemetry feeds to the React frontend.
"""

from __future__ import annotations
import time
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks

from data.schemas import (
    ActivityLog, AnalysisResponse, BatchAnalysisRequest, BatchAnalysisResponse,
    ModelStatusResponse, RetrainRequest, LiveThreatEvent, CopilotChatRequest,
    CopilotChatResponse
)
from ai_engine.feature_extractor import FeatureExtractor
from ai_engine.anomaly_detector import AnomalyDetector
from ai_engine.risk_engine import RiskEngine
from ai_engine.explainer import Explainer
from ai_engine.adaptive_access import AdaptiveAccessEngine
from ai_engine.risk_prediction_service import RiskPredictionService
from ai_engine.copilot import CopilotService

logger = logging.getLogger("sentinelai.api.routes")
router = APIRouter(prefix="/api/v1")

# Global mock state for live feed tracking
_live_events: List[LiveThreatEvent] = []

@router.get("", tags=["System"])
@router.get("/", tags=["System"])
async def api_root():
    """
    Returns system status, active ML service descriptions, and endpoints catalog.
    """
    return {
        "status": "online",
        "service": "SentinelAI AI threat Detection Engine",
        "version": "1.0.0",
        "endpoints": {
            "api_root": "GET /api/v1",
            "health": "GET /health",
            "model_status": "GET /api/v1/model/status",
            "live_threat_feed": "GET /api/v1/threats/live",
            "employee_risk_query": "GET /api/v1/employees/{id}/risk",
            "analyze_activity": "POST /api/v1/analyze",
            "batch_analysis": "POST /api/v1/analyze/batch",
            "trigger_model_retrain": "POST /api/v1/model/retrain"
        }
    }

def add_live_event(res: AnalysisResponse, log: ActivityLog):
    """Utility to track live events in memory for dashboard polling."""
    global _live_events
    
    # Only keep last 50 events
    if len(_live_events) > 50:
        _live_events.pop(0)

    # Get primary risk factor if any exist
    top_f = "Standard Activity Profile"
    if res.explainability.top_factors:
        top_f = res.explainability.top_factors[0].label

    sev = "low"
    if res.risk_result.risk_level == "critical":
        sev = "critical"
    elif res.risk_result.risk_level == "high_risk":
        sev = "high"
    elif res.risk_result.risk_level == "medium_risk":
        sev = "medium"

    _live_events.append(LiveThreatEvent(
        event_id=f"evt-{int(time.time() * 1000)}",
        employee_id=log.employee_id,
        employee_name=log.employee_id,  # For simplification in route responses
        risk_score=res.risk_result.risk_score,
        risk_level=res.risk_result.risk_label,
        anomaly_score=res.anomaly_result.normalized_score,
        prediction=res.anomaly_result.prediction,
        top_factor=top_f,
        access_decision=res.access_decision.decision_label,
        location=log.login_location,
        timestamp=datetime.utcnow(),
        severity=sev
    ))

# ─────────────────────────────────────────────────────────────
# CORE PREDICTION ENDPOINT
# ─────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_activity(log: ActivityLog, request: Request):
    """
    Analyze a single user activity log through the ML + rules pipeline.
    """
    start_time = time.perf_counter()
    app = request.app

    # Ensure model components are loaded
    if not hasattr(app.state, "anomaly_detector") or app.state.anomaly_detector is None:
        raise HTTPException(status_code=503, detail="AI Engine model state not ready.")

    try:
        extractor: FeatureExtractor = app.state.feature_extractor
        detector: AnomalyDetector = app.state.anomaly_detector
        risk_engine: RiskEngine = app.state.risk_engine
        explainer: Explainer = app.state.explainer
        adaptive_access: AdaptiveAccessEngine = app.state.adaptive_access

        # Step 1: Feature Extraction & Normalization
        feature_vector = extractor.transform(log)

        # Step 2: Isolation Forest Evaluation
        anomaly_res = detector.predict(feature_vector)

        # Step 3: Combined Risk Engine Execution
        risk_res = risk_engine.evaluate(log, anomaly_res)

        # Step 4: Explainability Generation
        explain_res = explainer.generate_report(risk_res)

        # Step 5: Adaptive Policy Decision
        access_res = adaptive_access.make_decision(risk_res)

        processing_ms = (time.perf_counter() - start_time) * 1000.0

        response = AnalysisResponse(
            employee_id=log.employee_id,
            timestamp=datetime.utcnow(),
            anomaly_result=anomaly_res,
            risk_result=risk_res,
            explainability=explain_res,
            access_decision=access_res,
            processing_time_ms=processing_ms,
            model_version="1.0.0"
        )

        # Log active alerts to memory cache
        if risk_res.risk_score > 20:
            add_live_event(response, log)

        return response

    except Exception as e:
        logger.error(f"Error during threat analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Threat Engine processing error: {str(e)}")


# ─────────────────────────────────────────────────────────────
# BATCH ENDPOINT
# ─────────────────────────────────────────────────────────────

@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_batch(payload: BatchAnalysisRequest, request: Request):
    """
    Submit a collection of user logs for batch analysis.
    """
    start_time = time.perf_counter()
    results = []
    critical_count = 0
    high_count = 0

    for log in payload.logs:
        res = await analyze_activity(log, request)
        results.append(res)
        if res.risk_result.risk_level == "critical":
            critical_count += 1
        elif res.risk_result.risk_level == "high_risk":
            high_count += 1

    processing_ms = (time.perf_counter() - start_time) * 1000.0

    return BatchAnalysisResponse(
        results=results,
        total_analyzed=len(payload.logs),
        critical_count=critical_count,
        high_risk_count=high_count,
        processing_time_ms=processing_ms
    )


# ─────────────────────────────────────────────────────────────
# MODEL CONFIGURATION & TRAINING
# ─────────────────────────────────────────────────────────────

@router.get("/model/status", response_model=ModelStatusResponse)
async def get_model_status(request: Request):
    """
    Check training stats, hyperparameters, and model versions.
    """
    app = request.app
    detector: AnomalyDetector = app.state.anomaly_detector
    extractor: FeatureExtractor = app.state.feature_extractor
    xgb: RiskPredictionService = app.state.risk_prediction_service

    status = "ready" if detector._fitted else "not_trained"

    return ModelStatusResponse(
        status=status,
        model_type="IsolationForest (Unsupervised)",
        model_version="1.0.0",
        trained_at=app.state.model_trained_at,
        training_samples=app.state.training_samples,
        contamination=detector.contamination,
        n_estimators=detector.n_estimators,
        feature_count=len(extractor.FEATURE_NAMES),
        xgboost_available=xgb.is_available()
    )


def background_retrain(contamination: float, n_estimators: int, app: Request.app):
    """Asynchronous background retraining task."""
    try:
        from data.data_generator import generate_training_dataset
        X_df, _ = generate_training_dataset(n_normal=10000, n_anomalous=500)
        X = X_df.to_numpy()

        # Fit Scaler
        extractor: FeatureExtractor = app.state.feature_extractor
        extractor.fit(X)
        extractor.save(app.state.scaler_path)

        # Transform and Fit Isolation Forest
        X_norm = extractor.transform_raw_matrix(X)
        detector = AnomalyDetector(contamination=contamination, n_estimators=n_estimators)
        detector.fit(X_norm)
        detector.save(app.state.model_path)

        # Update application state
        app.state.anomaly_detector = detector
        app.state.model_trained_at = datetime.utcnow()
        app.state.training_samples = len(X)

        logger.info("[BackgroundRetrain] AI Engine retraining completed successfully.")
    except Exception as e:
        logger.error(f"[BackgroundRetrain] Retraining failed: {str(e)}", exc_info=True)


@router.post("/model/retrain")
async def trigger_retrain(payload: RetrainRequest, request: Request, background_tasks: BackgroundTasks):
    """
    Retrain the scaler and Isolation Forest model in the background.
    """
    background_tasks.add_task(
        background_retrain,
        payload.contamination,
        payload.n_estimators,
        request.app
    )
    return {"message": "Retraining job queued in background tasks."}


# ─────────────────────────────────────────────────────────────
# active TELEMETRY & FEED ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.get("/threats/live", response_model=List[LiveThreatEvent])
async def get_live_threats():
    """
    Return recent anomalies registered by the SOC.
    Used for live dashboards polling.
    """
    global _live_events
    # Sort events so latest is first
    return sorted(_live_events, key=lambda e: e.timestamp, reverse=True)


@router.get("/employees/{id}/risk")
async def get_employee_risk(id: str, request: Request):
    """
    Query current simulated telemetry and calculate risk.
    """
    # Simply generate a realistic log for the requested employee id and return threat analysis
    from data.data_generator import generate_anomalous_log, generate_normal_log
    
    # Mocking different risk postures depending on employee name/id patterns
    if "emp-001" in id or "chen" in id.lower():
        log_dict = generate_anomalous_log(employee_id=id, pattern="data_exfil")
    elif "emp-008" in id or "vasquez" in id.lower():
        log_dict = generate_anomalous_log(employee_id=id, pattern="midnight")
    elif "emp-002" in id or "reyes" in id.lower():
        log_dict = generate_anomalous_log(employee_id=id, pattern="privilege")
    elif "emp-005" in id or "sharma" in id.lower():
        log_dict = generate_anomalous_log(employee_id=id, pattern="account_takeover")
    else:
        log_dict = generate_normal_log(employee_id=id)

    log = ActivityLog(**log_dict)
    res = await analyze_activity(log, request)
    return res


# ─────────────────────────────────────────────────────────────
# COPILOT CHAT ENDPOINT
# ─────────────────────────────────────────────────────────────

@router.post("/copilot/chat", response_model=CopilotChatResponse)
async def copilot_chat(payload: CopilotChatRequest, request: Request):
    """
    Submit a message query to the SentinelGPT AI Copilot (Gemini model).
    """
    app = request.app
    if not hasattr(app.state, "copilot_service") or app.state.copilot_service is None:
        raise HTTPException(status_code=503, detail="Copilot service is not initialized.")

    try:
        # Generate chat response using the Gemini model wrapper
        response_dict = app.state.copilot_service.generate_chat_response(payload.message)
        return response_dict
    except Exception as e:
        logger.error(f"Error executing copilot prompt: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Copilot service error: {str(e)}")

