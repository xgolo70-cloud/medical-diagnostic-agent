import pytest
from app.core.security import encrypt, decrypt
from cryptography.fernet import Fernet

def test_encryption_decryption():
    key = Fernet.generate_key()
    data = "Sensitive Patient Data"
    
    encrypted_data = encrypt(data, key)
    assert encrypted_data != data
    
    decrypted_data = decrypt(encrypted_data, key)
    assert decrypted_data == data

def test_encrypt_invalid_key():
    with pytest.raises(Exception):
        encrypt("data", "invalid_key")
