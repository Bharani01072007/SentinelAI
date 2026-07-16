from fastapi import APIRouter
from app.routes.auth import router as auth_router
from app.routes.employees import router as employees_router
from app.routes.threat import router as threat_router
from app.routes.dashboard import router as dashboard_router

# Aggregated API router matching prefix configurations
router = APIRouter(prefix="/api/v1")

router.include_router(auth_router)
router.include_router(employees_router)
router.include_router(threat_router)
router.include_router(dashboard_router)
