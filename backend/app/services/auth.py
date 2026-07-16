from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.repositories.employee import employee_repository, role_repository, department_repository
from app.repositories.log import session_repository
from app.schemas.auth import RegisterRequest, LoginRequest, Token
from app.models.employee import Employee
from app.models.session import Session as UserSession

class AuthService:
    """Handles credentials verification, token generation, and account registration."""
    
    def authenticate_user(self, db: Session, payload: LoginRequest) -> Employee:
        """Verifies email credentials and returns Employee model."""
        employee = employee_repository.get_by_email(db, email=payload.email)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        if not verify_password(payload.password, employee.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        if not employee.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive employee account",
            )
        return employee

    def register_user(self, db: Session, payload: RegisterRequest) -> Employee:
        """Creates a new employee account along with Department and Role if necessary."""
        # Check if already exists
        existing = employee_repository.get_by_email(db, email=payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered",
            )
            
        existing_badge = employee_repository.get_by_employee_id(db, employee_id=payload.employee_id)
        if existing_badge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee ID badge already registered",
            )

        # Get or create Department
        dept = department_repository.get_by_name(db, name=payload.department_name)
        if not dept:
            dept = department_repository.create(db, obj_in={
                "name": payload.department_name,
                "description": f"{payload.department_name} department"
            })

        # Get or create Role
        role = role_repository.get_by_name(db, name=payload.role_name)
        if not role:
            role = role_repository.create(db, obj_in={
                "name": payload.role_name,
                "description": f"{payload.role_name} corporate role"
            })

        # Hash password and create Employee
        hashed_pwd = get_password_hash(payload.password)
        employee_in = {
            "employee_id": payload.employee_id,
            "name": payload.name,
            "email": payload.email,
            "hashed_password": hashed_pwd,
            "department_id": dept.id,
            "role_id": role.id,
            "is_active": True
        }
        return employee_repository.create(db, obj_in=employee_in)

    def create_user_tokens(self, db: Session, employee: Employee) -> Token:
        """Generates access and refresh tokens, registering session state in database."""
        access_token = create_access_token(subject=employee.email)
        refresh_token = create_refresh_token(subject=employee.email)
        
        # Save session in database for logout/revocation checks
        session_expiry = datetime.now(timezone.utc) + timedelta(days=7)
        session_repository.create(db, obj_in={
            "employee_id": employee.id,
            "session_token": refresh_token,
            "expires_at": session_expiry,
            "is_blocked": False
        })

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )

    def refresh_user_token(self, db: Session, refresh_token: str) -> Token:
        """Validates refresh token, checks session status, and returns a new access token."""
        # Find session
        sess = session_repository.get_by_token(db, token=refresh_token)
        if not sess or sess.is_blocked or sess.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token",
            )
            
        employee = employee_repository.get(db, id=sess.employee_id)
        if not employee or not employee.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive or non-existent employee",
            )

        new_access = create_access_token(subject=employee.email)
        return Token(
            access_token=new_access,
            refresh_token=refresh_token,
            token_type="bearer"
        )

    def revoke_session(self, db: Session, token: str) -> None:
        """Blocks/Revokes an active session session token."""
        session_repository.block_session(db, token=token)

auth_service = AuthService()
