"""
Supabase Storage Helper

Provides functions for uploading, downloading, and managing
medical images in Supabase Storage.
"""

import os
import uuid
from typing import Optional, Tuple
from datetime import timedelta

from .supabase import get_supabase_client, get_supabase_admin_client

# Storage bucket name for medical images
MEDICAL_IMAGES_BUCKET = "medical-images"


def get_storage_client():
    """Get the Supabase storage client"""
    client = get_supabase_admin_client()
    return client.storage


async def ensure_bucket_exists() -> bool:
    """
    Ensure the medical images bucket exists.
    Creates it if it doesn't exist.
    
    Returns:
        True if bucket exists or was created successfully
    """
    try:
        storage = get_storage_client()
        
        # Try to get bucket info
        try:
            storage.get_bucket(MEDICAL_IMAGES_BUCKET)
            return True
        except Exception:
            pass
        
        # Create bucket if it doesn't exist
        storage.create_bucket(
            MEDICAL_IMAGES_BUCKET,
            options={
                "public": False,  # Private bucket - requires auth
                "file_size_limit": 10485760,  # 10MB max
                "allowed_mime_types": [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif"
                ]
            }
        )
        return True
    except Exception as e:
        print(f"Error ensuring bucket exists: {e}")
        return False


def generate_file_path(user_id: str, filename: str) -> str:
    """
    Generate a unique file path for the uploaded image.
    
    Format: {user_id}/{uuid}_{original_filename}
    
    Args:
        user_id: The user's Supabase ID
        filename: Original filename
        
    Returns:
        The storage path for the file
    """
    unique_id = str(uuid.uuid4())[:8]
    safe_filename = filename.replace(" ", "_")
    return f"{user_id}/{unique_id}_{safe_filename}"


async def upload_medical_image(
    file_content: bytes,
    filename: str,
    user_id: str,
    content_type: str = "image/jpeg"
) -> Tuple[Optional[str], Optional[str]]:
    """
    Upload a medical image to Supabase Storage.
    
    Args:
        file_content: The file bytes
        filename: Original filename
        user_id: The user's Supabase ID (for organizing files)
        content_type: MIME type of the file
        
    Returns:
        Tuple of (file_path, error_message)
        - If successful: (path, None)
        - If failed: (None, error_message)
    """
    try:
        # Ensure bucket exists
        await ensure_bucket_exists()
        
        storage = get_storage_client()
        file_path = generate_file_path(user_id, filename)
        
        # Upload the file
        storage.from_(MEDICAL_IMAGES_BUCKET).upload(
            path=file_path,
            file=file_content,
            file_options={
                "content-type": content_type,
                "upsert": "false"
            }
        )
        
        return file_path, None
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error uploading image: {error_msg}")
        return None, error_msg


async def get_signed_url(
    file_path: str,
    expires_in: int = 3600
) -> Tuple[Optional[str], Optional[str]]:
    """
    Get a signed URL for accessing a private file.
    
    Args:
        file_path: Path to the file in storage
        expires_in: URL expiration time in seconds (default 1 hour)
        
    Returns:
        Tuple of (signed_url, error_message)
    """
    try:
        storage = get_storage_client()
        
        result = storage.from_(MEDICAL_IMAGES_BUCKET).create_signed_url(
            path=file_path,
            expires_in=expires_in
        )
        
        if result and "signedURL" in result:
            return result["signedURL"], None
        
        return None, "Failed to generate signed URL"
        
    except Exception as e:
        return None, str(e)


async def get_public_url(file_path: str) -> str:
    """
    Get the public URL for a file (only works if bucket is public).
    
    Args:
        file_path: Path to the file in storage
        
    Returns:
        The public URL
    """
    storage = get_storage_client()
    result = storage.from_(MEDICAL_IMAGES_BUCKET).get_public_url(file_path)
    return result


async def delete_image(file_path: str) -> Tuple[bool, Optional[str]]:
    """
    Delete an image from storage.
    
    Args:
        file_path: Path to the file to delete
        
    Returns:
        Tuple of (success, error_message)
    """
    try:
        storage = get_storage_client()
        storage.from_(MEDICAL_IMAGES_BUCKET).remove([file_path])
        return True, None
    except Exception as e:
        return False, str(e)


async def list_user_images(user_id: str) -> Tuple[list, Optional[str]]:
    """
    List all images uploaded by a user.
    
    Args:
        user_id: The user's Supabase ID
        
    Returns:
        Tuple of (file_list, error_message)
    """
    try:
        storage = get_storage_client()
        
        result = storage.from_(MEDICAL_IMAGES_BUCKET).list(
            path=user_id,
            options={
                "limit": 100,
                "sortBy": {"column": "created_at", "order": "desc"}
            }
        )
        
        return result, None
        
    except Exception as e:
        return [], str(e)
