import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routes.router import router as api_router
from app.ai.copilot import CopilotService

# Load all database models to compile metadata
import app.models  # noqa

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sentinelai.app")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade Clean Architecture insider threat detection platform",
    version="1.0.0"
)

# Enable CORS for frontend client interactions
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register central routers
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    """Application boot sequence. Sets up database structures and ML engine components."""
    logger.info("SentinelAI Backend starting up...")
    
    # Auto-create tables on database (Supabase PostgreSQL) if missing
    try:
        logger.info("Initializing database schema/tables on PostgreSQL...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema applied successfully.")
        
        # Run database seeding
        try:
            from app.core.seed import seed_db
            from app.core.database import SessionLocal
            db = SessionLocal()
            try:
                seed_db(db)
            finally:
                db.close()
        except Exception as seed_err:
            logger.error(f"Failed to seed database: {str(seed_err)}", exc_info=True)
            
    except Exception as e:
        logger.critical(f"Failed to apply database schema: {str(e)}", exc_info=True)

    # Initialize Copilot Service (Gemini SDK integration)
    try:
        logger.info("Bootstrapping Gemini Copilot Service...")
        app.state.copilot_service = CopilotService()
        logger.info("Gemini Copilot Service active.")
    except Exception as e:
        logger.error(f"Failed to bootstrap Gemini Copilot Service: {str(e)}", exc_info=True)


@app.get("/health", tags=["System health"])
def health_check():
    """Fast health status verification."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

# Serve frontend static files in production
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BACKEND_DIR)
DIST_DIR = os.path.join(ROOT_DIR, "dist")

if os.path.exists(DIST_DIR):
    # Mount assets folder if it exists
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    # Catch-all route to serve SPA or local files
    @app.get("/{catchall:path}")
    async def serve_spa(catchall: str):
        # Skip API/health routes so they return proper 404/method errors
        if catchall.startswith("api") or catchall.startswith("health"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
            
        # Check if requesting a direct file (like favicon.svg, icons.svg)
        file_path = os.path.join(DIST_DIR, catchall)
        if os.path.isfile(file_path) and not catchall.endswith(".html"):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
