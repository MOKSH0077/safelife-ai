from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma 
from dotenv import load_dotenv
import os

load_dotenv()

_embed_model = None

def get_embedding_model():
    global _embed_model
    if _embed_model is None:
        from langchain_community.embeddings import FastEmbedEmbeddings
        _embed_model = FastEmbedEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            cache_dir="./fastembed_cache"
        )
    return _embed_model

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

    vector_store=Chroma.from_documents(documents=docs,embedding=get_embedding_model(),collection_name=collection_name,persist_directory="./db")
    print("vector store created successfully")
    return vector_store

def load_vectorstore(collection_name:str):
    load_dotenv()
    vector_store=Chroma(collection_name=collection_name,embedding_function=get_embedding_model(),persist_directory="./db")
    return vector_store
