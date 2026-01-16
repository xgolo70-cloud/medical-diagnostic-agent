"""
Gemini API Service
Fast cloud-based fallback for medical image analysis
"""

import io
from typing import Dict, Any, List, Optional

from .config import GEMINI_API_KEY, GEMINI_MODEL, MODALITY_CONTEXTS
from .utils import extract_findings, extract_recommendations

# Lazy import
genai = None
GENAI_AVAILABLE = False


def _load_genai():
    """Lazy load Google GenAI library"""
    global genai, GENAI_AVAILABLE
    if genai is None:
        try:
            import google.generativeai as _genai
            genai = _genai
            GENAI_AVAILABLE = True
        except ImportError:
            GENAI_AVAILABLE = False


class GeminiService:
    """
    Service class for Gemini API inference.
    Fast and reliable cloud-based alternative to local MedGemma.
    """
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if hasattr(self, '_init_done'):
            return
        self._init_done = True
        self.model = None
        self._initialized = False
    
    @property
    def is_available(self) -> bool:
        """Check if Gemini API is configured and available"""
        return self._initialized and self.model is not None
    
    def initialize(self) -> bool:
        """Initialize the Gemini API"""
        if self._initialized:
            return True
        
        _load_genai()
        if not GENAI_AVAILABLE or not GEMINI_API_KEY:
            print("⚠️ Gemini API not available or API key not set")
            return False
        
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(GEMINI_MODEL)
            self._initialized = True
            print(f"✅ Gemini API initialized ({GEMINI_MODEL})")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize Gemini API: {e}")
            return False
    
    def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str = "Describe this medical image.",
        modality: str = "general"
    ) -> Dict[str, Any]:
        """
        Analyze medical image using Gemini API.
        
        Args:
            image_bytes: Raw image bytes
            prompt: User's analysis prompt
            modality: Image modality (xray, ct, mri, etc.)
            
        Returns:
            Dictionary with analysis, findings, and recommendations
        """
        if not self._initialized:
            if not self.initialize():
                raise Exception("Gemini API not initialized")
        
        import PIL.Image
        
        # Create full prompt with medical context
        context = MODALITY_CONTEXTS.get(modality.lower(), "Analyze this medical image.")
        
        system_prompt = """You are an expert medical imaging AI assistant. Analyze the provided medical image carefully and provide:

1. **Detailed Analysis**: Describe what you observe in the image.
2. **Key Findings**: List any notable abnormalities or findings.
3. **Recommendations**: Suggest any follow-up actions if needed.

Be thorough but concise. Use medical terminology appropriately. Always remind that this is for educational purposes only."""
        
        full_prompt = f"{system_prompt}\n\nContext: {context}\n\nUser request: {prompt}"
        
        try:
            # Load image
            image = PIL.Image.open(io.BytesIO(image_bytes))
            
            # Generate response
            response = self.model.generate_content([full_prompt, image])
            analysis_text = response.text if response.text else "No analysis generated."
            
            return {
                "analysis": analysis_text,
                "findings": extract_findings(analysis_text),
                "recommendations": extract_recommendations(analysis_text),
                "processing_time": "~2-5s (cloud)",
            }
            
        except Exception as e:
            raise Exception(f"Gemini analysis failed: {str(e)}")


# Global singleton instance
gemini_service = GeminiService()
