import chromadb

# Create persistent ChromaDB client
client = chromadb.PersistentClient(
    path="./vector_db/chroma_data"
)

# Create a collection for campus opportunities
collection = client.get_or_create_collection(
    name="campus_opportunities",
    metadata={"hnsw:space": "cosine"}
)

print("ChromaDB connected successfully!")
print("Collection:", collection.name)
print("Existing documents:", collection.count())