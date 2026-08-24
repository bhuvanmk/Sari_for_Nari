import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import ChatRequest, ChatResponse
from app.chatbot.agent import chatbot_agent
from app.rag.ingest import run_ingestion
from app.config import VECTOR_DB_PATH

app = FastAPI(
    title="Narees AI Chatbot Service",
    description="AI Assistant service for Sarees For Naaris using RAG, FAISS, and Qwen2.5-7B",
    version="1.0.0"
)

# Enable CORS for Spring Boot / React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("Initializing Narees AI Chatbot Service...")
    faiss_index_file = os.path.join(VECTOR_DB_PATH, "index.faiss")
    if not os.path.exists(faiss_index_file):
        print(f"FAISS index file not found at {faiss_index_file}. Running automatic RAG ingestion...")
        run_ingestion()
    else:
        print("FAISS index loaded into memory successfully.")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Narees AI Assistant"}

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty.")
        response = chatbot_agent.process_request(request)
        return response
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
