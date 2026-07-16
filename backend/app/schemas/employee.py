from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    password: str
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None

class EmployeeResponse(EmployeeBase):
    id: UUID
    department: Optional[DepartmentResponse] = None
    role: Optional[RoleResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BehaviourProfileResponse(BaseModel):
    employee_id: UUID
    avg_login_hour: float
    avg_downloads: float
    avg_session_duration: float
    common_locations: List[str]
    common_devices: List[str]
    last_calculated: datetime

    class Config:
        from_attributes = True
