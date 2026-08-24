from app.rag.retriever import rag_retriever

def search_knowledge_base(query: str) -> str:
    return rag_retriever.query(query, top_k=3)
