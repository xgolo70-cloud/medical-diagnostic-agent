"""
Password Hashing Utilities
Low-level password hashing using Argon2 via passlib.
JWT token creation is handled exclusively by core/auth.py.
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)