from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.diagnosis import router as routingdiagnosis
from app.api.rekomendasi import router as routingrekomendasi
from app.api.populasi import router as routingpopulasi
from app.api.intelligence import router as routingintelligence
from app.api.kesehatan import router as routingkesehatan
from pydantic import BaseModel, Field

from contextlib import asynccontextmanager
from supabase import create_client, Client
from app.core.state import state
from app.core.config import settings
from app.services.inferonxx import InferONNX
from app.services.supabase import get_supabase_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.state import state 
    state.supabase = get_supabase_client()
    state.infer_onxx = InferONNX(model_path=settings.onnx_model_path, labels=settings.labels_path)
    # state.rag_index = ...      # once services/rag.py exists
    # state.llm_service = ...   # once services/llm.py exists

    yield

    # Cleanup code can go here if needed (e.g., closing connections) or Shutdown? 

master = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "https://your-nextjs-app.com",    #placeholder tergantmung nanti yang frontend linknya gimana
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
