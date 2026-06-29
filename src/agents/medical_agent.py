from langgraph.graph import StateGraph, END,START
from typing import TypedDict,List,Annotated
from src.rag.retriever import get_retriever
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

def retriver_node(state:MedicalState):
    question=state['question']
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