from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.audit_log import AuditLog

class AlertRepository(BaseRepository[Alert]):
    def get_recent_alerts(self, db: Session, limit: int = 100) -> List[Alert]:
        """Fetch latest enterprise security alerts."""
        return db.query(self.model).order_by(self.model.created_at.desc()).limit(limit).all()

    def get_by_status(self, db: Session, status: str) -> List[Alert]:
        """Filter alerts by status."""
        return db.query(self.model).filter(self.model.status == status).all()

alert_repository = AlertRepository(Alert)


class IncidentRepository(BaseRepository[Incident]):
    def get_recent_incidents(self, db: Session, limit: int = 100) -> List[Incident]:
        """Fetch latest critical security incidents."""
        return db.query(self.model).order_by(self.model.created_at.desc()).limit(limit).all()

    def get_by_status(self, db: Session, status: str) -> List[Incident]:
        """Filter incidents by investigation status."""
        return db.query(self.model).filter(self.model.status == status).all()

incident_repository = IncidentRepository(Incident)


class AuditLogRepository(BaseRepository[AuditLog]):
    def get_recent_audit_logs(self, db: Session, limit: int = 100) -> List[AuditLog]:
        """Fetch latest system admin audit events."""
        return db.query(self.model).order_by(self.model.created_at.desc()).limit(limit).all()

audit_log_repository = AuditLogRepository(AuditLog)
