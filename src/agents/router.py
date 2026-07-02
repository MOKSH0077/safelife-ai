from src.agents.fraud_agent import fraud_graph
from src.agents.medical_agent import medical_graph
from langchain_core.messages import BaseMessage,HumanMessage,AIMessage,SystemMessage
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)

def classify(question:str, uploaded_files:list=None):
    files_hint = ""
    if uploaded_files:
        for f in uploaded_files:
            files_hint += f"\nUploaded file: {f.get('name')} (type: {f.get('type')})"

    prompt=f"""You are a classification AI for a senior citizen assistant app.
Classify the user question into exactly one category: 'medical', 'fraud', or 'general'.
Return ONLY one word: 'medical', 'fraud', or 'general'. Nothing else. No punctuation.

- medical: health, body, medicine, report, doctor, hospital, symptoms, disease, blood, sugar, pressure, heart, kidney, prescription, lab test
- fraud: scam, suspicious message/call, OTP, bank fraud, lottery, KYC, phishing, cyber crime, fake offer, link
- general: greeting, chit-chat, hello, hi, how are you, thank you, bye, general help, normal talk

IMPORTANT: If the user asks to explain, summarize or read a document, classify it as the type of the uploaded file.{files_hint}

User question: {question}
Category:"""
    response=llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip().lower()

def route(question:str,thread:str, uploaded_files:list=None):
    category=classify(question, uploaded_files)
    # Hinglish Comment: thread_id update kiya taaki medical, fraud aur general chats aapas mein mix na ho jayein.
    config = {"configurable": {"thread_id": f"{category}_{thread}"}}
    if category=='medical':
        result= medical_graph.invoke({'question':question, 'uploaded_files': uploaded_files},config)
    elif category=='fraud':
        result= fraud_graph.invoke({'question':question, 'uploaded_files': uploaded_files},config)
    elif category=='general':
        # Direct response for general chat without calling RAG
        response = llm.invoke([
            SystemMessage(content="You are a helpful and caring assistant for senior citizens. Be friendly and polite. Respond in a simple Hindi/English mix (Hinglish) like a family member helping them."),
            HumanMessage(content=question)
        ])
        result = {"messages": [response]}
    else:
        result = {"messages": [AIMessage(content="Sorry, I could not understand your question.")]}
    return {"result": result, "category": category}
