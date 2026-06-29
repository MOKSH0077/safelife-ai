from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import shutil
import os
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
    createvectore_store(save_path, type)
    return {"message": f"{type} PDF uploaded successfully!"}


@app.get("/health")
def health():
    return {"status": "ok"}

    