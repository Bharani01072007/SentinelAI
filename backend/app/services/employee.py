from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status

from app.repositories.employee import employee_repository, behaviour_profile_repository
from app.repositories.log import employee_log_repository
from app.models.employee import Employee
from app.models.behaviour_profile import BehaviourProfile
from app.ai.behaviour_profile import BehaviourProfileCalculator

class EmployeeService:
    """Manages employee directory records and profiling baselines."""
    
    def get_employees(self, db: Session, skip: int = 0, limit: int = 100) -> List[Employee]:
        """Fetch page of employees."""
        return employee_repository.get_multi(db, skip=skip, limit=limit)

    def get_employee_by_id(self, db: Session, employee_id: UUID) -> Employee:
        """Fetch employee by primary UUID, raise 404 if not found."""
        emp = employee_repository.get(db, id=employee_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with UUID {employee_id} not found."
            )
        return emp

    def get_employee_by_badge(self, db: Session, badge_id: str) -> Employee:
        """Fetch employee by unique badge identifier, raise 404 if not found."""
        emp = employee_repository.get_by_employee_id(db, employee_id=badge_id)
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with badge ID {badge_id} not found."
            )
        return emp

    def get_behaviour_profile(self, db: Session, employee_badge: str) -> BehaviourProfile:
        """Retrieve behavioural baseline for employee, create a default profile if missing."""
        emp = self.get_employee_badge_or_create_default_profile(db, employee_badge)
        profile = behaviour_profile_repository.get_by_employee_id(db, employee_id=employee_badge)
        if not profile:
            # Create a default behavior baseline
            profile = behaviour_profile_repository.create(db, obj_in={
                "employee_id": emp.id,
                "avg_login_hour": 9.0,
                "avg_downloads": 10.0,
                "avg_session_duration": 480.0,
                "common_locations": ["US"],
                "common_devices": ["Workstation-Default"]
            })
        return profile

    def recalculate_employee_profile(self, db: Session, employee_badge: str) -> BehaviourProfile:
        """Re-aggregates user logs to update baseline profile."""
        emp = self.get_employee_badge_or_create_default_profile(db, employee_badge)
        logs = employee_log_repository.get_by_employee_badge(db, employee_badge=employee_badge, limit=100)
        
        calculator = BehaviourProfileCalculator()
        metrics = calculator.calculate_baseline(logs)
        
        profile = behaviour_profile_repository.get_by_employee_id(db, employee_id=employee_badge)
        if not profile:
            profile = behaviour_profile_repository.create(db, obj_in={
                "employee_id": emp.id,
                **metrics
            })
        else:
            profile = behaviour_profile_repository.update(db, db_obj=profile, obj_in=metrics)
            
        return profile

    def get_employee_badge_or_create_default_profile(self, db: Session, badge_id: str) -> Employee:
        """Fetches employee by badge-id, or inserts a dummy employee profile to support ingestion stream."""
        emp = employee_repository.get_by_employee_id(db, employee_id=badge_id)
        if not emp:
            # Ingesting logs for a user who does not yet have credentials. Create a default account profile
            from app.core.security import get_password_hash
            from app.repositories.employee import role_repository, department_repository
            
            dept = department_repository.get_by_name(db, "Retail Banking")
            if not dept:
                dept = department_repository.create(db, obj_in={"name": "Retail Banking", "description": "Retail banking operations"})
            role = role_repository.get_by_name(db, "Employee")
            if not role:
                role = role_repository.create(db, obj_in={"name": "Employee", "description": "Standard corporate role"})
                
            hashed_pwd = get_password_hash("SentinelAI123!")
            emp = employee_repository.create(db, obj_in={
                "employee_id": badge_id,
                "name": badge_id.replace("emp-", "Employee ").title(),
                "email": f"{badge_id}@sentinelai-bank.com",
                "hashed_password": hashed_pwd,
                "department_id": dept.id,
                "role_id": role.id,
                "is_active": True
            })
        return emp

employee_service = EmployeeService()
