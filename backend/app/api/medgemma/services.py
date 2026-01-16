"""
MedGemma Local Service
Optimized service for local MedGemma model inference on Apple Silicon
"""

import io
import gc
import time
from typing import Optional, Dict, Any

from .config import (
    MEDGEMMA_MODEL,
    HF_TOKEN,
    GenerationConfig,
    DeviceConfig,
)
from .utils import (
    preprocess_image,
    create_analysis_prompt,
    clean_response,
    extract_findings,
    extract_recommendations,
)

# Lazy imports for ML libraries
torch = None
AutoProcessor = None
AutoModelForCausalLM = None
TRANSFORMERS_AVAILABLE = False

def _load_ml_libraries():
    """Lazy load ML libraries"""
    global torch, AutoProcessor, AutoModelForCausalLM, TRANSFORMERS_AVAILABLE
    if torch is None:
        try:
            import torch as _torch
            from transformers import AutoProcessor as _AutoProcessor
            from transformers import AutoModelForCausalLM as _AutoModelForCausalLM
            torch = _torch
            AutoProcessor = _AutoProcessor
            AutoModelForCausalLM = _AutoModelForCausalLM
            TRANSFORMERS_AVAILABLE = True
        except ImportError as e:
            print(f"Failed to import ML libraries: {e}")
            TRANSFORMERS_AVAILABLE = False


