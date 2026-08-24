import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")
SPRING_BOOT_BASE_URL = os.getenv("SPRING_BOOT_BASE_URL", "http://localhost:8080")
VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "vectorstore")
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL_NAME = "Qwen/Qwen2.5-7B-Instruct"
