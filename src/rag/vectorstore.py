from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from dotenv import load_dotenv
import os
import requests
from typing import List

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Use the correct HuggingFace Inference API endpoint (models, not pipeline)
HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"


class HFEmbeddings(Embeddings):
    """Zero-RAM serverless embeddings using HuggingFace Inference API."""

    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}

    def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Call HF API for a single batch of texts."""
        payload = {
            "inputs": texts,
            "options": {"wait_for_model": True, "use_cache": True}
        }
        resp = requests.post(HF_API_URL, headers=self.headers, json=payload, timeout=60)
        if resp.status_code != 200:
            raise ValueError(f"HuggingFace API error {resp.status_code}: {resp.text[:300]}")
        result = resp.json()
        # The /models endpoint returns a list of sentence vectors directly
        return result

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        texts = [t.replace("\n", " ").strip() for t in texts if t.strip()]
        if not texts:
            return []
        # Process in small batches of 32 to avoid request size limits
        all_embeddings: List[List[float]] = []
        batch_size = 32
        for i in range(0, len(texts), batch_size):
            batch = texts[i: i + batch_size]
            all_embeddings.extend(self._embed_batch(batch))
        return all_embeddings

    def embed_query(self, text: str) -> List[float]:
        return self._embed_batch([text.replace("\n", " ").strip()])[0]


if not HF_TOKEN:
    raise EnvironmentError(
        "HF_TOKEN environment variable is missing. "
        "Set it in Render dashboard under Environment Variables."
    )

embed_model = HFEmbeddings(token=HF_TOKEN)


def createvectore_store(pdf_path: str, collection_name: str):
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    if not documents:
        raise ValueError(
            "Could not read any pages from the PDF. The file may be empty or corrupted."
        )

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.split_documents(documents)

    # Filter out empty/whitespace-only chunks
    docs = [d for d in docs if d.page_content.strip()]

    if not docs:
        raise ValueError(
            "No readable text found in the PDF. "
            "If this is a scanned PDF (image only), please use an OCR tool to make it searchable first."
        )

    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=embed_model,
        collection_name=collection_name,
        persist_directory="./db"
    )
    print(f"[vectorstore] Created collection '{collection_name}' with {len(docs)} chunks.")
    return vector_store


def load_vectorstore(collection_name: str):
    return Chroma(
        collection_name=collection_name,
        embedding_function=embed_model,
        persist_directory="./db"
    )
