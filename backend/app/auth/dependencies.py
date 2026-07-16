from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from sqlalchemy.orm import Session
from typing import List

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.models.employee import Employee
from app.repositories.employee import employee_repository

# Defines standard token authorization header reader dependency
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> Employee:
    """Decodes JWT access token and resolves active Employee record from database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
        
    email: str = payload.get("sub")
    token_type: str = payload.get("type")
    
    if email is None or token_type != "access":
        raise credentials_exception
        
    employee = employee_repository.get_by_email(db, email=email)
    if employee is None:
        raise credentials_exception
    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive employee profile."
        )
    return employee


class RoleChecker:
    """Role-Based Access Control (RBAC) authorization validation dependency."""
    
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: Employee = Depends(get_current_user)) -> Employee:
        if not current_user.role or current_user.role.name not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource."
            )
        return current_user


class PermissionChecker:
    """RBAC Permission-level validation dependency."""
    
    def __init__(self, allowed_permissions: List[str]):
        self.allowed_permissions = allowed_permissions

    def __call__(self, current_user: Employee = Depends(get_current_user)) -> Employee:
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Role settings not assigned to user profile."
            )
        
        user_permissions = {p.name for p in current_user.role.permissions}
        for perm in self.allowed_permissions:
            if perm in user_permissions:
                return current_user
                
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Required permission not assigned to user profile."
        )
