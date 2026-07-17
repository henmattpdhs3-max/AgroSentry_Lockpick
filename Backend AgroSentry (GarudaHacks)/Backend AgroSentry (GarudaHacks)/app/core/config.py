from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    supabase_url: str = Field(validation_alias="NEXT_PUBLIC_SUPABASE_URL")
    supabase_key: str = Field(validation_alias="NEXT_PUBLIC_SUPABASE_KEY")

    onnx_model_path: str = "model/plant_disease_model (2).onnx"
    labels_path: str = "model/PlantDiseaseLabel.json"

    #AI/ML key
    gemini_api_key: str = ""
    openai_api_key: str = Field(validation_alias="OPENAI_API_KEY")
    
    # RAG
    chroma_db_dir: str = "data/vectorstorage/"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
