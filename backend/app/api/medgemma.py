"""
MedGemma 1.5 & MedASR Integration API
Provides endpoints for medical image analysis and medical speech-to-text
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
from pydantic import BaseModel
import base64
import io
import os

# Import Google Generative AI (Gemini API) - PRIMARY ENGINE
import google.generativeai as genai
GENAI_AVAILABLE = True

# Local MedGemma imports (optional, for future use)
try:
    from transformers import AutoModelForCausalLM, AutoTokenizer, AutoProcessor
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

router = APIRouter()

# Configuration - All sensitive tokens from environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MEDGEMMA_MODEL = "google/medgemma-1.5-4b-it"  # Hugging Face model ID
# Hugging Face Token for Gated Model Access - MUST be set via environment variable
HF_TOKEN = os.getenv("HF_TOKEN")

# Validate required tokens at startup
if not HF_TOKEN:
    print("⚠️ WARNING: HF_TOKEN environment variable is not set. MedGemma will not work.")
if not GEMINI_API_KEY:
    print("⚠️ WARNING: GEMINI_API_KEY environment variable is not set. Gemini fallback will not work.")

# ================== Pydantic Schemas ==================

class ImageAnalysisRequest(BaseModel):
    """Request model for image analysis"""
    image_base64: str
    prompt: Optional[str] = "Describe this medical image in detail, including any notable findings."
    modality: Optional[str] = "xray"  # xray, ct, mri, dermatology, pathology

class ImageAnalysisResponse(BaseModel):
    """Response model for image analysis"""
    analysis: str
    confidence: Optional[float] = None
    modality: str
    findings: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None

class SpeechToTextRequest(BaseModel):
    """Request model for speech-to-text"""
    audio_base64: str
    language: Optional[str] = "en"

class SpeechToTextResponse(BaseModel):
    """Response model for speech-to-text"""
    transcription: str
    confidence: Optional[float] = None
    medical_terms_detected: Optional[List[str]] = None

class ModelStatusResponse(BaseModel):
    """Response model for checking model availability"""
    medgemma_available: bool
    medasr_available: bool
    genai_configured: bool
    message: str

# ================== Helper Functions ==================

def decode_base64_image(base64_string: str) -> bytes:
    """Decode base64 image string to bytes"""
    # Remove data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    return base64.b64decode(base64_string)

def decode_base64_audio(base64_string: str) -> bytes:
    """Decode base64 audio string to bytes"""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    return base64.b64decode(base64_string)

def get_modality_prompt(modality: str, user_prompt: str) -> str:
    """
    Wraps the user prompt with context specific to the medical imaging modality.
    """
    base_prompt = user_prompt if user_prompt else "Describe this medical image in detail."
    
    modality_contexts = {
        "xray": "Analyze this X-ray image for any abnormalities, fractures, or signs of disease.",
        "ct": "Examine this CT scan slice for lesions, tumors, or structural anomalies.",
        "mri": "Review this MRI scan for soft tissue damage, neurological issues, or other findings.",
        "dermatology": "Assess this skin lesion for characteristics of dermatological conditions.",
        "pathology": "Evaluate this pathology slide for cellular abnormalities or signs of malignancy.",
        "retinal": "Inspect this retinal fundus image for signs of diabetic retinopathy or glaucoma."
    }
    
    context = modality_contexts.get(modality.lower(), "Analyze this medical image.")
    return f"{base_prompt}\nContext: {context}"

# ================== Gemini API Integration (PRIMARY - FAST) ==================

class GeminiService:
    """Service class for Gemini API inference - Fast and Reliable"""
    
    def __init__(self):
        self._initialized = False
        self.model = None
        
    def initialize(self):
        """Initialize the Gemini API"""
        if self._initialized:
            return True
            
        if not GENAI_AVAILABLE or not GEMINI_API_KEY:
            print("Gemini API not available or API key not set")
            return False
            
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
            self._initialized = True
            print("Gemini API initialized successfully")
            return True
        except Exception as e:
            print(f"Failed to initialize Gemini API: {e}")
            return False
    
    def analyze_image(self, image_bytes: bytes, prompt: str, modality: str = "general") -> dict:
        """Analyze medical image using Gemini API"""
        if not self._initialized:
            if not self.initialize():
                raise Exception("Gemini API not initialized")
        
        # Create the full prompt with medical context
        full_prompt = get_modality_prompt(modality, prompt)
        
        # Add medical analysis instructions
        system_prompt = """You are an expert medical imaging AI assistant. Analyze the provided medical image carefully and provide:

