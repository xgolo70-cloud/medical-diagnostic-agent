from cryptography.fernet import Fernet

def encrypt(data: str, key: bytes) -> bytes:
    """Encrypts string data using Fernet symmetric encryption."""
    f = Fernet(key)
    return f.encrypt(data.encode())

def decrypt(data: bytes, key: bytes) -> str:
    """Decrypts bytes data using Fernet symmetric encryption."""
    f = Fernet(key)
    return f.decrypt(data).decode()
