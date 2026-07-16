from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Configure database engine with connection pooling parameters for Supabase PostgreSQL
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Automatically rewrite Supabase connection strings to use the IPv4-compatible pooler
if db_url and ".supabase.co" in db_url:
    try:
        from urllib.parse import urlparse, urlunparse
        parsed = urlparse(db_url)
        hostname = parsed.hostname
        if hostname and hostname.startswith("db."):
            project_ref = hostname.split(".")[1]
            original_user = parsed.username or "postgres"
            new_user = f"{original_user}.{project_ref}"
            new_host = "aws-1-ap-south-1.pooler.supabase.com"
            password_part = f":{parsed.password}" if parsed.password else ""
            port_part = f":{parsed.port}" if parsed.port else ""
            new_netloc = f"{new_user}{password_part}@{new_host}{port_part}"
            parsed = parsed._replace(netloc=new_netloc)
            db_url = urlunparse(parsed)
    except Exception:
        pass

engine = create_engine(
    db_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI database session dependency injection provider."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