1. **Detailed Analysis**: Describe what you observe in the image.
2. **Key Findings**: List any notable abnormalities or findings (if any).
3. **Recommendations**: Suggest any follow-up actions if needed.

Be thorough but concise. Use medical terminology appropriately. Always remind that this is for educational purposes only."""

        combined_prompt = f"{system_prompt}\n\n{full_prompt}"
        
        try:
            # Create image part for Gemini
            import PIL.Image
            image = PIL.Image.open(io.BytesIO(image_bytes))
            
            # Generate response
            response = self.model.generate_content([combined_prompt, image])
            
            analysis_text = response.text if response.text else "No analysis generated."
            
            return {
                "analysis": analysis_text,
                "findings": self._extract_findings(analysis_text),
                "recommendations": self._extract_recommendations(analysis_text)
            }
        except Exception as e:
            raise Exception(f"Gemini analysis failed: {str(e)}")
    
    def _extract_findings(self, text: str) -> list:
        """Extract key findings from analysis text"""
        findings = []
        if "finding" in text.lower() or "abnormal" in text.lower():
            lines = text.split('\n')
            for line in lines:
                if any(keyword in line.lower() for keyword in ['finding', 'observed', 'noted', 'shows', 'reveals']):
                    findings.append(line.strip())
        return findings[:5] if findings else ["No specific findings extracted"]
    
    def _extract_recommendations(self, text: str) -> list:
        """Extract recommendations from analysis text"""
        recommendations = []
        if "recommend" in text.lower() or "suggest" in text.lower():
            lines = text.split('\n')
            for line in lines:
                if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'follow-up', 'consider']):
                    recommendations.append(line.strip())
        return recommendations[:3] if recommendations else ["Consult with a healthcare professional"]

# Global Gemini service instance
gemini_service = GeminiService()

# ================== MedGemma Integration (LOCAL - OPTIMIZED) ==================

# Medical prompt templates for better analysis
MEDICAL_SYSTEM_PROMPT = """You are MedGemma, an expert medical imaging AI assistant. Analyze the provided medical image with clinical precision and provide a comprehensive assessment.

Your analysis should include:
1. **Image Type & Quality**: Identify the imaging modality and assess image quality
2. **Anatomical Structures**: Describe visible anatomical structures
3. **Findings**: Detail any abnormalities, lesions, or notable features
4. **Impression**: Provide a clinical impression
5. **Recommendations**: Suggest follow-up if needed

