from fastapi import APIRouter, HTTPException, UploadFile, File, status
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_SIZE = 15 * 1024 * 1024 #dibikin disini aja biar gampang nanti tinggal call MAX_SIZE

@router.post("/predict")
async def predict_diagnosis(file: UploadFile = File(...)):
    from app.core.state import state 
    try:
       #after receiving, cek dulu gambar apa bukan
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar.")
        
        gambar_bytes = await file.read()
        
        if len(gambar_bytes) > MAX_SIZE:
            raise HTTPException(status_code=400, detail="File terlalu besar.")

        # We just ask the 'infer_onxx' engine we stored in the global state.
        if not hasattr(state, 'infer_onxx') or state.infer_onxx is None:
            raise HTTPException(status_code=500, detail="Model analisis gagal. Coba lagi.")

        hasil_ai = state.infer_onxx.predict(gambar_bytes)

        try:
            data_diagnosis = {
               "user_id": "235",  # Replace with actual user ID if available
                "disease_detected": hasil_ai["diagnosis"],
                "confidence_score": hasil_ai["kepastian"],
                "crop_type": hasil_ai["crop_type"],
                "image_url": "optional_image_url_here",  # Replace with actual image URL if available
            }
            
            state.supabase.table("diagnoses").insert(data_diagnosis).execute()
            logger.info("Diagnosis saved to Supabase.")
        except Exception as db_error:
            logger.error(f"Database save failed: {db_error}")

        return {
            "status": "success",
            "diagnoses": hasil_ai["diagnosis"],
            "kepastian": hasil_ai["kepastian"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in diagnosis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))