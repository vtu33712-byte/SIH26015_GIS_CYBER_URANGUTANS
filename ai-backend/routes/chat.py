"""
FastAPI Routes for JAL IMPACT AI Assistant.
Provides endpoints for chat, RAG retrieval, action execution, and capability discovery.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from rag.retriever import RAGRetriever
from llm.model import LLMService
from actions.website_actions import detect_website_action, CAPABILITY_MAP

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

# Initialize RAG and LLM singletons
retriever = RAGRetriever()
llm_service = LLMService()


# Pydantic Request / Response Models
class ChatRequest(BaseModel):
    message: str = Field(..., description="User's query or instruction", example="What is NDVI?")
    conversation_id: Optional[str] = Field(None, description="Session or conversation ID", example="conv-123")
    history: Optional[List[Dict[str, Any]]] = Field(default=[], description="Previous conversation turns")


class ActionPayload(BaseModel):
    type: str = Field(..., example="navigate")
    target: str = Field(..., example="gis")
    route: str = Field(..., example="/gis")
    label: str = Field(..., example="GIS Command Map")
    confirmation: str = Field(..., example="Navigating to GIS Command Map (/gis).")


class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    action: Optional[ActionPayload] = None
    quick_questions: List[str]
    conversation_id: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main RAG Chat endpoint.
    Retrieves project knowledge, invokes LLM, detects navigation actions, and returns structured response.
    """
    query = request.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Detect any requested website action (e.g. navigation)
    detected_action = detect_website_action(query)

    # 2. Retrieve relevant knowledge chunks via RAG
    retrieved_results = retriever.retrieve(query, top_k=4)
    context_str = retriever.build_context_string(retrieved_results)

    # Collect unique source file names
    sources = list(dict.fromkeys([chunk.source for chunk, _ in retrieved_results]))

    # 3. Generate Answer from LLM
    llm_answer = llm_service.generate_response(
        user_query=query,
        context_str=context_str,
        conversation_history=request.history
    )

    # If an action was detected, prefix or append the action confirmation
    if detected_action:
        action_payload = ActionPayload(**detected_action)
        if not any(word in llm_answer.lower() for word in ["navigating", "opened", "switched"]):
            llm_answer = f"{detected_action['confirmation']}\n\n{llm_answer}"
    else:
        action_payload = None

    # Suggested follow-up quick prompts
    quick_questions = [
        "What is NDVI & how is it measured?",
        "Where can I see the Before / After slider?",
        "Explain the Ridge-to-Valley watershed approach",
        "How do I upload a new field observation?"
    ]

    return ChatResponse(
        response=llm_answer,
        sources=sources,
        action=action_payload,
        quick_questions=quick_questions,
        conversation_id=request.conversation_id or "session-default"
    )


@router.get("/quick-questions")
async def get_quick_questions():
    """Returns curated starter prompts based on actual website modules."""
    return {
        "questions": [
            "How do I use this website?",
            "What is NDVI?",
            "How can I compare past and present data?",
            "Explain watershed analysis",
            "Where can I view vegetation changes?",
            "Show me the GIS Command Map"
        ]
    }


@router.get("/capabilities")
async def get_capabilities():
    """Returns the official website capability and route map."""
    return {
        "platform": "JAL IMPACT Geospatial Watershed Intelligence",
        "capabilities": CAPABILITY_MAP
    }


@router.get("/health")
async def health_check():
    """Health check endpoint to verify AI backend readiness."""
    return {
        "status": "healthy",
        "service": "JAL IMPACT AI Assistant Backend",
        "rag_indexed_chunks": len(retriever.chunks),
        "llm_provider": "OpenAI / Local Grounded Engine"
    }
