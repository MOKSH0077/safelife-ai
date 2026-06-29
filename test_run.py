import os
import sqlite3
import sys
# Support UTF-8 output on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

from src.rag.vectorstore import createvectore_store
from src.agents.router import route

# 1. Ingest the fraud PDF if the database is not created yet
pdf_path = "data/fraud_docs/9781118103142.excerpt.pdf"
db_path = "./db"

if not os.path.exists(db_path):
    print("Ingesting fraud document into vector store...")
    if os.path.exists(pdf_path):
        createvectore_store(pdf_path, "fraud")
        print("Ingestion complete!")
    else:
        print(f"Error: Fraud PDF not found at {pdf_path}")
else:
    print("Vector database already exists. Skipping ingestion.")

# 2. Test the router with a fraud query
test_query = "I received a message claiming I won a cash prize of 1 Lakh rupees from KBC, and asking me to click on a link to claim it. Is this safe?"
print(f"\n--- Testing Query ---\nQuery: {test_query}\n")

# Call the route function
response = route(test_query, thread="test-thread-123")

print("\n--- AI Response ---")
print(response.content if hasattr(response, 'content') else response)