Be thorough, precise, and use appropriate medical terminology. Always include a disclaimer."""

class MedGemmaService:
    """Optimized service class for MedGemma inference"""
    
    def __init__(self):
        self.model = None
        self.processor = None
        self.tokenizer = None
        self._initialized = False
        self.device = None
        self.dtype = None
        
    def initialize(self):
        """Initialize the MedGemma model with optimizations"""
        if self._initialized:
            return True
            
        if not TRANSFORMERS_AVAILABLE:
            return False
        
        import time
        start_time = time.time()
            
        try:
            # Use MPS with bfloat16 - more stable than float16 on Apple Silicon
            if torch.backends.mps.is_available():
                self.device = torch.device("mps")
                self.dtype = torch.bfloat16
                print(f"🚀 Loading MedGemma on device: MPS with bfloat16")
            elif torch.cuda.is_available():
                self.device = torch.device("cuda")
                self.dtype = torch.float16
                print(f"🚀 Loading MedGemma on device: CUDA with float16")
            else:
                self.device = torch.device("cpu")
                self.dtype = torch.float32
                print(f"🐢 Loading MedGemma on device: CPU with float32 (slower)")

            # Load processor with fast tokenizer
            self.processor = AutoProcessor.from_pretrained(
                MEDGEMMA_MODEL, 
                token=HF_TOKEN,
                use_fast=True
            )
            
            # Load model with optimizations
            self.model = AutoModelForCausalLM.from_pretrained(
                MEDGEMMA_MODEL,
                torch_dtype=self.dtype,
                token=HF_TOKEN,
                low_cpu_mem_usage=True,
            )
            
            # Move model to device and set to eval mode
            self.model = self.model.to(self.device)
            self.model.eval()
            
            # Disable gradient computation for inference
            for param in self.model.parameters():
                param.requires_grad = False
            
            # Fix padding token issue
            if self.processor.tokenizer.pad_token is None:
                self.processor.tokenizer.pad_token = self.processor.tokenizer.eos_token
            
            self._initialized = True
            load_time = time.time() - start_time
            print(f"✅ MedGemma initialized successfully in {load_time:.2f}s!")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize MedGemma: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _create_optimized_prompt(self, user_prompt: str, modality: str = "general") -> str:
        """Create an optimized prompt for medical image analysis"""
        modality_context = {
            "xray": "This is an X-ray image. Focus on bone structures, lung fields, heart silhouette, and soft tissues.",
            "ct": "This is a CT scan. Analyze density variations, anatomical structures, and any lesions or abnormalities.",
            "mri": "This is an MRI scan. Evaluate soft tissue contrast, signal intensities, and structural integrity.",
            "dermatology": "This is a dermatological image. Assess skin lesion characteristics: ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolution).",
            "pathology": "This is a pathology slide. Analyze cellular morphology, tissue architecture, and any malignant features.",
            "retinal": "This is a retinal fundus image. Examine optic disc, macula, blood vessels, and retinal layers."
        }
        
        context = modality_context.get(modality.lower(), "Analyze this medical image thoroughly.")
        
        return f"""{MEDICAL_SYSTEM_PROMPT}

**Imaging Context**: {context}

**User Request**: {user_prompt}

