"""
MedGemma Unit Tests
Tests for utilities, extraction functions, and API endpoints
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import io
from PIL import Image

# Import modules under test
from app.api.medgemma.utils import (
    preprocess_image,
    create_analysis_prompt,
    clean_response,
    extract_findings,
    extract_recommendations,
)
from app.api.medgemma.config import (
    ImageConfig,
    GenerationConfig,
    MODALITY_CONTEXTS,
)


class TestImagePreprocessing:
    """Test image preprocessing utilities"""
    
    def test_preprocess_image_converts_to_rgb(self):
        """Test that images are converted to RGB"""
        # Create a grayscale image
        gray_image = Image.new("L", (100, 100), color=128)
        buffer = io.BytesIO()
        gray_image.save(buffer, format="PNG")
        buffer.seek(0)
        
        result = preprocess_image(buffer.read())
        assert result.mode == "RGB"
    
    def test_preprocess_image_resizes_large_images(self):
        """Test that large images are resized"""
        # Create a large image
        large_image = Image.new("RGB", (1000, 800), color=(255, 0, 0))
        buffer = io.BytesIO()
        large_image.save(buffer, format="PNG")
        buffer.seek(0)
        
        result = preprocess_image(buffer.read())
        assert max(result.size) <= ImageConfig.MAX_SIZE
    
    def test_preprocess_image_keeps_small_images(self):
        """Test that small images are not resized"""
        small_image = Image.new("RGB", (200, 150), color=(0, 255, 0))
        buffer = io.BytesIO()
        small_image.save(buffer, format="PNG")
        buffer.seek(0)
        
        result = preprocess_image(buffer.read())
        assert result.size == (200, 150)


class TestPromptCreation:
    """Test prompt generation utilities"""
    
    def test_create_analysis_prompt_with_modality(self):
        """Test prompt includes modality context"""
        prompt = create_analysis_prompt("Check for fractures", "xray")
        assert "xray" in prompt.lower()
        assert "fractures" in prompt.lower()
    
    def test_create_analysis_prompt_general_modality(self):
        """Test prompt with unknown modality uses general"""
        prompt = create_analysis_prompt("Analyze", "unknown")
        assert "unknown" in prompt.lower() or "medical image" in prompt.lower()


class TestResponseCleaning:
    """Test response cleaning utilities"""
    
    def test_clean_response_removes_pad_tokens(self):
        """Test that pad tokens are removed"""
        text = "Analysis result<pad><pad>"
        result = clean_response(text)
        assert "<pad>" not in result
    
    def test_clean_response_removes_incomplete_sentences(self):
        """Test removal of incomplete sentences ending with common words"""
        text = "The brain is normal. However,"
        result = clean_response(text)
        assert result.endswith("normal.")
    
    def test_clean_response_removes_repetition_patterns(self):
        """Test removal of 'Key Findings 1 1' type patterns"""
        text = "Analysis complete.\n\nKey Findings 1 1 some repeated text"
        result = clean_response(text)
        assert "Key Findings 1 1" not in result


class TestFindingsExtraction:
    """Test findings extraction from analysis text"""
    
    def test_extract_findings_from_bullet_points(self):
        """Test extraction from bullet point lists"""
        text = """
* **Brain**: Normal appearance
* **Ventricles**: Within normal limits
"""
        findings = extract_findings(text)
        assert len(findings) >= 1
        assert any("Brain" in f or "Ventricles" in f for f in findings)
    
    def test_extract_findings_from_numbered_list(self):
        """Test extraction from numbered lists"""
        text = """
1. **Finding One**: First observation
2. **Finding Two**: Second observation
"""
        findings = extract_findings(text)
        assert len(findings) >= 1
    
    def test_extract_findings_fallback(self):
        """Test fallback when no structured findings"""
        text = "The scan shows normal brain structure with no abnormalities."
        findings = extract_findings(text)
        assert len(findings) >= 1


class TestRecommendationsExtraction:
    """Test recommendations extraction"""
    
    def test_extract_recommendations_from_section(self):
        """Test extraction from recommendations section"""
        text = """
Analysis done.
**Recommendations**:
* Follow up in 6 months
* Clinical correlation advised
"""
        recs = extract_recommendations(text)
        assert len(recs) >= 1
    
    def test_extract_recommendations_fallback(self):
        """Test fallback extraction using keywords"""
        text = "No abnormalities. I recommend clinical correlation."
        recs = extract_recommendations(text)
        assert len(recs) >= 1


class TestConfiguration:
    """Test configuration values"""
    
    def test_image_config_values(self):
        """Test image config has expected values"""
        assert ImageConfig.MAX_SIZE > 0
        assert ImageConfig.FORMAT == "RGB"
    
    def test_generation_config_values(self):
        """Test generation config has expected values"""
        assert GenerationConfig.MAX_NEW_TOKENS > 0
        assert GenerationConfig.REPETITION_PENALTY >= 1.0
    
    def test_modality_contexts_exist(self):
        """Test that common modalities have contexts"""
        assert "xray" in MODALITY_CONTEXTS
        assert "ct" in MODALITY_CONTEXTS
        assert "mri" in MODALITY_CONTEXTS
