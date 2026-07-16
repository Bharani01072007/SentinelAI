import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    department = relationship("Department", back_populates="employees")
    role = relationship("Role", back_populates="employees", lazy="selectin")
    devices = relationship("Device", back_populates="employee", cascade="all, delete-orphan")
    logs = relationship("EmployeeLog", back_populates="employee", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="employee", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="employee", cascade="all, delete-orphan")
    incidents = relationship("Incident", foreign_keys="[Incident.employee_id]", back_populates="employee", cascade="all, delete-orphan")
    assigned_incidents = relationship("Incident", foreign_keys="[Incident.assigned_to_id]", back_populates="assigned_to")
    sessions = relationship("Session", back_populates="employee", cascade="all, delete-orphan")
    behaviour_profile = relationship("BehaviourProfile", back_populates="employee", uselist=False, cascade="all, delete-orphan")
