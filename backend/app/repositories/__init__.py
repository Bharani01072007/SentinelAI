from app.repositories.base import BaseRepository
from app.repositories.employee import (
    employee_repository, department_repository, role_repository, behaviour_profile_repository
)
from app.repositories.log import (
    employee_log_repository, session_repository, risk_score_repository
)
from app.repositories.threat import (
    alert_repository, incident_repository, audit_log_repository
)
