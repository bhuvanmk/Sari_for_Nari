import os
from langchain_community.vectorstores import FAISS
from app.rag.embeddings import get_embedding_model
from app.config import VECTOR_DB_PATH

def load_vectorstore(path=VECTOR_DB_PATH):
    embeddings = get_embedding_model()
    if os.path.exists(path) and os.path.exists(os.path.join(path, "index.faiss")):
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    return None

def save_vectorstore(vectorstore, path=VECTOR_DB_PATH):
    vectorstore.save_local(path)
