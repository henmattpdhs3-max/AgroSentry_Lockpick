from typing import List, Optional
import logging
import os

from app.core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """
    Lightweight retrieval service that works offline by default.
    It uses Chroma when available and falls back to simple keyword matching otherwise.
    """

    def __init__(self, persist_directory: str = settings.chroma_db_dir):
        self.persist_directory = persist_directory
        self.embeddings = None
        self.vectorstore: Optional[object] = None
        self.fallback_documents: List[str] = []
        self.use_fallback = False

        os.makedirs(persist_directory, exist_ok=True)
        logger.info(f"ChromaDB persistence directory ensured: {self.persist_directory}")

        try:
            from langchain_community.embeddings import SentenceTransformerEmbeddings

            self.embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
            logger.info("Embedding model initialized successfully.")
        except Exception as exc:
            self.use_fallback = True
            logger.warning("Falling back to keyword-based retrieval because embedding model initialization failed: %s", exc)

    def initialize_vectorstore(self, documents: List[str]):
        if self.vectorstore:
            logger.info("Vector store already initialized. Skipping re-initialization.")
            return

        if self.use_fallback:
            self.fallback_documents = documents
            self.vectorstore = {"documents": documents}
            logger.info("Initialized fallback document store with %s documents.", len(documents))
            return

        try:
            from langchain_community.vectorstores import Chroma
            from langchain_core.documents import Document
            from langchain_text_splitters import RecursiveCharacterTextSplitter

            if os.path.exists(self.persist_directory) and os.listdir(self.persist_directory):
                logger.info(f"Loading existing vector store from {self.persist_directory}")
                self.vectorstore = Chroma(persist_directory=self.persist_directory, embedding_function=self.embeddings)
                logger.info("Existing vector store loaded successfully.")
            else:
                logger.info("No existing vector store found. Creating a new one...")
                text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
                docs = [Document(page_content=d) for d in documents]
                splits = text_splitter.split_documents(docs)
                self.vectorstore = Chroma.from_documents(
                    documents=splits,
                    embedding=self.embeddings,
                    persist_directory=self.persist_directory,
                )
                self.vectorstore.persist()
                logger.info(f"New vector store created and persisted with {len(splits)} chunks.")
        except Exception as exc:
            self.use_fallback = True
            self.fallback_documents = documents
            self.vectorstore = {"documents": documents}
            logger.warning("Falling back to keyword retrieval after vectorstore initialization error: %s", exc)

    def retrieve(self, query: str, k: int = 3) -> List[str]:
        if not self.vectorstore:
            logger.warning("Vector store not initialized. Please call initialize_vectorstore first.")
            return []

        if self.use_fallback:
            query_lower = query.lower()
            matches = [doc for doc in self.fallback_documents if query_lower in doc.lower()]
            return matches[:k]

        try:
            results = self.vectorstore.similarity_search(query, k=k)
            return [doc.page_content for doc in results]
        except Exception as exc:
            logger.warning("Vector search failed; falling back to keyword retrieval: %s", exc)
            query_lower = query.lower()
            matches = [doc for doc in self.fallback_documents if query_lower in doc.lower()]
            return matches[:k]
