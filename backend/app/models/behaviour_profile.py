import uuid
from sqlalchemy import Column, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class BehaviourProfile(Base):
    __tablename__ = "behaviour_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    avg_login_hour = Column(Float, default=9.0, nullable=False)
    avg_downloads = Column(Float, default=10.0, nullable=False)
    avg_session_duration = Column(Float, default=480.0, nullable=False)
    
    common_locations = Column(JSON, default=list, nullable=False) # list of strings
    common_devices = Column(JSON, default=list, nullable=False) # list of strings
    
    last_calculated = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    employee = relationship("Employee", back_populates="behaviour_profile")
