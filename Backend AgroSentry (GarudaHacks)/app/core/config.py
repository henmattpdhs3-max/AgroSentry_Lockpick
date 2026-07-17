from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
WORKSPACE_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    supabase_url: str = Field(validation_alias="NEXT_PUBLIC_SUPABASE_URL")
    supabase_key: str = Field(validation_alias="NEXT_PUBLIC_SUPABASE_KEY")

    onnx_model_path: str = str(BACKEND_ROOT / "model/plant_disease_model (2).onnx")
    labels_path: str = str(BACKEND_ROOT / "model/PlantDiseaseLabel.json")

    #AI/ML key
    gemini_api_key: str = ""
    openai_api_key: str = Field(validation_alias="OPENAI_API_KEY")

    # RAG
    chroma_db_dir: str = str(BACKEND_ROOT / "data/vectorstorage/")

    model_config = SettingsConfigDict(
        env_file=[WORKSPACE_ROOT / ".env", BACKEND_ROOT / ".env", ".env"],
        extra="ignore",
    )


settings = Settings()
