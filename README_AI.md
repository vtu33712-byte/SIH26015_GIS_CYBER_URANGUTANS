# JAL IMPACT AI Assistant & RAG Architecture

## 1. Overview
The **JAL IMPACT AI Assistant (Jal-Bot)** is an isolated, production-ready AI Copilot layer built for the JAL IMPACT Geospatial Watershed Development Platform. It answers user inquiries, explains complex remote sensing & hydrology indices (NDVI, NDWI, soil erosion, ridge-to-valley), guides users across the platform's 10 verified modules, and performs safe, controlled website navigation.

---

## 2. System Architecture

```text
  Existing Website Frontend (React + TypeScript + Vite)
                          │
                          ▼ (HTTP POST /api/ai/chat)
                 FastAPI Backend (Port 8001)
                          │
       ┌──────────────────┴──────────────────┐
       ▼                                     ▼
RAG Layer & Vector Retriever        Action Detection Engine
 (Cosine Similarity / Hash Embeddings) (Safe Whitelisted Navigation)
       │                                     │
       ▼                                     ▼
Document Knowledge Base             Target Route Verification
(Website Docs, NDVI, Hydrology)     (/gis, /before-after, etc.)
       │                                     │
       └──────────────────┬──────────────────┘
                          │
                          ▼
                 LLM Response Engine
     (OpenAI GPT-4o-mini / Local Grounded Synthesizer)
                          │
                          ▼
       Structured Response + Sources + Navigation
                          │
                          ▼
             Existing Website UI (Jal-Bot)
```

---

## 3. Key Components & Directory Structure

```text
ai-backend/
├── app.py                      # FastAPI server entrypoint with CORS & logging
├── requirements.txt            # Python dependencies
├── .env.example                # Template for environment variables
├── .env                        # Active environment configuration
├── routes/
│   ├── __init__.py
│   └── chat.py                 # /api/ai/chat, /health, /capabilities, /quick-questions
├── rag/
│   ├── __init__.py
│   ├── embeddings.py           # Vector embeddings with SentenceTransformers & fallback
│   ├── retriever.py            # Similarity scoring, thresholding, and prompt synthesis
│   └── knowledge_base.py       # Markdown chunking and index builder
├── llm/
│   ├── __init__.py
│   └── model.py                # LLM orchestration (OpenAI / Local Grounded Engine)
├── actions/
│   ├── __init__.py
│   └── website_actions.py      # Validated capability map & safe navigation triggers
└── knowledge/
    ├── website_documentation/
    │   ├── platform_overview.md
    │   ├── modules_guide.md
    │   └── metrics_guide.md
    └── project_documents/
        ├── watershed_management.md
        ├── ndvi_vegetation_analysis.md
        └── change_detection_before_after.md
```

---

## 4. API Endpoints

### `POST /api/ai/chat`
- **Request Body**:
  ```json
  {
    "message": "What is NDVI and how is it used in watershed planning?",
    "conversation_id": "session-123",
    "history": []
  }
  ```
- **Response**:
  ```json
  {
    "response": "Based on the JAL IMPACT Project Knowledge Base: ...",
    "sources": ["ndvi_vegetation_analysis.md"],
    "action": null,
    "quick_questions": ["What is NDVI?", "Where can I see the Before / After slider?"],
    "conversation_id": "session-123"
  }
  ```

### `POST /api/ai/chat` (With Navigation Action)
- **Request**: `{"message": "Open the GIS command map"}`
- **Response**:
  ```json
  {
    "response": "Navigating to GIS Command Map (/gis)...",
    "sources": ["modules_guide.md"],
    "action": {
      "type": "navigate",
      "target": "gis",
      "route": "/gis",
      "label": "GIS Command Map",
      "confirmation": "Navigating to GIS Command Map (/gis)."
    }
  }
  ```

### `GET /api/ai/health`
- Verifies server status, indexed knowledge base chunks count, and active LLM configuration.

---

## 5. How to Start and Run the Backend

### Prerequisites
- Python 3.10+
- Virtual environment (recommended)

### Installation & Run Steps
```bash
# 1. Navigate to the AI backend directory
cd "ai-backend"

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env

# 4. Start the FastAPI server
python app.py
```
The server will start on: `http://localhost:8001` (API Docs: `http://localhost:8001/docs`).

---

## 6. Frontend Integration & Zero-Failure Guarantee
- The existing frontend connects to `http://localhost:8001/api/ai/chat`.
- **Zero-Failure Architecture**: If the Python backend is ever offline or stopped, the frontend seamlessly falls back to its built-in client-side intelligence without throwing errors or breaking the website.
- **Website Preservation**: All existing pages, themes, CSS animations, Leaflet maps, dashboards, and before/after sliders remain 100% unchanged and functional.

---

## 7. Testing Instructions

1. **Test Health Endpoint**:
   ```bash
   curl http://localhost:8001/api/ai/health
   ```
2. **Test NDVI Question**:
   ```bash
   curl -X POST http://localhost:8001/api/ai/chat -H "Content-Type: application/json" -d '{"message": "What is NDVI?"}'
   ```
3. **Test Website Navigation Action**:
   ```bash
   curl -X POST http://localhost:8001/api/ai/chat -H "Content-Type: application/json" -d '{"message": "take me to before after comparison"}'
   ```
4. **Test in UI**:
   - Open `http://localhost:5174/`
   - Click the floating mascot `Jal-Bot` at the bottom-right corner.
   - Ask "What is NDVI?", "Where is the Before/After comparison?", or "What are the priority intervention zones?".
