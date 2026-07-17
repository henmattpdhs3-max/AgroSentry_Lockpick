from typing import Optional, Any
from supabase import Client
from app.services.inferonxx import InferONNX


class AppState:
    supabase: Optional[Client] = None
    infer_onxx: Optional[InferONNX] = None
    rag_index: Any = None          # set once services/rag.py exists
    llm_service: Any = None        # set once services/llm.py exists


state = AppState()
