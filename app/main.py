import socket
# Force python socket resolver to use IPv4 instead of IPv6 to resolve DNS issues on Render
_original_getaddrinfo = socket.getaddrinfo
def patched_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if family == socket.AF_UNSPEC or family == socket.AF_INET6:
        family = socket.AF_INET
    return _original_getaddrinfo(host, port, family, type, proto, flags)
socket.getaddrinfo = patched_getaddrinfo

import os

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import shutil
from fastapi.middleware.cors import CORSMiddleware
from src.agents.router import route
from src.rag.vectorstore import createvectore_store

app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js development server link allow karne ke liye
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    thread_id: str

class ChatResponse(BaseModel):
    response: str
    category: str

@app.post('/chat',response_model=ChatResponse)
def chat(request:ChatRequest):
    result=route(question=request.question,thread=request.thread_id)
    answer = result["result"]["messages"][-1].content
    category = result["category"]
    
    return ChatResponse(response=answer, category=category)

@app.post('/upload')
async def upload_file(file: UploadFile = File(...), type: str = ...):
    if type == "medical":
        folder = "data/medical_pdfs"
    else:
        folder = "data/fraud_docs"
    os.makedirs(folder, exist_ok=True)
    save_path = f"{folder}/{file.filename}"
    
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
        
    try:
        createvectore_store(save_path, type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
        
    return {"message": f"{type} PDF uploaded successfully!"}


@app.get("/health")
def health():
    return {"status": "ok"}

    