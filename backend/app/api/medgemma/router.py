"""
MedGemma API Router
FastAPI endpoints for medical image analysis and speech-to-text
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List

from .config import SUPPORTED_MODALITIES
from .services import medgemma_service
from .gemini import gemini_service
from .utils import decode_base64_image

# ================== Router Setup ==================
router = APIRouter(prefix="/medgemma", tags=["MedGemma"])


# ================== Pydantic Models ==================

class ImageAnalysisRequest(BaseModel):
    """Request model for image analysis"""
    image_base64: str
    prompt: Optional[str] = "Describe this medical image in detail."
    modality: Optional[str] = "xray"


class ImageAnalysisResponse(BaseModel):
    """Response model for image analysis"""
    analysis: str
    modality: str
    findings: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    processing_time: Optional[str] = None


class ModelStatusResponse(BaseModel):
    """Response model for checking model availability"""
    medgemma_available: bool
    medasr_available: bool
    genai_configured: bool
    message: str


# ================== Endpoints ==================

@router.get("/status", response_model=ModelStatusResponse)
async def get_status():
    """Check the availability of MedGemma and related services"""
    return ModelStatusResponse(
        medgemma_available=medgemma_service.is_available,
        medasr_available=False,  # Coming soon
        genai_configured=gemini_service.is_available,
        message="MedGemma API is operational"
    )


@router.post("/initialize-medgemma")
async def initialize_medgemma():
    """Initialize the MedGemma model (lazy loading)"""
    try:
        success = medgemma_service.initialize()
        if success:
            return {"status": "success", "message": "MedGemma model initialized successfully"}
        else:
            return JSONResponse(
                status_code=503,
                content={"status": "error", "message": "Failed to initialize MedGemma model"}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """
    Analyze a medical image (base64 encoded).
    Uses local MedGemma if available, falls back to Gemini API.
    """
    try:
        # Decode image
        image_bytes = decode_base64_image(request.image_base64)
        modality = request.modality or "xray"
        prompt = request.prompt or "Describe this medical image in detail."
        
        # Validate modality
        if modality.lower() not in SUPPORTED_MODALITIES:
            modality = "general"
        
        # Try local MedGemma first
        if medgemma_service.is_available:
            result = medgemma_service.analyze_image(image_bytes, prompt, modality)
        elif gemini_service.is_available or gemini_service.initialize():
            result = gemini_service.analyze_image(image_bytes, prompt, modality)
        else:
            raise HTTPException(
                status_code=503,
                detail="No analysis service available. Please initialize MedGemma first."
            )
        
        return ImageAnalysisResponse(
            analysis=result["analysis"],
            modality=modality,
            findings=result.get("findings", []),
            recommendations=result.get("recommendations", []),
            processing_time=result.get("processing_time"),
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


@router.post("/analyze-image-upload")
async def analyze_uploaded_image(
    file: UploadFile = File(...),
    prompt: str = Form(default="Describe this medical image in detail."),
    modality: str = Form(default="xray")
):
    """
    Analyze an uploaded medical image file.
    Accepts: JPEG, PNG, WebP, DICOM
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/dicom"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {allowed_types}"
        )
    
    try:
        # Read file content
        image_bytes = await file.read()
        
        # Validate modality
        if modality.lower() not in SUPPORTED_MODALITIES:
            modality = "general"
        
        # Use local MedGemma if available
        if not medgemma_service.is_available:
            print("🔄 Initializing MedGemma on demand...")
            if not medgemma_service.initialize():
                print("⚠️ MedGemma unavailable, trying Gemini...")
        
        if medgemma_service.is_available:
            result = medgemma_service.analyze_image(image_bytes, prompt, modality)
        elif gemini_service.is_available or gemini_service.initialize():
            result = gemini_service.analyze_image(image_bytes, prompt, modality)
        else:
            raise HTTPException(
                status_code=503,
                detail="No analysis service available."
            )
        
        return {
            "filename": file.filename,
            "modality": modality,
            "analysis": result["analysis"],
            "findings": result.get("findings", []),
            "recommendations": result.get("recommendations", []),
            "processing_time": result.get("processing_time", "N/A"),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


# ================== Health Check ==================

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "medgemma_loaded": medgemma_service.is_available,
        "gemini_available": gemini_service.is_available,
    }
