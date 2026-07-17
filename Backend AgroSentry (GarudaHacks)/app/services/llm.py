from openai import OpenAI
from app.core.config import settings
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


class LLMService:
    """
    Layanan LLM untuk membantu petani Indonesia memahami diagnosis penyakit
    tanaman mereka, berdasarkan dokumen resmi yang diambil melalui RAG.
    """
    def __init__(self, model_name: str, is_gemini: bool = True):
        self.model_name = model_name
        self.is_gemini = is_gemini
        self.client = self._initialize_client()

    def _initialize_client(self) -> OpenAI:
        api_key: str
        base_url: Optional[str] = None

        if self.is_gemini:
            api_key = settings.gemini_api_key
            base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
            if not api_key:
                logger.warning("GEMINI_API_KEY tidak diatur di .env. Pemanggilan LLM mungkin gagal.")
        else:
            api_key = settings.openai_api_key
            if not api_key:
                logger.warning("OPENAI_API_KEY tidak diatur di .env. Pemanggilan LLM mungkin gagal.")

        if not api_key:
            logger.error(f"API key untuk {self.model_name} tidak ditemukan. Periksa file .env Anda.")
        
        print(f"DEBUG: is_gemini={self.is_gemini}, api_key_present={bool(api_key)}, api_key_prefix={api_key[:8] if api_key else 'EMPTY'}")

        return OpenAI(api_key=api_key, base_url=base_url)

    def get_grounded_recommendation(self, diagnosis: str, retrieved_docs: List[str]) -> str:
        """
        Menghasilkan rekomendasi berdasarkan diagnosis dan dokumen resmi yang diambil.

        Args:
            diagnosis: Diagnosis utama (hasil dari model ONNX).
            retrieved_docs: Daftar potongan dokumen relevan dari RAGService.

        Returns:
            String berisi rekomendasi dari LLM, dalam Bahasa Indonesia.
        """
        context = "\n".join(retrieved_docs) if retrieved_docs else "Tidak ada dokumen resmi yang cocok ditemukan."

        prompt = f"""Kamu adalah asisten pertanian yang membantu petani Indonesia memahami penyakit tanaman mereka.

Diagnosis: {diagnosis}

Dokumen resmi terkait:
{context}

Berikan penjelasan dalam Bahasa Indonesia yang mudah dipahami petani, mencakup:
1. Apa penyakit ini
2. Penyebabnya
3. Cara mengatasinya
4. Cara mencegahnya di masa depan

Jawaban singkat dan praktis, maksimal 200 kata."""

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Gagal mendapatkan rekomendasi dari LLM: {e}")
            return "Rekomendasi tidak dapat dibuat saat ini. Silakan periksa API key, ketersediaan model, dan koneksi jaringan."


# Contoh penggunaan (hanya berjalan jika file ini dieksekusi langsung, bukan bagian dari aplikasi)
if __name__ == "__main__":
    print("\n--- Menguji Gemini LLM Service (membutuhkan GEMINI_API_KEY) ---")
    gemini_llm = LLMService(model_name="gemini-1.5-flash", is_gemini=True)
    diagnosis_test = "Tomato_Early_blight"
    retrieved_docs_test = [
        "Tanaman: Kentang, Tomat, Kubis. Penyakit: Bercak Daun Alternaria. "
        "Patogen: Alternaria solani, Alternaria brassicae. "
        "Gejala: Bercak coklat tua hingga hitam dengan pola cincin konsentris pada daun tua. "
        "Pengendalian: Rotasi palawija, aplikasi agens hayati Trichoderma, fungisida difenokonazol."
    ]
    recommendation_test = gemini_llm.get_grounded_recommendation(diagnosis_test, retrieved_docs_test)
    print(f"\nRekomendasi untuk {diagnosis_test}:\n{recommendation_test}")