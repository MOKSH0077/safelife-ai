from src.rag.vectorstore import createvectore_store,load_vectorstore

def get_retriever(collection_name):
    store = load_vectorstore(collection_name)
    retriever = store.as_retriever(search_kwargs={"k": 4})
    return retriever

def get_all_chunks(collection_name, file_name, folder):
    """Fetch all chunks of a specific uploaded file, sorted by page."""
    store = load_vectorstore(collection_name)
    # Chroma stores paths with both / and \ so check both
    res = store.get(where={"source": {"$in": [f"{folder}/{file_name}", f"{folder}\\{file_name}"]}})
    docs = res.get("documents", [])
    metas = res.get("metadatas", [])
    sorted_pairs = sorted(zip(docs, metas), key=lambda x: x[1].get("page", 0))
    return [d for d, _ in sorted_pairs]
