from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

MAX_SIZE = 15 * 1024 * 1024


def _build_fallback_recommendation(disease: str) -> str:
    return (
        f"Deteksi awal menunjukkan {disease}. Tetap pisahkan tanaman yang terinfeksi, kurangi kelembapan pada tajuk, "
        "dan periksa gejala secara berkala. Jika kerusakan meluas, konsultasikan ke penyuluh atau ahli pertanian."
    )


@router.post("/diagnose")
async def diagnose_image(
    file: UploadFile = File(...),
    district_id: str = Form(default="unknown"),
    consent: bool = Form(default=True),
):
    from app.core.state import state

    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar.")

        gambar_bytes = await file.read()
        if len(gambar_bytes) > MAX_SIZE:
            raise HTTPException(status_code=400, detail="File terlalu besar.")

        if not hasattr(state, "infer_onxx") or state.infer_onxx is None:
            raise HTTPException(status_code=500, detail="Model analisis gagal. Coba lagi.")

        hasil_ai = state.infer_onxx.predict(gambar_bytes)
        disease = str(hasil_ai.get("diagnosis", "tanaman-terdeteksi"))
        confidence = float(hasil_ai.get("kepastian", 0.0))

        recommendation = _build_fallback_recommendation(disease)
        if getattr(state, "llm_service", None) and getattr(state, "rag_service", None):
            try:
                retrieved = state.rag_service.retrieve(disease, k=3)
                recommendation = state.llm_service.get_grounded_recommendation(disease, retrieved)
            except Exception as llm_error:
                logger.warning(f"LLM recommendation failed: {llm_error}")

        try:
            if getattr(state, "supabase", None) is not None:
                state.supabase.table("diagnoses").insert({
                    "user_id": "demo-user",
                    "disease_detected": disease,
                    "confidence_score": confidence,
                    "crop_type": "unknown",
                    "image_url": "optional_image_url_here",
                }).execute()
                logger.info("Diagnosis saved to Supabase.")
        except Exception as db_error:
            logger.error(f"Database save failed: {db_error}")

        return {
            "outcome": "terdiagnosis",
            "disease": disease,
            "confidence": round(confidence, 4),
            "recommendation": recommendation,
            "message": f"Deteksi selesai untuk {district_id}.",
            "districtId": district_id,
            "submittedAt": datetime.now(timezone.utc).isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in diagnosis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/diagnose/health")
async def diagnose_health():
    return {"status": "ok"}
