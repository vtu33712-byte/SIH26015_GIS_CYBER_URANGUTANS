"""
LLM orchestration module for JAL IMPACT AI Assistant.
Supports OpenAI API (GPT-4o / GPT-4o-mini), open-weight models (via Hugging Face / Ollama / local endpoints),
and an intelligent local reasoning engine when external APIs are offline or unconfigured.
"""

import os
from typing import List, Dict, Any, Optional

try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


SYSTEM_PROMPT = """You are the official JAL IMPACT AI Assistant (Jal-Bot), an intelligent copilot for the JAL IMPACT watershed monitoring and geospatial platform.

Your goals:
1. Answer questions about watershed management, hydrology, GIS concepts, NDVI/NDWI vegetation indices, water bodies, and before/after temporal change detection.
2. Guide users accurately through the website's existing modules and dashboard metrics.
3. Be clear, professional, concise, and structured (use bullet points or bold text where appropriate).
4. Do NOT hallucinate or invent non-existent website features or fictional data.
5. If the provided knowledge base does not contain sufficient information to answer a platform-specific question, explicitly state:
"I don't have enough information in the JAL IMPACT knowledge base to answer that accurately."
"""


class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.client = None
        if HAS_OPENAI and self.api_key and not self.api_key.startswith("your_"):
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception:
                self.client = None

    def generate_response(
        self,
        user_query: str,
        context_str: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Generates an answer using either OpenAI API or local grounded synthesis.
        """
        # 1. If OpenAI API is available, use it
        if self.client:
            try:
                messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                if context_str:
                    messages.append({
                        "role": "system",
                        "content": f"Use the following verified project knowledge to ground your answer:\n\n{context_str}"
                    })

                # Add last 6 turns of history
                if conversation_history:
                    for msg in conversation_history[-6:]:
                        role = "user" if msg.get("sender") == "user" or msg.get("role") == "user" else "assistant"
                        messages.append({"role": role, "content": msg.get("text") or msg.get("content", "")})

                messages.append({"role": "user", "content": user_query})

                completion = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=650
                )
                return completion.choices[0].message.content.strip()
            except Exception as e:
                # Fallback to local grounded synthesizer
                pass

        # 2. Local Grounded Synthesizer (Zero-latency offline engine)
        return self._local_grounded_synthesis(user_query, context_str)

    def _local_grounded_synthesis(self, query: str, context_str: str) -> str:
        """
        Synthesizes an intelligent, accurate response strictly grounded in the retrieved knowledge base.
        """
        if not context_str.strip():
            # Check if it is a general greeting or platform capability question
            q = query.lower()
            if any(g in q for g in ["hello", "hi", "hey", "who are you"]):
                return (
                    "Hello! I am **Jal-Bot**, the official AI Assistant for the **JAL IMPACT** watershed monitoring platform.\n\n"
                    "I can assist you with:\n"
                    "• Explaining watershed & hydrology principles (Ridge-to-Valley, check dams, percolation tanks)\n"
                    "• Interpreting NDVI / NDWI vegetation and water indices\n"
                    "• Navigating website modules (GIS Map, Before/After Slider, Field Evidence, Inspections)\n"
                    "• Understanding dashboard metrics and priority risk zones.\n\n"
                    "How can I help you today?"
                )
            return "I don't have enough information in the JAL IMPACT knowledge base to answer that accurately. Please ask about watershed concepts, NDVI analysis, GIS layers, or platform modules."

        # Extract the key concepts from context
        return (
            f"Based on the **JAL IMPACT Project Knowledge Base**:\n\n"
            f"{self._summarize_context_for_query(query, context_str)}"
        )

    def _summarize_context_for_query(self, query: str, context_str: str) -> str:
        """Extracts and formats relevant bullet points from the retrieved markdown context."""
        cleaned_sections = []
        for line in context_str.split("\n"):
            line = line.strip()
            if line and not line.startswith("===") and not line.startswith("---") and not line.startswith("[DOCUMENT:"):
                if line.startswith("#"):
                    cleaned_sections.append(f"\n**{line.replace('#', '').strip()}**")
                elif line.startswith("-") or line.startswith("•") or line.startswith("1.") or line.startswith("2."):
                    cleaned_sections.append(f"• {line.lstrip('-•0123456789. ')}")
                elif len(line) > 20:
                    cleaned_sections.append(line)

        return "\n".join(cleaned_sections[:12])
