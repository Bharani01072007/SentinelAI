from pydantic import BaseModel
from typing import List, Dict
from app.schemas.threat import AlertResponse, IncidentResponse

class RiskTrendItem(BaseModel):
    timestamp: str
    avg_score: float
    max_score: float

class DepartmentRiskItem(BaseModel):
    department: str
    avg_score: float
    user_count: int
    critical_count: int

class BehaviourAnalyticsItem(BaseModel):
    category: str
    anomaly_rate: float
    average_session_duration: float
    download_volume_mb: float

class DashboardOverviewResponse(BaseModel):
    employees_online: int
    high_risk_users: int
    average_risk: float
    risk_trend: List[RiskTrendItem]
    department_risk: List[DepartmentRiskItem]
    recent_alerts: List[AlertResponse]
    recent_incidents: List[IncidentResponse]
