from langgraph.graph import StateGraph, END,START
from typing import TypedDict,List,Annotated
# Hinglish Comment: retriever.py se get_all_chunks bhi import kiya taaki user ki report ka poora text direct fetch kiya ja sake.
from src.rag.retriever import get_retriever, get_all_chunks
from src.prompts.prompts import MEDICAL_PROMPT
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import operator

import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.messages import BaseMessage,HumanMessage,AIMessage,SystemMessage
load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)

class MedicalState(TypedDict):
    messages:Annotated[List[BaseMessage],operator.add]
    context:List[str]
    question:str
    # Hinglish Comment: uploaded_files state mein add kiya taaki frontend se aayi files ki list retriever node tak pahunch sake.
    uploaded_files:list

# Hinglish Comment: Agar user "explain/summarize" jaise words bolega, toh direct full document chunks load honge.
EXPLAIN_WORDS = ["explain","summarize","batao","samjhao","kya hai","what is","translate","read"]

def retriver_node(state:MedicalState):
    question=state['question']
    uploaded_files=state.get('uploaded_files') or []
    # Hinglish Comment: Sirf medical type ki uploaded files ko filter kiya.
    medical_files=[f for f in uploaded_files if f.get('type')=='medical']

    # Hinglish Comment: Agar user query "explain this document" jaisi generic hai, toh blind semantic search bypass karke 
    # seedhe get_all_chunks se poori file page order mein load karenge taaki LLM use explain kar sake. 
    # Lekin agar query specific hai (e.g. "blood pressure kitna hai"), toh normal vector search (retriever.invoke) chalega.
    if medical_files and any(w in question.lower() for w in EXPLAIN_WORDS):
        context = get_all_chunks('medical', medical_files[0]['name'], 'data/medical_pdfs')
    else:
        retriver=get_retriever('medical')
        chunks=retriver.invoke(question)
        context = [chunk.page_content for chunk in chunks]
    return {"context":context}

def generate_node(state:MedicalState):
    context=state['context']
    joined_context="\n".join(context)
    recent = state["messages"][-2:] if len(state["messages"]) > 2 else state["messages"]
    human_message=HumanMessage(content=f"Question:{state['question']}\n\nContext:{joined_context}")
    system_message=SystemMessage(content=MEDICAL_PROMPT)
    response=llm.invoke([system_message,*recent,human_message])
    return {"messages":[response]}

graph=StateGraph(MedicalState)

graph.add_node('retrieve',retriver_node)
graph.add_node('generate',generate_node)

graph.add_edge(START,'retrieve')
graph.add_edge('retrieve','generate')
graph.add_edge('generate',END)
conn = sqlite3.connect("./safelife.db", check_same_thread=False)
memory = SqliteSaver(conn)
medical_graph=graph.compile(checkpointer=memory)