from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dashboard import DashboardOverviewResponse
from app.services.dashboard import dashboard_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Threat Dashboard"])

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_overview(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Compiles online counts, high risk counts, timelines, trends, and recent alerts/incidents."""
    return dashboard_service.get_dashboard_overview(db)
