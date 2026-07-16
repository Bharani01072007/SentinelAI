from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any
from app.schemas.employee import EmployeeResponse

class AlertResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_badge: str
    employee_name: str
    title: str
    description: str
    risk_score: float
    severity: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: str # open, under_review, resolved, dismissed

class IncidentCreate(BaseModel):
    employee_id: UUID
    alert_id: Optional[UUID] = None
    title: str
    description: str
    severity: str
    assigned_to_id: Optional[UUID] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None # open, investigating, mitigated, closed
    severity: Optional[str] = None
    assigned_to_id: Optional[UUID] = None

class IncidentResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employee_badge: str
    employee_name: str
    alert_id: Optional[UUID] = None
    title: str
    description: str
    severity: str
    status: str
    assigned_to: Optional[EmployeeResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RiskScoreResponse(BaseModel):
    id: UUID
    employee_id: UUID
    score: float
    anomaly_score: float
    risk_level: str
    calculated_at: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: UUID
    actor: Optional[EmployeeResponse] = None
    action: str
    target_type: str
    target_id: Optional[str] = None
    details: Optional[Any] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
