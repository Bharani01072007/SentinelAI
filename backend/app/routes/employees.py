from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.schemas.employee import EmployeeResponse, BehaviourProfileResponse
from app.services.employee import employee_service
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.employee import Employee

router = APIRouter(prefix="/employees", tags=["Employee Management"])

@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin", "Analyst"]))
):
    """Retrieve lists of employee directory profiles."""
    return employee_service.get_employees(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin", "Analyst"]))
):
    """Retrieve details for a single employee record."""
    return employee_service.get_employee_by_id(db, employee_id=id)

@router.get("/badge/{badge_id}/profile", response_model=BehaviourProfileResponse)
def get_profile(
    badge_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Retrieve historical behavior baselines for a specific employee badge-id."""
    return employee_service.get_behaviour_profile(db, employee_badge=badge_id)

@router.post("/badge/{badge_id}/profile/recalculate", response_model=BehaviourProfileResponse)
def recalculate_profile(
    badge_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["Admin", "Analyst"]))
):
    """Force recalculating the behavioral profiles baseline from historical logs."""
    return employee_service.recalculate_employee_profile(db, employee_badge=badge_id)
