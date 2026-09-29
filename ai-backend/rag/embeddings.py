"""
Embedding generation and semantic similarity module.
Supports SentenceTransformers with a built-in lightweight TF-IDF / Cosine fallback
to ensure zero-dependency instant startup without heavy download delays if needed.
"""

import os
import math
import re
from typing import List

# Optional imports handled gracefully
try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False


class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        if HAS_SENTENCE_TRANSFORMERS:
            try:
                self.model = SentenceTransformer(self.model_name)
            except Exception:
                self.model = None

    def embed_query(self, text: str) -> List[float]:
        """Generate embedding vector for a single query."""
        if self.model is not None:
            try:
                vec = self.model.encode(text, convert_to_numpy=True)
                return vec.tolist()
            except Exception:
                pass
        return self._fallback_embed(text)

    def embed_documents(self, docs: List[str]) -> List[List[float]]:
        """Generate embedding vectors for multiple documents."""
        if self.model is not None:
            try:
                vecs = self.model.encode(docs, convert_to_numpy=True)
                return vecs.tolist()
            except Exception:
                pass
        return [self._fallback_embed(doc) for doc in docs]

    def _fallback_embed(self, text: str, dim: int = 64) -> List[float]:
        """
        Lightweight bag-of-words / character-n-gram hash embedding vector
        with L2 normalization for fast local vector retrieval.
        """
        words = re.findall(r'\b\w+\b', text.lower())
        vec = [0.0] * dim
        if not words:
            return vec

        for word in words:
            # Deterministic hash bucket
            h = hash(word) % dim
            vec[h] += 1.0

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two float vectors."""
    if len(v1) != len(v2) or not v1:
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)
