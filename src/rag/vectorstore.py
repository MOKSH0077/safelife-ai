"""
vectorstore.py — BM25-based retrieval (no embedding models, no external APIs)

Why BM25?
- Chroma + local models (FastEmbed) → 300MB+ RAM → Render 512MB OOM crash
- Chroma + HuggingFace API → DNS resolution fails on Render ([Errno -5])
- BM25 → pure Python keyword search, zero RAM, zero external API, 100% reliable
"""

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.retrievers import BM25Retriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import os
import json


# Directory to persist document chunks as JSON
CHUNKS_DIR = "./db/chunks"
os.makedirs(CHUNKS_DIR, exist_ok=True)


def _chunks_path(collection_name: str) -> str:
    return os.path.join(CHUNKS_DIR, f"{collection_name}.json")


def _save_chunks(collection_name: str, docs: list[Document]) -> None:
    """Persist document chunks to a JSON file."""
    data = [{"page_content": d.page_content, "metadata": d.metadata} for d in docs]
    with open(_chunks_path(collection_name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _load_chunks(collection_name: str) -> list[Document]:
    """Load persisted document chunks from JSON."""
    path = _chunks_path(collection_name)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Document(page_content=d["page_content"], metadata=d["metadata"]) for d in data]


def createvectore_store(pdf_path: str, collection_name: str):
    """Load a PDF, split into chunks and save for BM25 retrieval."""
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    if not documents:
        raise ValueError(
            "Could not read any pages from the PDF. The file may be empty or corrupted."
        )

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.split_documents(documents)

    # Remove empty/whitespace-only chunks
    docs = [d for d in docs if d.page_content.strip()]

    if not docs:
        raise ValueError(
            "No readable text found in the PDF. "
            "If this is a scanned PDF (image only), please use an OCR tool to make it searchable first."
        )

    _save_chunks(collection_name, docs)
    print(f"[vectorstore] Saved {len(docs)} chunks for collection '{collection_name}'.")
    return docs  # Return list so main.py success check works


def load_vectorstore(collection_name: str):
    """Return a BM25-based retriever wrapper that matches the Chroma interface."""
    docs = _load_chunks(collection_name)
    if not docs:
        # Return an empty retriever — agent will get no context but won't crash
        docs = [Document(page_content="No document uploaded yet.", metadata={})]

    retriever = BM25Retriever.from_documents(docs, k=4)

    # Wrap in an object that exposes .as_retriever() to keep retriever.py unchanged
    class _RetrieverWrapper:
        def as_retriever(self, **kwargs):
            return retriever

    return _RetrieverWrapper()
