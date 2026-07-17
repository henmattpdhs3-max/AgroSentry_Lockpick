import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.diagnosis import router as routingdiagnosis
from app.api.rekomendasi import router as routingrekomendasi
from app.api.populasi import router as routingpopulasi
from app.api.intelligence import router as routingintelligence
from app.api.kesehatan import router as routingkesehatan

from contextlib import asynccontextmanager
from app.core.state import state
from app.core.config import settings
from app.services.inferonxx import InferONNX
from app.services.supabase import get_supabase_client
from app.services.rag import RAGService
from app.services.llm import LLMService


@asynccontextmanager
async def lifespan(app: FastAPI):
    state.supabase = get_supabase_client()
    state.infer_onxx = InferONNX(model_path=settings.onnx_model_path, labels=settings.labels_path)

    state.rag_service = RAGService()
    with open("data/ministry_documents/flattened.json") as f:
        docs = json.load(f)
    state.rag_service.initialize_vectorstore(docs)

    state.llm_service = LLMService(model_name="gpt-5-mini-2025-08-07", is_gemini=False)

    yield

    # Shutdown — nothing needed yet


master = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "https://your-nextjs-app.com",    # placeholder tergantung nanti yang frontend linknya gimana
]

master.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@master.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}

master.include_router(routingdiagnosis)
master.include_router(routingrekomendasi)
master.include_router(routingpopulasi)
master.include_router(routingintelligence)
master.include_router(routingkesehatan)