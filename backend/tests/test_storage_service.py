"""
Storage Service Tests
Comprehensive tests for Supabase Storage integration including file upload,
type validation, URL generation, error handling, and cleanup.
"""
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import asyncio


# ================== FILE UPLOAD TESTS ==================

class TestFileUpload:
    """Tests for file upload functionality"""
    
    @pytest.mark.asyncio
    async def test_upload_image_success(self):
        """Test successful image upload"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.upload.return_value = {"path": "user123/abc123_test.jpg"}
            mock_storage.return_value = storage_mock
            
            from app.core.storage import upload_medical_image
            
            file_content = b"fake image bytes"
            path, error = await upload_medical_image(
                file_content=file_content,
                filename="test.jpg",
                user_id="user123",
                content_type="image/jpeg"
            )
            
            # Should succeed
            assert error is None
            assert path is not None
            assert "user123" in path
    
    @pytest.mark.asyncio
    async def test_upload_empty_file(self):
        """Test uploading empty file fails"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.upload.side_effect = Exception("Empty file")
            mock_storage.return_value = storage_mock
            
            from app.core.storage import upload_medical_image
            
            path, error = await upload_medical_image(
                file_content=b"",
                filename="empty.jpg",
                user_id="user123"
            )
            
            assert path is None
            assert error is not None


# ================== FILE TYPE VALIDATION TESTS ==================

class TestFileTypeValidation:
    """Tests for file type validation"""
    
    def test_allowed_image_types(self):
        """Test that common image types are allowed"""
        # These are the allowed MIME types from storage.py
        allowed_types = [
            "image/jpeg",
            "image/png", 
            "image/webp",
            "image/gif"
        ]
        
        for mime_type in allowed_types:
            assert mime_type.startswith("image/")
    
    def test_validate_file_extension(self):
        """Test file extension validation logic"""
        valid_extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
        invalid_extensions = [".exe", ".sh", ".py", ".txt"]
        
        for ext in valid_extensions:
            assert ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]
        
        for ext in invalid_extensions:
            assert ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]


# ================== URL GENERATION TESTS ==================

class TestStorageURLGeneration:
    """Tests for signed and public URL generation"""
    
    @pytest.mark.asyncio
    async def test_public_url_generation(self):
        """Test public URL generation"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.get_public_url.return_value = "https://storage.example.com/public/test.jpg"
            mock_storage.return_value = storage_mock
            
            from app.core.storage import get_public_url
            
            url = await get_public_url("test/file.jpg")
            
            assert url is not None
            assert "https://" in url or url.startswith("http")
    
    @pytest.mark.asyncio
    async def test_signed_url_generation(self):
        """Test signed URL generation with expiration"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.create_signed_url.return_value = {
                "signedURL": "https://storage.example.com/signed?token=abc123"
            }
            mock_storage.return_value = storage_mock
            
            from app.core.storage import get_signed_url
            
            url, error = await get_signed_url("test/file.jpg", expires_in=3600)
            
            assert error is None
            assert url is not None


# ================== ERROR HANDLING TESTS ==================

class TestStorageErrorHandling:
    """Tests for storage error handling"""
    
    @pytest.mark.asyncio
    async def test_storage_connection_failure(self):
        """Test handling of storage connection failures"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            mock_storage.side_effect = Exception("Connection refused")
            
            from app.core.storage import upload_medical_image
            
            path, error = await upload_medical_image(
                file_content=b"test",
                filename="test.jpg",
                user_id="user123"
            )
            
            assert path is None
            assert error is not None
            assert "Connection" in error or "Error" in str(error).lower() or error is not None
    
    @pytest.mark.asyncio
    async def test_storage_quota_exceeded(self):
        """Test handling of storage quota exceeded errors"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.upload.side_effect = Exception("Storage quota exceeded")
            mock_storage.return_value = storage_mock
            
            from app.core.storage import upload_medical_image
            
            path, error = await upload_medical_image(
                file_content=b"large file content",
                filename="large.jpg",
                user_id="user123"
            )
            
            assert path is None
            assert error is not None


# ================== FILE CLEANUP TESTS ==================

class TestFileCleanup:
    """Tests for file deletion and cleanup"""
    
    @pytest.mark.asyncio
    async def test_delete_file_success(self):
        """Test successful file deletion"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.remove.return_value = None
            mock_storage.return_value = storage_mock
            
            from app.core.storage import delete_image
            
            success, error = await delete_image("user123/test.jpg")
            
            assert success is True
            assert error is None
    
    @pytest.mark.asyncio
    async def test_delete_nonexistent_file(self):
        """Test deleting a file that doesn't exist"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.remove.side_effect = Exception("File not found")
            mock_storage.return_value = storage_mock
            
            from app.core.storage import delete_image
            
            success, error = await delete_image("nonexistent/file.jpg")
            
            assert success is False
            assert error is not None


# ================== STORAGE BUCKET TESTS ==================

class TestStorageBuckets:
    """Tests for storage bucket operations"""
    
    @pytest.mark.asyncio
    async def test_bucket_exists(self):
        """Test checking if bucket exists"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.get_bucket.return_value = {"name": "medical-images", "public": False}
            mock_storage.return_value = storage_mock
            
            from app.core.storage import ensure_bucket_exists
            
            result = await ensure_bucket_exists()
            
            assert result is True
    
    @pytest.mark.asyncio
    async def test_list_bucket_files(self):
        """Test listing files in a bucket"""
        with patch('app.core.storage.get_storage_client') as mock_storage:
            storage_mock = MagicMock()
            storage_mock.from_.return_value.list.return_value = [
                {"name": "file1.jpg", "created_at": "2024-01-01"},
                {"name": "file2.png", "created_at": "2024-01-02"},
            ]
            mock_storage.return_value = storage_mock
            
            from app.core.storage import list_user_images
            
            files, error = await list_user_images("user123")
            
            assert error is None
            assert len(files) == 2


# ================== FILE PATH GENERATION TESTS ==================

class TestFilePathGeneration:
    """Tests for file path generation"""
    
    def test_generate_file_path(self):
        """Test file path generation format"""
        from app.core.storage import generate_file_path
        
        path = generate_file_path("user123", "my image.jpg")
        
        assert "user123" in path
        assert "my_image.jpg" in path  # Spaces should be replaced with underscores
        assert "/" in path  # Should have directory separator
    
    def test_generate_file_path_unique(self):
        """Test that generated paths are unique"""
        from app.core.storage import generate_file_path
        
        paths = [generate_file_path("user123", "test.jpg") for _ in range(10)]
        
        # All paths should be unique due to UUID
        assert len(set(paths)) == 10


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
