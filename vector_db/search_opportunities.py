
import chromadb

client = chromadb.PersistentClient(
    path="./vector_db/chroma_data"
)

collection = client.get_collection(
    name="campus_opportunities"
)

queries = [
    "I want to learn artificial intelligence and machine learning",
    "Find coding competitions where I can build software",
    "I want to become a full stack web developer"
]

for query in queries:
    print("\nSearch:", query)
    print("-" * 60)

    results = collection.query(
        query_texts=[query],
        n_results=3
    )

    for i, title in enumerate(results["metadatas"][0]):
        distance = results["distances"][0][i]

        print(f"{i + 1}. {title['title']}")
        print(f"   Category: {title['category']}")
        print(f"   Distance: {distance:.4f}")
