import pytest
from datetime import timedelta
# These imports will fail until we implement the module
try:
    from app.core.security import verify_password, get_password_hash, create_access_token
except ImportError:
    pass

def test_password_hashing():
    password = "secret_password"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrong_password", hashed)

def test_jwt_creation():
    data = {"sub": "testuser"}
    token = create_access_token(data=data, expires_delta=timedelta(minutes=15))
    assert isinstance(token, str)
    assert len(token) > 0
