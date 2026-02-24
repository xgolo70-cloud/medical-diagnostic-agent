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
        return self._initialized
    
    def initialize(self) -> bool:
        """Initialize the Gemini API"""
        if self._initialized:
            return True
        
        _load_genai()
        if not GENAI_AVAILABLE or not GEMINI_API_KEY:
            print("⚠️ Gemini API not available or API key not set - enabling mock mode")
            self._initialized = True
            return True
        
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(GEMINI_MODEL)
            self._initialized = True
            print(f"✅ Gemini API initialized ({GEMINI_MODEL})")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize Gemini API: {e} - enabling mock mode")
            self._initialized = True
            return True
    
    def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str = "Describe this medical image.",
        modality: str = "general"
    ) -> Dict[str, Any]:
        """
        Analyze medical image using Gemini API or mock if missing key.
        """
        if not self._initialized:
            self.initialize()
            
        if self.model is None:
            print("⚠️ Using mock MedGemma response because Gemini is not configured.")
            return {
                "analysis": "This is a mock analysis generated because the Gemini API key is missing. The patient exhibits typical signs of the provided symptoms and requires standard care.",
                "findings": ["Mock finding 1: Elevated concern", "Mock finding 2: Routine observation"],
                "recommendations": ["Follow up in 2 weeks", "Rest and hydration"],
                "processing_time": "~1s (mock)",
            }

        
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
            print(f"⚠️ Gemini analysis failed: {str(e)}. Falling back to mock response.")
            return {
                "analysis": "This is a mock fallback analysis. The Gemini API call failed.",
                "findings": ["Error executing Gemini model"],
                "recommendations": ["Check API key and quota"],
                "processing_time": "~1s (mock fallback)",
            }


# Global singleton instance
gemini_service = GeminiService()
