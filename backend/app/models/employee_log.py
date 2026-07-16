import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class EmployeeLog(Base):
    __tablename__ = "employee_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    
    # Session Details
    login_time = Column(Float, nullable=False) # hour of day (0-23)
    logout_time = Column(Float, nullable=True) # hour of day (0-23)
    session_duration_minutes = Column(Float, default=0.0)
    login_frequency_7d = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)

    # Device & Network Telemetry
    device_id = Column(String(100), nullable=False)
    device_known = Column(Boolean, default=True)
    browser = Column(String(50), nullable=True)
    operating_system = Column(String(50), nullable=True)
    ip_address = Column(String(45), nullable=False)
    vpn_used = Column(Boolean, default=False)
    
    # Location
    login_location = Column(String(100), nullable=False)
    location_anomaly = Column(Boolean, default=False)

    # Resource Access Telemetry
    database_accessed = Column(Boolean, default=False)
    sensitive_db_accessed = Column(Boolean, default=False)
    server_accessed = Column(Boolean, default=False)
    sensitive_files_accessed = Column(Integer, default=0)
    
    # Data Volume Telemetry
    files_downloaded = Column(Integer, default=0)
    download_size_mb = Column(Float, default=0.0)

    # Privilege/Peripherals Telemetry
    usb_connected = Column(Boolean, default=False)
    password_changed = Column(Boolean, default=False)
    privilege_escalation = Column(Boolean, default=False)
    permission_modified = Column(Boolean, default=False)

    # Reference Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    employee = relationship("Employee", back_populates="logs")
