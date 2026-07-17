from openai import OpenAI
from app.core.config import settings
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class LLMService:
    """
    Aplikasi ini memiliki fitur AI yang sudah dimodifikasi sehingga dapat membantu petani Indonesia dalam proses pembuatan keputusan
    """
    def __init__(self, model_name: str, is_gemini: bool = False):
        self.model_name = model_name
        self.is_gemini = is_gemini
        self.client = self._initialize_client()

    def _initialize_client(self) -> OpenAI:
        api_key: str
        base_url: Optional[str] = None

        if self.is_gemini:
            api_key = settings.gemini_api_key
            base_url = "https://generativelanguage.googleapis.com/v1beta/models" # Gemini API endpoint
            if not api_key:
                logger.warning("GEMINI_API_KEY is not set in .env. LLM calls may fail." )
        else:
            api_key = settings.openai_api_key
            if not api_key:
                logger.warning("OPENAI_API_KEY is not set in .env. LLM calls may fail.")
        
        if not api_key:
            logger.error(f"API key for {self.model_name} is missing. Please check your .env file.")
            # In a real application, you might raise an error or use a mock client.
            # For now, we proceed with a potentially invalid key.

        return OpenAI(api_key=api_key, base_url=base_url)

    def get_grounded_recommendation(self, diagnosis: str, retrieved_docs: List[str]) -> str:
        """
        Generates a grounded recommendation based on a diagnosis and retrieved documents.
        
        Args:
            diagnosis: The primary diagnosis (e.g., from the ONNX model).
            retrieved_docs: A list of relevant document chunks from the RAG service.
            
        Returns:
            A string containing the LLM's recommendation.
        """
        # Combine the retrieved documents into a single context string for the LLM.
        context = "\n".join(retrieved_docs)
        
        # Construct a clear and direct prompt for the LLM.
        # This guides the LLM to act as a health assistant and use the provided context.
        prompt = f"""You are an AI assistant providing health recommendations.
Based on the following diagnosis and retrieved official documents, provide a grounded recommendation.

Diagnosis: {diagnosis}

Official Documents Context:
{context}

Recommendation:"""

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500, # Limit the length of the generated response to prevent excessive cost/output.
                temperature=0.7 # A moderate temperature for balanced creativity and factual adherence.
            )
            # Extract and return the content of the LLM's response.
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Failed to get recommendation from LLM: {e}")
            return "Could not generate a recommendation at this time. Please check API key, model availability, and network connection."

# Example usage (for testing purposes, only runs if this file is executed directly)
if __name__ == "__main__":
    # Ensure you have GEMINI_API_KEY or OPENAI_API_KEY set in your .env file or environment variables.
    # For Gemini, use a model like "gemini-pro". For OpenAI, use "gpt-3.5-turbo" or similar.

    print("\n--- Testing Gemini LLM Service (requires GEMINI_API_KEY) ---")
    gemini_llm = LLMService(model_name="gemini-pro", is_gemini=True)
    diagnosis_gemini = "Malaria"
    retrieved_docs_gemini = [
        "Official document about malaria prevention: Use mosquito nets and repellents.",
        "Malaria treatment involves antimalarial drugs like chloroquine."
    ]
    recommendation_gemini = gemini_llm.get_grounded_recommendation(diagnosis_gemini, retrieved_docs_gemini)
    print(f"\nGemini Recommendation for {diagnosis_gemini}:\n{recommendation_gemini}")

    print("\n--- Testing OpenAI LLM Service (requires OPENAI_API_KEY) ---")
    openai_llm = LLMService(model_name="gpt-3.5-turbo", is_gemini=False)
    diagnosis_openai = "Dengue Fever"
    retrieved_docs_openai = [
        "Ministry of Health guidelines for dengue fever: Symptoms include high fever, rash, and muscle pain. Seek medical attention.",
        "Dengue prevention involves eliminating mosquito breeding sites."
    ]
    recommendation_openai = openai_llm.get_grounded_recommendation(diagnosis_openai, retrieved_docs_openai)
    print(f"\nOpenAI Recommendation for {diagnosis_openai}:\n{recommendation_openai}")
