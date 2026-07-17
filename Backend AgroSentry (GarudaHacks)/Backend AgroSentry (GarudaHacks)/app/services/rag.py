from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List, Optional
import os
import logging

from app.core.config import settings # Import settings for the ChromaDB directory

logger = logging.getLogger(__name__)

class RAGService:
    """
    A service for Retrieval Augmented Generation (RAG).
    It manages a vector store (ChromaDB) to store and retrieve relevant documents.
    """
    def __init__(self, persist_directory: str = settings.chroma_db_dir):
        self.persist_directory = persist_directory
        
        # Initialize the embedding model. This converts text into numerical vectors.
        self.embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vectorstore: Optional[Chroma] = None

        # Ensure the directory for storing ChromaDB data exists
        os.makedirs(persist_directory, exist_ok=True)
        logger.info(f"ChromaDB persistence directory ensured: {self.persist_directory}")

    def initialize_vectorstore(self, documents: List[str]):
        """
        Initializes or loads the Chroma vector store with provided documents.
        If a vector store already exists at the persist_directory, it will be loaded.
        Otherwise, a new one will be created from the given documents.
        
        Args:
            documents: A list of strings, where each string is a document to be processed.
        """
        # If the vector store is already loaded, we don't need to do it again.
        if self.vectorstore:
            logger.info("Vector store already initialized. Skipping re-initialization.")
            return

        # Check if a persistent vector store already exists on disk.
        # We check if the directory exists and contains any files.
        if os.path.exists(self.persist_directory) and os.listdir(self.persist_directory):
            logger.info(f"Loading existing vector store from {self.persist_directory}")
            # Load the existing ChromaDB from the directory
            self.vectorstore = Chroma(persist_directory=self.persist_directory, embedding_function=self.embeddings)
            logger.info("Existing vector store loaded successfully.")
        else:
            logger.info("No existing vector store found. Creating a new one...")
            # Split documents into smaller, manageable chunks for better retrieval.
            # This helps in getting more precise results from the vector store.
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            
            # Convert raw strings to Langchain Document objects, which are expected by Chroma.
            docs = [Document(page_content=d) for d in documents]
            splits = text_splitter.split_documents(docs)
            
            # Create the Chroma vector store from the document chunks and persist it to disk.
            self.vectorstore = Chroma.from_documents(
                documents=splits,
                embedding=self.embeddings,
                persist_directory=self.persist_directory
            )
            # Explicitly persist the data to ensure it's saved.
            self.vectorstore.persist() 
            logger.info(f"New vector store created and persisted with {len(splits)} chunks.")

    def retrieve(self, query: str, k: int = 3) -> List[str]:
        """
        Retrieves relevant document chunks based on a query from the vector store.
        
        Args:
            query: The search query (e.g., a diagnosis).
            k: The number of top relevant document chunks to retrieve.
            
        Returns:
            A list of strings, where each string is a relevant document chunk.
        """
        if not self.vectorstore:
            logger.warning("Vector store not initialized. Please call initialize_vectorstore first.")
            return []
        
        # Perform similarity search to find the most relevant document chunks.
        results = self.vectorstore.similarity_search(query, k=k)
        # Extract the page content from the retrieved Document objects.
        return [doc.page_content for doc in results]

# Example usage (for testing purposes, not part of the service class itself)
if __name__ == "__main__":
    # This block only runs when rag.py is executed directly.
    rag_service = RAGService()
    
    # Dummy documents for demonstration. In a real app, these would come from your ministry/official documents.
    dummy_docs = [
        "Official document about malaria prevention: Use mosquito nets and repellents, and take antimalarial drugs when traveling to endemic areas.",
        "Ministry of Health guidelines for dengue fever: Symptoms include high fever, severe headache, pain behind the eyes, muscle and joint pains, and rash. Seek medical attention immediately.",
        "Government policy on vaccination: All children should receive routine vaccinations according to the national immunization schedule to prevent common infectious diseases.",
        "Information on tuberculosis: TB is a bacterial infection that usually attacks the lungs, but can also affect other parts of the body. It is spread through the air."
    ]
    
    # Initialize the vector store with dummy documents.
    # This will create a new ChromaDB if one doesn't exist, or load it if it does.
    rag_service.initialize_vectorstore(dummy_docs)
    
    # Test retrieval with a query.
    query = "What are the recommendations for malaria?"
    retrieved_info = rag_service.retrieve(query)
    print(f"\nRetrieved information for \'{query}\'")
    for info in retrieved_info:
        print(f"- {info}")

    query = "dengue fever symptoms"
    retrieved_info = rag_service.retrieve(query)
    print(f"\nRetrieved information for \'{query}\'")
    for info in retrieved_info:
        print(f"- {info}")