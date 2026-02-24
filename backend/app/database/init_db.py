"""
Database Initialization
Script for setting up the database and seeding initial data.
"""
import os
import logging
from datetime import datetime, timezone
from .connection import create_tables, get_db_context, engine, Base
from .models import User, UserRole
from app.core.auth import hash_password

logger = logging.getLogger(__name__)


def init_database():
    """
    Initialize the database with tables and seed data.
    This should be called on application startup.
    """
    # Create all tables
    create_tables()
    
    # Seed initial admin user if no users exist
    seed_initial_users()


def seed_initial_users():
    """
    Create initial system users if the database is empty.
    In production, you would only create an admin user.
    """
    with get_db_context() as db:
        # Check if any users exist
        existing_users = db.query(User).first()
        if existing_users:
            logger.info("Database already has users, skipping seed")
            return
        
        logger.info("Seeding initial users...")
        
        # Create default admin user
        admin_user = User(
            email="admin@medai.local",
            username="admin",
            password_hash=hash_password("Admin123!"),
            role=UserRole.ADMIN,
            full_name="System Administrator",
            is_verified=True,
            is_active=True,
        )
        db.add(admin_user)
        
        # Create demo users for development/testing
        if os.getenv("ENVIRONMENT", "development") != "production":
            demo_users = [
                User(
                    email="doctor@medai.local",
                    username="dr.smith",
                    password_hash=hash_password("Doctor123!"),
                    role=UserRole.SPECIALIST,
                    full_name="Dr. Sarah Smith",
                    is_verified=True,
                    is_active=True,
                ),
                User(
                    email="gp@medai.local",
                    username="dr.johnson",
                    password_hash=hash_password("Doctor123!"),
                    role=UserRole.GP,
                    full_name="Dr. Michael Johnson",
                    is_verified=True,
                    is_active=True,
                ),
                User(
                    email="patient@example.com",
                    username="john.doe",
                    password_hash=hash_password("Patient123!"),
                    role=UserRole.PATIENT,
                    full_name="John Doe",
                    phone="+1234567890",
                    is_verified=True,
                    is_active=True,
                ),
                User(
                    email="auditor@medai.local",
                    username="auditor",
                    password_hash=hash_password("Auditor123!"),
                    role=UserRole.AUDITOR,
                    full_name="System Auditor",
                    is_verified=True,
                    is_active=True,
                ),
            ]
            for user in demo_users:
                db.add(user)
        
        db.commit()
        logger.info("Initial users seeded successfully")
        
        # Log demo credentials at DEBUG level (suppressed in production)
        if os.getenv("ENVIRONMENT", "development") != "production":
            logger.debug("Demo Credentials:")
            logger.debug("  Admin:      admin / Admin123!")
            logger.debug("  Specialist: dr.smith / Doctor123!")
            logger.debug("  GP:         dr.johnson / Doctor123!")
            logger.debug("  Patient:    john.doe / Patient123!")
            logger.debug("  Auditor:    auditor / Auditor123!")


def reset_database():
    """
    Drop all tables and recreate them.
    WARNING: This will delete all data! Use only in development.
    """
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError("Cannot reset database in production!")
    
    logger.warning("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    logger.info("Recreating tables...")
    init_database()
    logger.info("Database reset complete")


if __name__ == "__main__":
    # Allow running directly for manual initialization
    init_database()