class MedGemmaService:
    """
    Optimized service class for local MedGemma inference.
    Runs on Apple Silicon MPS with bfloat16 for optimal speed/stability balance.
    """
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern to ensure only one model instance"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if hasattr(self, '_init_done'):
            return
        self._init_done = True
        self.model = None
        self.processor = None
        self.device = None
        self.dtype = None
        self._initialized = False
    
    @property
    def is_available(self) -> bool:
        """Check if MedGemma is available and initialized"""
        return self._initialized and self.model is not None
    
    def initialize(self) -> bool:
        """Initialize the MedGemma model with optimizations"""
        if self._initialized:
            return True
        
        _load_ml_libraries()
        if not TRANSFORMERS_AVAILABLE:
            return False
        
        start_time = time.time()
        
        try:
            # Determine device and dtype
            if DeviceConfig.PREFER_MPS and torch.backends.mps.is_available():
                self.device = torch.device("mps")
                self.dtype = getattr(torch, DeviceConfig.MPS_DTYPE)
                print(f"🚀 Loading MedGemma on device: MPS with {DeviceConfig.MPS_DTYPE}")
            elif DeviceConfig.PREFER_CUDA and torch.cuda.is_available():
                self.device = torch.device("cuda")
                self.dtype = getattr(torch, DeviceConfig.CUDA_DTYPE)
                print(f"🚀 Loading MedGemma on device: CUDA with {DeviceConfig.CUDA_DTYPE}")
            else:
                self.device = torch.device("cpu")
                self.dtype = getattr(torch, DeviceConfig.CPU_DTYPE)
                print(f"🐢 Loading MedGemma on device: CPU with {DeviceConfig.CPU_DTYPE}")
            
            # Load processor
            self.processor = AutoProcessor.from_pretrained(
                MEDGEMMA_MODEL,
                token=HF_TOKEN,
                use_fast=True
            )
            
            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                MEDGEMMA_MODEL,
                torch_dtype=self.dtype,
                token=HF_TOKEN,
                low_cpu_mem_usage=True,
            )
            
            # Move to device and optimize
            self.model = self.model.to(self.device)
            self.model.eval()
            
            # Disable gradients for inference
            for param in self.model.parameters():
                param.requires_grad = False
            
            # Fix padding token
            if self.processor.tokenizer.pad_token is None:
                self.processor.tokenizer.pad_token = self.processor.tokenizer.eos_token
            
            self._initialized = True
            load_time = time.time() - start_time
            print(f"✅ MedGemma initialized in {load_time:.2f}s")
            return True
            
        except Exception as e:
            print(f"❌ Failed to initialize MedGemma: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str = "Describe this medical image.",
        modality: str = "general"
    ) -> Dict[str, Any]:
        """
        Analyze medical image with speed optimizations.
        
        Args:
            image_bytes: Raw image bytes
            prompt: User's analysis prompt
            modality: Image modality (xray, ct, mri, etc.)
            
        Returns:
            Dictionary with analysis, findings, recommendations, and timing
        """
        if not self._initialized:
            if not self.initialize():
                raise Exception("Failed to initialize MedGemma model")
        
        timings = {}
        total_start = time.time()
        
        # Step 1: Image preprocessing
        step_start = time.time()
        image = preprocess_image(image_bytes)
        original_size = image.size
        timings['preprocessing'] = time.time() - step_start
        print(f"📷 Image preprocessed: {original_size} ({timings['preprocessing']:.2f}s)")
        
        # Step 2: Create prompt and messages
        step_start = time.time()
        simple_prompt = create_analysis_prompt(prompt, modality)
        
        messages = [{
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": simple_prompt}
            ]
        }]
        
        text = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=False
        )
        timings['prompt'] = time.time() - step_start
        
        # Step 3: Tokenization
        step_start = time.time()
        inputs = self.processor(
            text=text,
            images=image,
            return_tensors="pt",
        )
        timings['tokenization'] = time.time() - step_start
        
        # Step 4: Move to device
        step_start = time.time()
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        if 'pixel_values' in inputs and self.dtype != torch.float32:
            inputs['pixel_values'] = inputs['pixel_values'].to(self.dtype)
        timings['transfer'] = time.time() - step_start
        
        input_tokens = inputs["input_ids"].shape[1]
        print(f"🔢 Input tokens: {input_tokens}")
        
        # Step 5: Generation
        step_start = time.time()
        print(f"🔄 Generating on {self.device}...")
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=GenerationConfig.MAX_NEW_TOKENS,
                min_new_tokens=GenerationConfig.MIN_NEW_TOKENS,
                do_sample=GenerationConfig.DO_SAMPLE,
                use_cache=GenerationConfig.USE_CACHE,
                repetition_penalty=GenerationConfig.REPETITION_PENALTY,
                pad_token_id=self.processor.tokenizer.eos_token_id,
                eos_token_id=self.processor.tokenizer.eos_token_id,
            )
        
        timings['generation'] = time.time() - step_start
        output_tokens = outputs[0].shape[0] - input_tokens
        tokens_per_sec = output_tokens / timings['generation'] if timings['generation'] > 0 else 0
        print(f"⚡ Generated {output_tokens} tokens in {timings['generation']:.2f}s ({tokens_per_sec:.1f} tok/s)")
        
        # Step 6: Decode and clean
        step_start = time.time()
        generated_tokens = outputs[0][input_tokens:]
        response = self.processor.decode(generated_tokens, skip_special_tokens=True).strip()
        response = clean_response(response)
        timings['decoding'] = time.time() - step_start
        
        # Cleanup memory
        del inputs, outputs
        gc.collect()
        if self.device.type == "mps":
            torch.mps.empty_cache()
        
        # Final timing
        total_time = time.time() - total_start
        timings['total'] = total_time
        
        self._print_timing_breakdown(timings)
        
        if not response:
            response = "Analysis completed but no detailed findings were generated."
        
        return {
            "analysis": response,
            "findings": extract_findings(response),
            "recommendations": extract_recommendations(response),
            "processing_time": f"{total_time:.2f}s",
            "timings": timings,
        }
    
    def _print_timing_breakdown(self, timings: Dict[str, float]):
        """Print detailed timing breakdown"""
        print(f"\n📊 TIMING BREAKDOWN:")
        print(f"   Preprocessing: {timings.get('preprocessing', 0):.2f}s")
        print(f"   Tokenization:  {timings.get('tokenization', 0):.2f}s")
        print(f"   Device xfer:   {timings.get('transfer', 0):.2f}s")
        print(f"   Generation:    {timings.get('generation', 0):.2f}s ← Main")
        print(f"   Decoding:      {timings.get('decoding', 0):.2f}s")
        print(f"   ─────────────────────────")
        print(f"   TOTAL:         {timings.get('total', 0):.2f}s\n")


# Global singleton instance
medgemma_service = MedGemmaService()
