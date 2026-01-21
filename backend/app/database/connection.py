"""
Database Connection Module
Provides SQLAlchemy engine, session management, and database initialization.
Configured for SQLite in development, easily switchable to PostgreSQL for production.
"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager

# Database URL configuration
# SQLite for development (file-based, zero config)
# Set DATABASE_URL environment variable for PostgreSQL in production
# Example: postgresql://user:password@localhost:5432/medical_db
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medical_diagnostic.db")

# SQLite specific configuration
is_sqlite = DATABASE_URL.startswith("sqlite")

# Create engine with appropriate settings
if is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Required for SQLite with FastAPI
        echo=os.getenv("SQL_DEBUG", "").lower() == "true"  # Log SQL queries if enabled
    )
    
    # Enable foreign key support for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL or other databases
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before use
        echo=os.getenv("SQL_DEBUG", "").lower() == "true"
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session.
    Automatically closes the session when the request is complete.
    
    Usage:
        @router.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for database sessions outside of FastAPI.
    Useful for scripts and background tasks.
    
    Usage:
        with get_db_context() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def create_tables():
    """
    Create all database tables defined in models.
    Should be called on application startup.
    """
    from . import models  # Import models to register them with Base
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")


def drop_tables():
    """
    Drop all database tables. Use with caution!
    Only for development/testing purposes.
    """
    Base.metadata.drop_all(bind=engine)
    print("⚠️ All database tables dropped")
