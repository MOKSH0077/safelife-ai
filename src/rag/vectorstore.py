from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

# Google Gemini embeddings — zero RAM, free API, 100% reliable DNS on Render
embed_model = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

def createvectore_store(pdf_path: str, collection_name: str):
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    if not documents:
        raise ValueError("Could not read any pages from the PDF. The file may be empty or corrupted.")

    text_spliter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_spliter.split_documents(documents)

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
    print("vector store created successfully")
    return vector_store

def load_vectorstore(collection_name: str):
    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embed_model,
        persist_directory="./db"
    )
    return vector_store
