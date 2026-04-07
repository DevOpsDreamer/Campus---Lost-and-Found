from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
from gliner import GLiNER
import os
import logging

# Configure logging for audit trails (DPDP Act 2023 Compliance)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("VLV-Microservice")

app = FastAPI(title="CampusTrace VLV Service", version="1.0.0", description="100% On-Premises Vision-Language & NLP Verification")

# -------------------------------------------------------------------
# Model Initialization (Edge-Deployable Open-Source Models)
# -------------------------------------------------------------------
# VLM: Moondream2 (1.8B parameters)
VLM_MODEL_ID = "vikhyatk/moondream2"
VLM_REVISION = "2024-05-20"

# NLP: GLiNER for Named Entity Recognition / Attribute Extraction
GLINER_MODEL_ID = "urchade/gliner_medium-v2.1"

# Global variables for models
vlm_model = None
vlm_tokenizer = None
gliner_model = None

@app.on_event("startup")
async def load_models():
    global vlm_model, vlm_tokenizer, gliner_model
    
    # 1. Load VLM
    logger.info(f"Loading VLM model: {VLM_MODEL_ID}...")
    try:
        vlm_model = AutoModelForCausalLM.from_pretrained(
            VLM_MODEL_ID, trust_remote_code=True, revision=VLM_REVISION, torch_dtype=torch.float16
        )
        if torch.cuda.is_available():
            vlm_model = vlm_model.to("cuda")
            
        vlm_tokenizer = AutoTokenizer.from_pretrained(VLM_MODEL_ID, revision=VLM_REVISION)
        logger.info("VLM loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load VLM: {e}")

    # 2. Load GLiNER
    logger.info(f"Loading GLiNER model: {GLINER_MODEL_ID}...")
    try:
        gliner_model = GLiNER.from_pretrained(GLINER_MODEL_ID)
        if torch.cuda.is_available():
            gliner_model = gliner_model.to("cuda")
        logger.info("GLiNER loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load GLiNER: {e}")

# -------------------------------------------------------------------
# Pydantic Schemas (Strict Typing)
# -------------------------------------------------------------------
class VerificationRequest(BaseModel):
    image_path: str = Field(..., description="Absolute path to the unblurred image on the secure local volume")
    secret_key_challenge: str = Field(..., description="The user's text description of the hidden attribute")

class VerificationResponse(BaseModel):
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Semantic match confidence score (0.0 to 1.0)")
    reasoning: str = Field(..., description="The VLM's reasoning for the score")
    extracted_attributes: list[dict] = Field(default=[], description="Attributes extracted by GLiNER from the secret key")
    is_error: bool = False

# -------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "vlm_loaded": vlm_model is not None,
        "gliner_loaded": gliner_model is not None
    }

@app.post("/api/v1/verify-claim", response_model=VerificationResponse)
async def verify_claim(req: VerificationRequest):
    """
    Secure POST endpoint to verify a claim using the local VLM and GLiNER.
    """
    logger.info(f"Received verification request for image: {req.image_path}")
    
    if vlm_model is None or vlm_tokenizer is None or gliner_model is None:
        raise HTTPException(status_code=503, detail="AI Models are not currently fully loaded.")

    if not os.path.exists(req.image_path):
        logger.error(f"Image not found at path: {req.image_path}")
        raise HTTPException(status_code=404, detail="Secure image file not found on local volume.")

    try:
        # 1. Extract Attributes using GLiNER from the user's secret key
        labels = ["color", "brand", "damage", "material", "unique_identifier", "item_type"]
        entities = gliner_model.predict_entities(req.secret_key_challenge, labels)
        extracted_attributes = [{"entity": ent["text"], "label": ent["label"]} for ent in entities]
        logger.info(f"GLiNER extracted attributes: {extracted_attributes}")

        # 2. Load Image
        image = Image.open(req.image_path).convert("RGB")
        
        # 3. Construct Prompt for the VLM
        prompt = (
            f"A user claims this item belongs to them and provided this secret description: "
            f"'{req.secret_key_challenge}'. "
            f"Does the image contain this specific detail? "
            f"Answer 'Yes' or 'No', and provide a confidence score between 0.0 and 1.0, followed by your reasoning."
        )
        
        # 4. Run Inference (Moondream2 specific encoding)
        enc_image = vlm_model.encode_image(image)
        response_text = vlm_model.answer_question(enc_image, prompt, vlm_tokenizer)
        
        # 5. Parse the VLM Output
        confidence_score = 0.0
        if "yes" in response_text.lower():
            confidence_score = 0.88 
        elif "no" in response_text.lower():
            confidence_score = 0.20
        else:
            confidence_score = 0.60 # Ambiguous/Provisional
            
        logger.info(f"Verification complete. Score: {confidence_score}")
        
        return VerificationResponse(
            confidence_score=confidence_score,
            reasoning=response_text,
            extracted_attributes=extracted_attributes
        )

    except Exception as e:
        logger.error(f"Error during AI inference: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal AI inference error.")
