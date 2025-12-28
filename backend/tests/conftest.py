import pytest
from unittest.mock import patch

@pytest.fixture
def mock_gemini():
    with patch('google.generativeai.GenerativeModel') as mock:
        yield mock
