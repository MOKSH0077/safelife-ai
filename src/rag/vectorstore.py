from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma 
from langchain_core.embeddings import Embeddings
from dotenv import load_dotenv
import os
import requests
from typing import List

load_dotenv()

class HuggingFaceServerlessEmbeddings(Embeddings):
    def __init__(self, model_name: str, hf_token: str):
        self.model_name = model_name
        self.hf_token = hf_token
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}"
        self.headers = {"Authorization": f"Bearer {hf_token}"}

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # Replace newlines, which can negatively affect performance
        texts = [text.replace("\n", " ") for text in texts]
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json={"inputs": texts, "options": {"wait_for_model": True}},
                timeout=30
            )
            if response.status_code != 200:
                raise ValueError(f"Hugging Face API returned error {response.status_code}: {response.text}")
            return response.json()
        except Exception as e:
            raise ValueError(f"Failed to fetch serverless embeddings: {str(e)}")

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]


# Check for HuggingFace Token
hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")

if hf_token:
    embed_model = HuggingFaceServerlessEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        hf_token=hf_token
    )
else:
    raise ValueError("HF_TOKEN or HUGGINGFACEHUB_API_TOKEN environment variable is required.")

def createvectore_store(pdf_path:str,collection_name:str):
    load_dotenv()
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    if not documents:
        raise ValueError("Could not read any pages from the PDF. The file may be empty or corrupted.")

    text_spliter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_spliter.split_documents(documents)
    
    # Filter out empty chunks
    docs = [d for d in docs if d.page_content.strip()]
    if not docs:
        raise ValueError("No readable text found in the PDF. If this is a scanned PDF (image only), please use an OCR tool to make it searchable first.")

    vector_store=Chroma.from_documents(documents=docs,embedding=embed_model,collection_name=collection_name,persist_directory="./db")
    print("vector store created successfully")
    return vector_store

def load_vectorstore(collection_name:str):
    load_dotenv()
    vector_store=Chroma(collection_name=collection_name,embedding_function=embed_model,persist_directory="./db")
    return vector_store
