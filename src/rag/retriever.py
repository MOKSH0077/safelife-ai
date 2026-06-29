from src.rag.vectorstore import createvectore_store,load_vectorstore

def get_retriever(collection_name):
    store = load_vectorstore(collection_name)
    retriever = store.as_retriever(search_kwargs={"k": 4})
    return retriever
