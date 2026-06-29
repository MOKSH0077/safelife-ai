from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma 
from dotenv import load_dotenv
import os

load_dotenv()

# Check for HuggingFace Token (for serverless inference on Render Free Tier)
hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")

if hf_token:
    from langchain_huggingface import HuggingFaceEndpointEmbeddings
    embed_model = HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/all-MiniLM-L6-v2",
        huggingfacehub_api_token=hf_token
    )
else:
    raise ValueError("HF_TOKEN or HUGGINGFACEHUB_API_TOKEN environment variable is required for serverless embeddings. Please configure it to prevent out-of-memory errors on Render.")

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
