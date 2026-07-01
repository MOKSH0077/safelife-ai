from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma 
from langchain_core.embeddings import Embeddings
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2
from dotenv import load_dotenv
import os

load_dotenv()

class ChromaONNXEmbeddings(Embeddings):
    """Zero-key, lightweight local ONNX embedding model that runs on Render Free Tier."""
    def __init__(self):
        self.ef = ONNXMiniLM_L6_V2()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        texts = [t.replace("\n", " ") for t in texts]
        return self.ef(texts)

    def embed_query(self, text: str) -> list[float]:
        text = text.replace("\n", " ")
        return self.ef([text])[0]

embed_model = ChromaONNXEmbeddings()

def createvectore_store(pdf_path:str,collection_name:str):
    load_dotenv()
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    text_spliter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_spliter.split_documents(documents)

    vector_store=Chroma.from_documents(documents=docs,embedding=embed_model,collection_name=collection_name,persist_directory="./db")
    print("vector store created successfully")
    return vector_store

def load_vectorstore(collection_name:str):
    load_dotenv()
    vector_store=Chroma(collection_name=collection_name,embedding_function=embed_model,persist_directory="./db")
    return vector_store
