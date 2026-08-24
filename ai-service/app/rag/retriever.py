from app.rag.vectorstore import load_vectorstore

class RAGRetriever:
    def __init__(self):
        self.vectorstore = load_vectorstore()

    def reload(self):
        self.vectorstore = load_vectorstore()

    def query(self, query_text: str, top_k: int = 3) -> str:
        if not self.vectorstore:
            self.reload()
        if not self.vectorstore:
            return ""

        docs = self.vectorstore.similarity_search(query_text, k=top_k)
        if not docs:
            return ""

        context_parts = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "Narees Policy")
            context_parts.append(f"--- Document {i} (Source: {source}) ---\n{doc.page_content}")

        return "\n\n".join(context_parts)

rag_retriever = RAGRetriever()
