"""
JAL IMPACT AI Assistant - FastAPI Server Entrypoint
Isolated Backend Service for Geospatial Watershed RAG & LLM Capabilities.
"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Import AI chat router
from routes.chat import router as ai_router

app = FastAPI(
    title="JAL IMPACT AI Assistant API",
    description="Isolated RAG & LLM Backend for JAL IMPACT Geospatial Watershed Platform",
    version="1.0.0"
)

# Configure CORS so the React frontend (on port 5173 / 5174 / 3000 / 8080) can communicate seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount AI Routes
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "service": "JAL IMPACT AI Assistant Backend",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/ai/health"
    }


if __name__ == "__main__":
    port = int(os.getenv("AI_PORT", 8000))
    host = os.getenv("AI_HOST", "0.0.0.0")
    print(f"[AI-BACKEND] Starting JAL IMPACT AI Assistant on http://{host}:{port}")
    uvicorn.run("app:app", host=host, port=port, reload=False)
