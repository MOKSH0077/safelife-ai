from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma 
from dotenv import load_dotenv
import os

load_dotenv()

from langchain_community.embeddings import FastEmbedEmbeddings

embed_model = FastEmbedEmbeddings(
    model_name="BAAI/bge-small-en-v1.5",
    cache_dir="./fastembed_cache"
)

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
