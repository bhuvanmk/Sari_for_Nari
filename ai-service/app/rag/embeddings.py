import os
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

from langchain_community.embeddings import HuggingFaceEmbeddings
from app.config import EMBEDDING_MODEL_NAME

def get_embedding_model():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
