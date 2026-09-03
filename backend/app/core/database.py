from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import logging
from app.core.config import settings

logger = logging.getLogger("sentinelgrid.database")

# Support automatic SQLite fallback for frictionless local testing if Postgres is not reachable
DATABASE_URL = settings.DATABASE_URL

def create_db_engine():
    try:
        # Check if database URL is SQLite or Postgres
        if DATABASE_URL.startswith("sqlite"):
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        else:
            engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            # Test connection
            with engine.connect() as conn:
                pass
            logger.info("Connected to primary PostgreSQL database.")
        return engine
    except Exception as e:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        db_path = os.path.join(project_root, "sentinelgrid_local.db")
        fallback_url = f"sqlite:///{db_path}"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db_tables():
    """Create all database tables on application startup."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
