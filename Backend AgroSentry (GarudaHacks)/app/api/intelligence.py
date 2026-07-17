from fastapi import APIRouter

router = APIRouter(prefix="/api")


@router.get("/community/verified-qa")
async def verified_qa():
    return [
        {
            "id": "qa-1",
            "question": "Apa yang harus dilakukan saat gejala muncul di daun muda?",
            "answer": "Pisahkan tanaman yang terkena, kurangi kelembapan, dan periksa secara rutin.",
            "linkedDiagnosisOutcome": "terdiagnosis",
            "verified": True,
        },
        {
            "id": "qa-2",
            "question": "Apakah hasil deteksi bisa dipakai sebagai acuan utama?",
            "answer": "Hasil ini adalah deteksi awal yang membantu, tetapi tetap perlu verifikasi lapangan.",
            "linkedDiagnosisOutcome": "terdiagnosis",
            "verified": True,
        },
    ]