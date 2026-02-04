"""
Supabase Client Configuration

This module initializes and provides the Supabase client for the
Medical Diagnostic Agent backend.
"""

import os
from functools import lru_cache
from supabase import create_client, Client

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


@lru_cache()
def get_supabase_client() -> Client:
    """
    Get a cached Supabase client instance.
    Uses the anon key for general operations.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise ValueError(
            "Supabase environment variables are not configured. "
            "Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file."
        )
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


@lru_cache()
def get_supabase_admin_client() -> Client:
    """
    Get a cached Supabase admin client instance.
    Uses the service_role key for admin operations (bypasses RLS).
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError(
            "Supabase admin environment variables are not configured. "
            "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
        )
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# Convenience function to get the client
supabase = get_supabase_client
supabase_admin = get_supabase_admin_client
