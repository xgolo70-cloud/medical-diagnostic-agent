"""
Database Initialization
Script for setting up the database and seeding initial data.
"""
import os
from datetime import datetime, timezone
from .connection import create_tables, get_db_context, engine, Base
from .models import User, UserRole
from app.core.auth import hash_password


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
        print("🌱 Seeding initial users...")
        
        # Define all required users (Admin + Demo)
        required_users = [
            User(
                email="admin@medai.local",
                username="admin",
                password_hash=hash_password("Admin123!"),
                role=UserRole.ADMIN,
                full_name="System Administrator",
                is_verified=True,
                is_active=True,
            )
        ]

        # Add demo users if not in production
        if os.getenv("ENVIRONMENT", "development") != "production":
            required_users.extend([
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
            ])

        # Check and create each user
        for user in required_users:
            existing_user = db.query(User).filter(
                (User.email == user.email) | (User.username == user.username)
            ).first()
            
            if not existing_user:
                print(f"Creating user: {user.username} ({user.role})")
                db.add(user)
            else:
                print(f"User already exists: {user.username}")
        
        db.commit()
        print("✅ User seeding check complete")
        
        # Print demo credentials in development
        if os.getenv("ENVIRONMENT", "development") != "production":
            print("\n📝 Demo Credentials:")
            print("  Admin:      admin / Admin123!")
            print("  Specialist: dr.smith / Doctor123!")
            print("  GP:         dr.johnson / Doctor123!")
            print("  Patient:    john.doe / Patient123!")
            print("  Auditor:    auditor / Auditor123!")
            print()


def reset_database():
    """
    Drop all tables and recreate them.
    WARNING: This will delete all data! Use only in development.
    """
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError("Cannot reset database in production!")
    
    print("⚠️ Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("🔄 Recreating tables...")
    init_database()
    print("✅ Database reset complete")


if __name__ == "__main__":
    # Allow running directly for manual initialization
    init_database()
