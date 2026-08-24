import os
import glob
from langchain_community.document_loaders import TextLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from app.rag.embeddings import get_embedding_model
from app.rag.vectorstore import save_vectorstore
from app.config import VECTOR_DB_PATH

def run_ingestion(knowledge_dir="knowledge", vectorstore_path=VECTOR_DB_PATH):
    print(f"Starting document ingestion from directory: {knowledge_dir}...")
    documents = []
    
    markdown_files = glob.glob(os.path.join(knowledge_dir, "*.md"))
    for file_path in markdown_files:
        try:
            loader = TextLoader(file_path, encoding='utf-8')
            file_docs = loader.load()
            for doc in file_docs:
                filename = os.path.basename(file_path)
                doc.metadata["source"] = filename
                doc.metadata["title"] = filename.replace(".md", "").replace("-", " ").title()
            documents.extend(file_docs)
            print(f"Loaded {file_path}")
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            
    if not documents:
        print("No documents found for ingestion!")
        return None

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} text chunks.")

    embeddings = get_embedding_model()
    vectorstore = FAISS.from_documents(chunks, embeddings)
    save_vectorstore(vectorstore, vectorstore_path)
    print(f"FAISS vector store successfully saved to '{vectorstore_path}'.")
    return vectorstore

if __name__ == "__main__":
    run_ingestion()