Please provide your detailed analysis:"""
    
    def analyze_image(self, image_bytes: bytes, prompt: str, modality: str = "general") -> dict:
        """Analyze medical image with SPEED optimizations"""
        import time
        import gc
        
        timings = {}
        total_start = time.time()
        
        if not self._initialized:
            if not self.initialize():
                raise Exception("Failed to initialize MedGemma model")
        
        from PIL import Image
        
        # === STEP 1: Image Loading & Preprocessing ===
        step_start = time.time()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        original_size = image.size
        
        # AGGRESSIVE resize for speed (336px is still good for medical imaging)
        max_size = 336
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.BILINEAR)  # BILINEAR is faster than LANCZOS
        
        timings['image_preprocessing'] = time.time() - step_start
        print(f"📷 Image: {original_size} → {image.size} ({timings['image_preprocessing']:.2f}s)")
        
        # === STEP 2: Prompt Creation (SIMPLIFIED for speed) ===
        step_start = time.time()
        # Use shorter prompt to reduce token count
        simple_prompt = f"Analyze this {modality} medical image. {prompt}"
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": simple_prompt}
                ]
            }
        ]

        text = self.processor.apply_chat_template(
            messages, 
            add_generation_prompt=True,
            tokenize=False
        )
        timings['prompt_creation'] = time.time() - step_start
        
        # === STEP 3: Tokenization ===
        step_start = time.time()
        inputs = self.processor(
            text=text,
            images=image,
            return_tensors="pt",
        )
        timings['tokenization'] = time.time() - step_start
        
        # === STEP 4: Move to Device ===
        step_start = time.time()
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        if 'pixel_values' in inputs and self.dtype != torch.float32:
            inputs['pixel_values'] = inputs['pixel_values'].to(self.dtype)
        timings['device_transfer'] = time.time() - step_start
        
        input_token_count = inputs["input_ids"].shape[1]
        print(f"🔢 Input tokens: {input_token_count}")
        
        # === STEP 5: Generation (THE MAIN BOTTLENECK) ===
        step_start = time.time()
        print(f"🔄 Generating on {self.device} (MPS GPU)...")
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=320,        # Increased to allow complete responses
                min_new_tokens=30,
                do_sample=False,
                use_cache=True,
                repetition_penalty=1.2,    # Increased to prevent all repetition
                pad_token_id=self.processor.tokenizer.eos_token_id,
                eos_token_id=self.processor.tokenizer.eos_token_id,
            )
        
        timings['generation'] = time.time() - step_start
        output_token_count = outputs[0].shape[0] - input_token_count
        tokens_per_sec = output_token_count / timings['generation'] if timings['generation'] > 0 else 0
        print(f"⚡ Generated {output_token_count} tokens in {timings['generation']:.2f}s ({tokens_per_sec:.1f} tok/s)")
        
        # === STEP 6: Decoding & Cleanup ===
        step_start = time.time()
        generated_tokens = outputs[0][input_token_count:]
        response = self.processor.decode(generated_tokens, skip_special_tokens=True).strip()
        response = response.replace("<pad>", "").strip()
        
        # === POST-PROCESSING: Clean up repetitions and incomplete sentences ===
        # Remove common repetition patterns
        import re
        # Remove "Key Findings 1 1..." type repetitions
        response = re.sub(r'\n\s*Key Findings\s*\d*\s*\d*.*$', '', response, flags=re.DOTALL)
        # Remove incomplete sentences at the end (sentences ending with "However," or similar)
        if response.endswith((',', 'However,', 'but', 'and', 'or', 'the', 'a', 'an')):
            # Find the last complete sentence
            last_period = response.rfind('.')
            if last_period > len(response) // 2:  # Keep at least half the response
                response = response[:last_period + 1]
        
        response = response.strip()
        timings['decoding'] = time.time() - step_start
        
        # === CLEANUP to prevent memory pressure ===
        del inputs, outputs
        gc.collect()
        if self.device.type == "mps":
            torch.mps.empty_cache()
        
        # === FINAL TIMING ===
        total_time = time.time() - total_start
        timings['total'] = total_time
        
        print(f"\n📊 TIMING BREAKDOWN:")
        print(f"   Image prep:    {timings['image_preprocessing']:.2f}s")
        print(f"   Tokenization:  {timings['tokenization']:.2f}s")
        print(f"   Device xfer:   {timings['device_transfer']:.2f}s")
        print(f"   Generation:    {timings['generation']:.2f}s ← Main bottleneck")
        print(f"   Decoding:      {timings['decoding']:.2f}s")
        print(f"   ─────────────────────────")
        print(f"   TOTAL:         {total_time:.2f}s")
        print(f"✅ Analysis complete ({len(response)} chars)\n")
        if not response:
            response = "Analysis completed but no detailed findings were generated. Please try with a clearer image or different prompt."
        
        return {
            "analysis": response,
            "findings": self._extract_findings(response),
            "recommendations": self._extract_recommendations(response),
            "processing_time": f"{total_time:.2f}s"
        }
    
    def _extract_findings(self, text: str) -> list:
        """Extract key findings from the analysis text with improved parsing"""
        import re
        findings = []
        
        # Method 1: Look for bullet points with bold headers
        # Pattern: * **Header:** content OR - **Header:** content
        bullet_pattern = r'[\*\-•]\s*\*\*([^*]+)\*\*:?\s*(.+?)(?=\n[\*\-•]|\n\n|\Z)'
        matches = re.findall(bullet_pattern, text, re.DOTALL)
        for header, content in matches:
            finding = f"**{header.strip()}**: {content.strip()[:150]}"
            if len(finding) > 30:
                findings.append(finding)
        
        # Method 2: Look for numbered findings (1. **Header:** content)
        if not findings:
            numbered_pattern = r'\d+\.\s*\*\*([^*]+)\*\*:?\s*(.+?)(?=\n\d+\.|\n\n|\Z)'
            matches = re.findall(numbered_pattern, text, re.DOTALL)
            for header, content in matches:
                finding = f"**{header.strip()}**: {content.strip()[:150]}"
                if len(finding) > 30:
                    findings.append(finding)
        
        # Method 3: Fallback - look for key medical terms in sentences
        if not findings:
            keywords = ["normal", "abnormal", "no evidence", "appears", "shows", "intact", "within limits"]
            sentences = text.replace("\n", " ").split(".")
            for sentence in sentences:
                sentence = sentence.strip()
                if sentence and len(sentence) > 30 and len(sentence) < 200:
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
    
    def _extract_recommendations(self, text: str) -> list:
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
                if sentence and any(kw in sentence.lower() for kw in keywords):
                    if len(sentence) > 20:
                        recommendations.append(sentence)
        
        return recommendations[:3]

# Singleton instance
medgemma_service = MedGemmaService()

# ================== Fallback with Gemini API ==================

async def analyze_with_gemini_api(image_bytes: bytes, prompt: str, modality: str) -> dict:
    """Fallback to Gemini API for image analysis when local MedGemma is unavailable"""
    if not GENAI_AVAILABLE or not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Medical image analysis is not available. Please configure GEMINI_API_KEY or install MedGemma locally."
        )
    
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Use Gemini 2.0 Flash (Fast & Multimodal)
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
    except Exception as e:
        print(f"Error init model: {e}")
        # Fallback to older flash if 2.0 fails for some reason
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
        except:
            raise e
    
    # Prepare the full prompt with medical context
    full_prompt = get_modality_prompt(modality, prompt)
    
    # Add medical disclaimer
    full_prompt += "\n\nIMPORTANT: This analysis is for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment."
    
    # Create the image part
    import PIL.Image as PILImage
    image = PILImage.open(io.BytesIO(image_bytes))
    
    # Generate content
    response = model.generate_content([full_prompt, image])
    
    analysis_text = response.text
    
    return {
        "analysis": analysis_text,
        "findings": extract_key_points(analysis_text, "findings"),
        "recommendations": extract_key_points(analysis_text, "recommendations")
    }

def extract_key_points(text: str, point_type: str) -> List[str]:
    """Extract key points from analysis text"""
    points = []
    
    if point_type == "findings":
        keywords = ["found", "observed", "noted", "shows", "reveals", "indicates", "present", "visible"]
    else:  # recommendations
        keywords = ["recommend", "suggest", "advise", "should", "consider", "follow-up", "further"]
    
    sentences = text.replace("\n", " ").split(".")
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and any(kw in sentence.lower() for kw in keywords):
            points.append(sentence)
    
    return points[:5]

# ================== API Endpoints ==================

@router.get("/status", response_model=ModelStatusResponse)
async def check_model_status():
    """Check the availability of MedGemma and MedASR models"""
    medgemma_ready = TRANSFORMERS_AVAILABLE and medgemma_service._initialized
    genai_ready = GENAI_AVAILABLE and bool(GEMINI_API_KEY)
    
    if medgemma_ready:
        message = "MedGemma is loaded and ready for inference."
    elif genai_ready:
        message = "Using Gemini API as fallback for image analysis."
    else:
        message = "No AI model is currently available. Please configure GEMINI_API_KEY or install transformers."
    
    return ModelStatusResponse(
        medgemma_available=medgemma_ready,
        medasr_available=False,  # MedASR requires separate setup
        genai_configured=genai_ready,
        message=message
    )

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_medical_image(request: ImageAnalysisRequest):
    """
    Analyze a medical image using MedGemma 1.5
    
    Supported modalities:
    - xray: Chest X-rays
    - ct: CT scans
    - mri: MRI scans
    - dermatology: Skin lesions
    - pathology: Histopathology slides
    - fundus: Retinal images
    """
    try:
        # Decode the image
        image_bytes = decode_base64_image(request.image_base64)
        
        # Get the full prompt with modality context
        full_prompt = get_modality_prompt(request.modality, request.prompt)
        
        # Try local MedGemma first (Primary Goal)
        if not medgemma_service._initialized:
            print("Initializing MedGemma model on demand...")
            success = medgemma_service.initialize()
            if not success:
                print("Failed to initialize MedGemma. Falling back to Gemini if available.")
    
        if medgemma_service._initialized:
            result = medgemma_service.analyze_image(image_bytes, full_prompt)
        else:
            # Fallback to Gemini API only if MedGemma completely fails
            result = await analyze_with_gemini_api(
                image_bytes, 
                request.prompt, 
                request.modality
            )
        
        return ImageAnalysisResponse(
            analysis=result["analysis"],
            modality=request.modality,
            findings=result.get("findings", []),
            recommendations=result.get("recommendations", [])
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
    Analyze an uploaded medical image file
    Accepts: JPEG, PNG, DICOM
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/dicom"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: {allowed_types}"
        )
    
    try:
        # Read file content
        image_bytes = await file.read()
        
        # Get the base prompt
        base_prompt = prompt if prompt else "Provide a detailed analysis of this medical image."
        
        # Try local MedGemma first (Primary Goal)
        if not medgemma_service._initialized:
            print("🔄 Initializing MedGemma model on demand...")
            success = medgemma_service.initialize()
            if not success:
                print("⚠️ Failed to initialize MedGemma. Falling back to Gemini.")

        if medgemma_service._initialized:
            # Pass modality for optimized prompting
            result = medgemma_service.analyze_image(image_bytes, base_prompt, modality)
        else:
            # Fallback to Gemini API
            result = await analyze_with_gemini_api(image_bytes, prompt, modality)
        
        return {
            "filename": file.filename,
            "modality": modality,
            "analysis": result["analysis"],
            "findings": result.get("findings", []),
            "recommendations": result.get("recommendations", []),
            "processing_time": result.get("processing_time", "N/A")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@router.post("/transcribe-audio", response_model=SpeechToTextResponse)
async def transcribe_medical_audio(request: SpeechToTextRequest):
    """
    Transcribe medical audio using MedASR
    
    Note: MedASR integration requires additional setup.
    This endpoint provides a placeholder that can be connected to the MedASR model.
    """
    # MedASR is not yet integrated - provide informative response
    raise HTTPException(
        status_code=501,
        detail="MedASR integration is pending. Please visit https://developers.google.com/health-ai-developer-foundations/medasr/ for setup instructions."
    )

@router.post("/transcribe-audio-upload")
async def transcribe_uploaded_audio(
    file: UploadFile = File(...),
    language: str = Form(default="en")
):
    """
    Transcribe an uploaded medical audio file
    Accepts: WAV, MP3, M4A, WEBM
    """
    # Validate file type
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp4", "audio/webm", "audio/x-wav"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio type: {file.content_type}. Allowed types: {allowed_types}"
        )
    
    # MedASR is not yet integrated
    raise HTTPException(
        status_code=501,
        detail="MedASR integration is pending. Please visit https://developers.google.com/health-ai-developer-foundations/medasr/ for setup instructions."
    )

@router.post("/initialize-medgemma")
async def initialize_medgemma_model():
    """
    Manually trigger MedGemma model initialization
    This can take several minutes on first run as it downloads the model.
    """
    if not TRANSFORMERS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="transformers library is not installed. Run: pip install transformers torch"
        )
    
    try:
        success = medgemma_service.initialize()
        if success:
            return {"status": "success", "message": "MedGemma model initialized successfully"}
        else:
            return {"status": "failed", "message": "Failed to initialize MedGemma model"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Initialization failed: {str(e)}")
