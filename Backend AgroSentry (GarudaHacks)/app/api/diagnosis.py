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
                "penyakit": hasil_ai["penyakit"],
                "kepastian": hasil_ai["kepastian"],
                # "user_id": "optional_user_id_here", 
                # "image_url": "we'll handle storage in the next step"
            }

            state.supabase.table()
            
            # This one line sends the data to the 'diagnoses' table!
            state.supabase.table("diagnoses").insert(data_diagnosis).execute()
            logger.info("Diagnosis saved to Supabase.")
            
        except Exception as db_error:
            logger.error(f"Database save failed: {db_error}")

        return {
            "status": "success",
            "diagnoses": hasil_ai["diagnoses"],
            "kepastian": hasil_ai["kepastian"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in diagnosis: {e}")
        raise HTTPException(status_code=500, detail=str(e))