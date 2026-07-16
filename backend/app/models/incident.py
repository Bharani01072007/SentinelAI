import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False) # low, medium, high, critical
    status = Column(String(50), default="open", nullable=False) # open, investigating, mitigated, closed
    
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="incidents")
    assigned_to = relationship("Employee", foreign_keys=[assigned_to_id], back_populates="assigned_incidents")
    alert = relationship("Alert", back_populates="incident")

    @property
    def employee_badge(self) -> str:
        return self.employee.employee_id if self.employee else ""

    @property
    def employee_name(self) -> str:
        return self.employee.name if self.employee else ""
