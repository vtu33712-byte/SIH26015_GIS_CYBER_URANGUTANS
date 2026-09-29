"""
Vector search retriever for JAL IMPACT RAG pipeline.
"""

from typing import List, Dict, Any, Tuple
from .embeddings import EmbeddingService, cosine_similarity
from .knowledge_base import KnowledgeBaseManager, DocumentChunk


class RAGRetriever:
    def __init__(self, embedding_service: EmbeddingService = None, kb_manager: KnowledgeBaseManager = None):
        self.embedding_service = embedding_service or EmbeddingService()
        self.kb_manager = kb_manager or KnowledgeBaseManager()
        self.chunks: List[DocumentChunk] = []
        self._initialize_index()

    def _initialize_index(self):
        """Loads documents and computes their vector embeddings."""
        self.chunks = self.kb_manager.load_all_documents()
        for chunk in self.chunks:
            # Combine title and content for rich vector representation
            text_to_embed = f"{chunk.title}\n{chunk.content}"
            chunk.embedding = self.embedding_service.embed_query(text_to_embed)

    def retrieve(self, query: str, top_k: int = 4, threshold: float = 0.20) -> List[Tuple[DocumentChunk, float]]:
        """
        Retrieves top_k most relevant document chunks for the user query.
        Returns list of (DocumentChunk, score) tuples.
        """
        if not self.chunks:
            self._initialize_index()

        query_vec = self.embedding_service.embed_query(query)
        scored: List[Tuple[DocumentChunk, float]] = []

        for chunk in self.chunks:
            score = cosine_similarity(query_vec, chunk.embedding)
            # Keyword boosting if exact keywords exist
            query_words = set(query.lower().split())
            content_lower = chunk.content.lower()
            overlap = sum(1 for w in query_words if len(w) > 3 and w in content_lower)
            if overlap > 0:
                score += min(0.25, overlap * 0.05)

            if score >= threshold:
                scored.append((chunk, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def build_context_string(self, retrieved_chunks: List[Tuple[DocumentChunk, float]]) -> str:
        """Formats retrieved chunks into clean markdown context for the LLM."""
        if not retrieved_chunks:
            return ""

        context_lines = ["=== RELEVANT JAL IMPACT PROJECT KNOWLEDGE BASE ==="]
        for chunk, score in retrieved_chunks:
            context_lines.append(f"\n[DOCUMENT: {chunk.title} | Source: {chunk.source}]")
            context_lines.append(chunk.content)
            context_lines.append("--------------------------------------------------")

        return "\n".join(context_lines)
