from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from dotenv import load_dotenv
import os
import requests
from typing import List

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class GeminiEmbeddings(Embeddings):
    """Calls Google Generative Language v1 API directly. Zero RAM, no library version issues."""

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        url = f"https://generativelanguage.googleapis.com/v1/models/text-embedding-004:batchEmbedContents?key={GOOGLE_API_KEY}"
        payload = {
            "requests": [
                {"model": "models/text-embedding-004", "content": {"parts": [{"text": t}]}}
                for t in texts
            ]
        }
        resp = requests.post(url, json=payload, timeout=60)
        if resp.status_code != 200:
            raise ValueError(f"Gemini API error {resp.status_code}: {resp.text}")
        return [e["values"] for e in resp.json()["embeddings"]]

    def embed_query(self, text: str) -> List[float]:
        url = f"https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key={GOOGLE_API_KEY}"
        resp = requests.post(url, json={"content": {"parts": [{"text": text}]}}, timeout=30)
        if resp.status_code != 200:
            raise ValueError(f"Gemini API error {resp.status_code}: {resp.text}")
        return resp.json()["embedding"]["values"]

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is required.")

embed_model = GeminiEmbeddings()

def createvectore_store(pdf_path: str, collection_name: str):
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    if not documents:
        raise ValueError("Could not read any pages from the PDF. The file may be empty or corrupted.")

    text_spliter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_spliter.split_documents(documents)
    docs = [d for d in docs if d.page_content.strip()]
    if not docs:
        raise ValueError("No readable text found in the PDF. If this is a scanned PDF (image only), please use an OCR tool to make it searchable first.")

    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=embed_model,
        collection_name=collection_name,
        persist_directory="./db"
    )
    print("vector store created successfully")
    return vector_store

def load_vectorstore(collection_name: str):
    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embed_model,
        persist_directory="./db"
    )
    return vector_store
