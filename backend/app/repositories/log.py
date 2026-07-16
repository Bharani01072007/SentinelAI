from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.repositories.base import BaseRepository
from app.models.employee_log import EmployeeLog
from app.models.session import Session as UserSession
from app.models.risk_score import RiskScore
from app.models.employee import Employee

class EmployeeLogRepository(BaseRepository[EmployeeLog]):
    def get_by_employee_badge(self, db: Session, employee_badge: str, limit: int = 100) -> List[EmployeeLog]:
        """Fetch activity logs for a specific employee."""
        return db.query(self.model).join(Employee).filter(Employee.employee_id == employee_badge).order_by(self.model.timestamp.desc()).limit(limit).all()

    def get_recent_logs(self, db: Session, limit: int = 100) -> List[EmployeeLog]:
        """Fetch latest activity logs."""
        return db.query(self.model).order_by(self.model.timestamp.desc()).limit(limit).all()

employee_log_repository = EmployeeLogRepository(EmployeeLog)


class SessionRepository(BaseRepository[UserSession]):
    def get_by_token(self, db: Session, token: str) -> Optional[UserSession]:
        """Retrieve session record by token string."""
        return db.query(self.model).filter(self.model.session_token == token).first()

    def block_session(self, db: Session, token: str) -> bool:
        """Mark a session as blocked."""
        session_obj = self.get_by_token(db, token)
        if session_obj:
            session_obj.is_blocked = True
            db.commit()
            return True
        return False

session_repository = SessionRepository(UserSession)


class RiskScoreRepository(BaseRepository[RiskScore]):
    def get_recent_scores(self, db: Session, limit: int = 100) -> List[RiskScore]:
        """Fetch latest calculated risk scores."""
        return db.query(self.model).order_by(self.model.calculated_at.desc()).limit(limit).all()

    def get_risk_trend(self, db: Session, days: int = 7) -> List[tuple]:
        """Calculate average and maximum risk scores grouped by day."""
        since_date = datetime.utcnow() - timedelta(days=days)
        # SQLite / Postgres compatible date trunc/format
        # In PostgreSQL we can use date_trunc, for SQLite we can use strftime.
        # To be future-proof and support Supabase, we can use cast or date_trunc.
        # Let's group by date(calculated_at)
        date_label = func.date(self.model.calculated_at).label("day")
        return (
            db.query(
                date_label,
                func.avg(self.model.score).label("avg_score"),
                func.max(self.model.score).label("max_score")
            )
            .filter(self.model.calculated_at >= since_date)
            .group_by(func.date(self.model.calculated_at))
            .order_by(date_label.asc())
            .all()
        )

risk_score_repository = RiskScoreRepository(RiskScore)
