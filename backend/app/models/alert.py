import uuid
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False) # low, medium, high, critical
    status = Column(String(50), default="open", nullable=False) # open, under_review, resolved, dismissed

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    employee = relationship("Employee", back_populates="alerts", lazy="joined")
    incident = relationship("Incident", uselist=False, back_populates="alert")

    @property
    def employee_badge(self) -> str:
        return self.employee.employee_id if self.employee else ""

    @property
    def employee_name(self) -> str:
        return self.employee.name if self.employee else ""
