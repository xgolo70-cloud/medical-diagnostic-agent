"""
MedGemma Configuration
Centralized configuration for MedGemma and Gemini services
"""

import os
from typing import Literal

# ================== API Keys ==================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
HF_TOKEN = os.getenv("HF_TOKEN")

# ================== Model Configuration ==================
MEDGEMMA_MODEL = "google/medgemma-1.5-4b-it"
GEMINI_MODEL = "gemini-2.0-flash"

# ================== Processing Configuration ==================
class ImageConfig:
    """Image preprocessing configuration"""
    MAX_SIZE: int = 336  # Maximum dimension for resizing
    RESIZE_METHOD: str = "BILINEAR"  # BILINEAR is faster than LANCZOS
    FORMAT: str = "RGB"

class GenerationConfig:
    """Text generation configuration"""
    MAX_NEW_TOKENS: int = 320
    MIN_NEW_TOKENS: int = 30
    DO_SAMPLE: bool = False
    USE_CACHE: bool = True
    REPETITION_PENALTY: float = 1.2

class DeviceConfig:
    """Device and dtype configuration"""
    PREFER_MPS: bool = True
    PREFER_CUDA: bool = True
    MPS_DTYPE: str = "bfloat16"  # More stable than float16 on Apple Silicon
    CUDA_DTYPE: str = "float16"
    CPU_DTYPE: str = "float32"

# ================== Medical Prompts ==================
MEDICAL_SYSTEM_PROMPT = """You are MedGemma, an expert medical imaging AI assistant. Analyze the provided medical image with clinical precision and provide a comprehensive assessment.

Your analysis should include:
1. **Image Type & Quality**: Identify the imaging modality and assess image quality
2. **Anatomical Structures**: Describe visible anatomical structures
3. **Findings**: Detail any abnormalities, lesions, or notable features
4. **Impression**: Provide a clinical impression
5. **Recommendations**: Suggest follow-up if needed

Be thorough, precise, and use appropriate medical terminology. Always include a disclaimer."""

MODALITY_CONTEXTS = {
    "xray": "This is an X-ray image. Focus on bone structures, lung fields, heart silhouette, and soft tissues.",
    "ct": "This is a CT scan. Analyze density variations, anatomical structures, and any lesions or abnormalities.",
    "mri": "This is an MRI scan. Evaluate soft tissue contrast, signal intensities, and structural integrity.",
    "dermatology": "This is a dermatological image. Assess skin lesion characteristics: ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolution).",
    "pathology": "This is a pathology slide. Analyze cellular morphology, tissue architecture, and any malignant features.",
    "retinal": "This is a retinal fundus image. Examine optic disc, macula, blood vessels, and retinal layers.",
    "fundus": "This is a retinal fundus image. Examine optic disc, macula, blood vessels, and retinal layers.",
}

# ================== Supported Modalities ==================
SUPPORTED_MODALITIES = list(MODALITY_CONTEXTS.keys()) + ["general"]
