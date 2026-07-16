from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.employee import EmployeeResponse
from app.services.auth import auth_service
from app.auth.dependencies import get_current_user
from app.models.employee import Employee

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new cybersecurity corporate employee/analyst profile."""
    return auth_service.register_user(db, payload)

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Validates login credentials and returns JWT bearer tokens."""
    employee = auth_service.authenticate_user(db, payload)
    return auth_service.create_user_tokens(db, employee)

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Generates new access token using a valid session refresh token."""
    return auth_service.refresh_user_token(db, refresh_token)

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(refresh_token: str, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    """Revokes active login session in the database."""
    auth_service.revoke_session(db, refresh_token)
    return {"message": "Successfully logged out."}
