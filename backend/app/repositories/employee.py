from typing import Optional, List
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.behaviour_profile import BehaviourProfile

class EmployeeRepository(BaseRepository[Employee]):
    def get_by_email(self, db: Session, email: str) -> Optional[Employee]:
        """Fetch employee by unique email."""
        return db.query(self.model).filter(self.model.email == email).first()

    def get_by_employee_id(self, db: Session, employee_id: str) -> Optional[Employee]:
        """Fetch employee by badge/badge-id, e.g., emp-001."""
        return db.query(self.model).filter(self.model.employee_id == employee_id).first()

employee_repository = EmployeeRepository(Employee)


class DepartmentRepository(BaseRepository[Department]):
    def get_by_name(self, db: Session, name: str) -> Optional[Department]:
        """Fetch department by unique name."""
        return db.query(self.model).filter(self.model.name == name).first()

department_repository = DepartmentRepository(Department)


class RoleRepository(BaseRepository[Role]):
    def get_by_name(self, db: Session, name: str) -> Optional[Role]:
        """Fetch RBAC role by unique name."""
        return db.query(self.model).filter(self.model.name == name).first()

role_repository = RoleRepository(Role)


class BehaviourProfileRepository(BaseRepository[BehaviourProfile]):
    def get_by_employee_id(self, db: Session, employee_id: str) -> Optional[BehaviourProfile]:
        """Fetch behavioral baseline profile of employee."""
        # Query joining Employee to match badge-id
        return db.query(self.model).join(Employee).filter(Employee.employee_id == employee_id).first()

behaviour_profile_repository = BehaviourProfileRepository(BehaviourProfile)
