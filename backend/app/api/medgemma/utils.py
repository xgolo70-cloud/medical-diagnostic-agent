"""
MedGemma Utilities
Shared utility functions for text extraction, image processing, and prompts
"""

import re
import io
import base64
from typing import List, Tuple, Optional
from PIL import Image

from .config import (
    ImageConfig,
    MODALITY_CONTEXTS,
    MEDICAL_SYSTEM_PROMPT,
)


# ================== Image Utilities ==================

def decode_base64_image(base64_string: str) -> bytes:
    """Decode base64 image string to bytes"""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    return base64.b64decode(base64_string)


def preprocess_image(image_bytes: bytes) -> Image.Image:
    """
    Load and preprocess image for optimal processing.
    Returns a PIL Image resized and converted to RGB.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert(ImageConfig.FORMAT)
    
    # Resize if too large
    if max(image.size) > ImageConfig.MAX_SIZE:
        ratio = ImageConfig.MAX_SIZE / max(image.size)
        new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
        resample = getattr(Image.Resampling, ImageConfig.RESIZE_METHOD, Image.Resampling.BILINEAR)
        image = image.resize(new_size, resample)
    
    return image


def get_image_info(image: Image.Image) -> dict:
    """Get image metadata"""
    return {
        "size": image.size,
        "mode": image.mode,
        "format": image.format,
    }


# ================== Prompt Utilities ==================

def create_analysis_prompt(user_prompt: str, modality: str = "general") -> str:
    """Create an optimized prompt for medical image analysis"""
    context = MODALITY_CONTEXTS.get(modality.lower(), "Analyze this medical image thoroughly.")
    return f"Analyze this {modality} medical image. {context} {user_prompt}"


def create_full_prompt(user_prompt: str, modality: str = "general") -> str:
    """Create full prompt with system instructions"""
    context = MODALITY_CONTEXTS.get(modality.lower(), "Analyze this medical image thoroughly.")
    return f"""{MEDICAL_SYSTEM_PROMPT}

**Imaging Context**: {context}

**User Request**: {user_prompt}

Please provide your detailed analysis:"""


# ================== Text Extraction Utilities ==================

def clean_response(text: str) -> str:
    """Clean up model response by removing artifacts and incomplete sentences"""
    # Remove pad tokens
    text = text.replace("<pad>", "").strip()
    
    # Remove repetition patterns like "Key Findings 1 1..."
    text = re.sub(r'\n\s*Key Findings\s*\d*\s*\d*.*$', '', text, flags=re.DOTALL)
    
    # Remove incomplete sentences at the end
    incomplete_endings = (',', 'However,', 'but', 'and', 'or', 'the', 'a', 'an')
    if text.endswith(incomplete_endings):
        last_period = text.rfind('.')
        if last_period > len(text) // 2:
            text = text[:last_period + 1]
    
    return text.strip()


def extract_findings(text: str) -> List[str]:
    """Extract key findings from the analysis text with improved parsing"""
    findings = []
    
    # Method 1: Look for bullet points with bold headers
    bullet_pattern = r'[\*\-•]\s*\*\*([^*]+)\*\*:?\s*(.+?)(?=\n[\*\-•]|\n\n|\Z)'
    matches = re.findall(bullet_pattern, text, re.DOTALL)
    for header, content in matches:
        finding = f"**{header.strip()}**: {content.strip()[:150]}"
        if len(finding) > 30:
            findings.append(finding)
    
    # Method 2: Look for numbered findings
    if not findings:
        numbered_pattern = r'\d+\.\s*\*\*([^*]+)\*\*:?\s*(.+?)(?=\n\d+\.|\n\n|\Z)'
        matches = re.findall(numbered_pattern, text, re.DOTALL)
        for header, content in matches:
            finding = f"**{header.strip()}**: {content.strip()[:150]}"
            if len(finding) > 30:
                findings.append(finding)
    
    # Method 3: Fallback - look for key medical terms
    if not findings:
        keywords = ["normal", "abnormal", "no evidence", "appears", "shows", "intact", "within limits"]
        sentences = text.replace("\n", " ").split(".")
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and 30 < len(sentence) < 200:
                if any(kw in sentence.lower() for kw in keywords):
                    findings.append(sentence)
    
    # Clean up and deduplicate
    clean_findings = []
    seen = set()
    for f in findings[:5]:
        f_clean = re.sub(r'\s+', ' ', f).strip()
        if f_clean and f_clean not in seen:
            seen.add(f_clean)
            clean_findings.append(f_clean)
    
    return clean_findings if clean_findings else ["Analysis completed - see detailed report above"]


def extract_recommendations(text: str) -> List[str]:
    """Extract recommendations from the analysis text with improved parsing"""
    recommendations = []
    
    # Look for recommendations section
    if "**Recommendation" in text:
        parts = text.split("**Recommendation")
        if len(parts) > 1:
            rec_section = parts[1].split("**")[0]
            lines = rec_section.strip().split("\n")
            for line in lines:
                line = line.strip()
                if line and line.startswith(("*", "-", "•")):
                    recommendations.append(line.lstrip("*-• ").strip())
    
    # Fallback: look for keywords
    if not recommendations:
        keywords = ["recommend", "suggest", "advise", "should", "consider", "follow-up", "correlation"]
        sentences = text.replace("\n", " ").split(".")
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and 20 < len(sentence) < 200:
                if any(kw in sentence.lower() for kw in keywords):
                    recommendations.append(sentence)
    
    return recommendations[:3] if recommendations else ["Consult with a healthcare professional for clinical correlation"]


# ================== Audio Utilities ==================

def decode_base64_audio(base64_string: str) -> bytes:
    """Decode base64 audio string to bytes"""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    return base64.b64decode(base64_string)
