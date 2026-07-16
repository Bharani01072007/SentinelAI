from fastapi import APIRouter, Depends, Query, Path, status, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.schemas.log import (
    ActivityLogInput, AnalysisResponse, BatchAnalysisRequest, BatchAnalysisResponse,
    CopilotChatRequest, CopilotChatResponse
)
from app.schemas.threat import AlertResponse, AlertUpdate, IncidentResponse, IncidentUpdate
from app.services.threat import threat_service
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.employee import Employee
from app.repositories.threat import alert_repository, incident_repository

router = APIRouter(tags=["Threat Monitoring"])

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_activity(log: ActivityLogInput, db: Session = Depends(get_db)):
    """Evaluate a single user log payload. Triggers real-time alert/incident logic if anomalous."""
    return await threat_service.analyze_activity(db, log)

@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_batch(payload: BatchAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze a batch of logs."""
    return await threat_service.analyze_batch(db, payload)

@router.get("/model/status")
def get_model_status():
    """Retrieve hyperparameters and training baseline status of the active Isolation Forest model."""
    forest = threat_service.isolation_forest
    return {
        "status": "ready" if forest.is_fitted else "not_trained",
        "model_type": "Isolation Forest (Unsupervised)",
        "model_version": "1.0.0",
        "contamination": forest.contamination,
        "n_estimators": forest.n_estimators,
        "feature_count": len(threat_service.feature_engineer.FEATURE_NAMES),
        "is_fitted": forest.is_fitted
    }

@router.post("/model/retrain")
def retrain_model(
    contamination: float = Query(0.05, ge=0.01, le=0.5),
    n_estimators: int = Query(200, ge=50, le=1000),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin"]))
):
    """Force retraining of the Isolation Forest model on historical logs in the database."""
    return threat_service.retrain_model(db, contamination, n_estimators)

@router.get("/alerts", response_model=List[AlertResponse])
def list_alerts(
    status_filter: str = Query(None, description="Filter alerts by open/under_review/resolved/dismissed"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin", "Analyst"]))
):
    """Retrieve lists of open and investigated security alerts."""
    if status_filter:
        return alert_repository.get_by_status(db, status=status_filter)
    return alert_repository.get_recent_alerts(db)

@router.patch("/alerts/{id}", response_model=AlertResponse)
def update_alert(
    id: UUID,
    payload: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin", "Analyst"]))
):
    """Update status configuration of an alert."""
    alert = alert_repository.get(db, id=id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert_repository.update(db, db_obj=alert, obj_in=payload)

@router.get("/incidents", response_model=List[IncidentResponse])
def list_incidents(
    status_filter: str = Query(None, description="Filter incidents by status"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin", "Analyst"]))
):
    """Retrieve lists of active investigation cases."""
    if status_filter:
        return incident_repository.get_by_status(db, status=status_filter)
    return incident_repository.get_recent_incidents(db)

@router.patch("/incidents/{id}", response_model=IncidentResponse)
def update_incident(
    id: UUID,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin", "Analyst"]))
):
    """Assign incident case ticket or change workflow status."""
    incident = incident_repository.get(db, id=id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident_repository.update(db, db_obj=incident, obj_in=payload)

@router.get("/threats/live", response_model=List[AlertResponse])
def get_live_threats(db: Session = Depends(get_db)):
    """Real-time live feed of enterprise security alerts for dashboard polling."""
    return alert_repository.get_recent_alerts(db)

@router.get("/employees/{badge_id}/risk", response_model=AnalysisResponse)
async def get_employee_risk(badge_id: str, db: Session = Depends(get_db)):
    """Ingest mock log for user and compute risk decision. Used in profiling pages."""
    # Generate mock log telemetry for user risk display
    from data.data_generator import generate_anomalous_log, generate_normal_log
    
    # In order to match the original endpoints behavior
    if "emp-001" in badge_id or "chen" in badge_id.lower():
        log_dict = generate_anomalous_log(employee_id=badge_id, pattern="data_exfil")
    elif "emp-008" in badge_id or "vasquez" in badge_id.lower():
        log_dict = generate_anomalous_log(employee_id=badge_id, pattern="midnight")
    elif "emp-002" in badge_id or "reyes" in badge_id.lower():
        log_dict = generate_anomalous_log(employee_id=badge_id, pattern="privilege")
    elif "emp-005" in badge_id or "sharma" in badge_id.lower():
        log_dict = generate_anomalous_log(employee_id=badge_id, pattern="account_takeover")
    else:
        log_dict = generate_normal_log(employee_id=badge_id)
        
    log_input = ActivityLogInput(**log_dict)
    return await threat_service.analyze_activity(db, log_input)


# ─────────────────────────────────────────────────────────────
# COPILOT CHAT ROUTE
# ─────────────────────────────────────────────────────────────

@router.post("/copilot/chat", response_model=CopilotChatResponse)
async def copilot_chat(
    payload: CopilotChatRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Interact with the SentinelGPT Copilot using Gemini."""
    app = request.app
    if not hasattr(app.state, "copilot_service") or app.state.copilot_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Copilot service is not initialized."
        )

    try:
        response_dict = app.state.copilot_service.generate_chat_response(payload.message, db=db)
        return response_dict
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Copilot error: {str(e)}"
        )

