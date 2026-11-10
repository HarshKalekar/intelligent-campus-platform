
import chromadb

client = chromadb.PersistentClient(
    path="./vector_db/chroma_data"
)

collection = client.get_collection(
    name="campus_opportunities"
)

# CREATE: Add a temporary opportunity
collection.add(
    ids=["test_999"],
    documents=[
        "A cybersecurity internship focused on ethical hacking "
        "and network penetration testing."
    ],
    metadatas=[{
        "title": "Cybersecurity Test Internship",
        "category": "Internship"
    }]
)
print("CREATE: Temporary opportunity added.")

# READ: Retrieve the opportunity
result = collection.get(ids=["test_999"])
print("\nREAD:", result["metadatas"])

# UPDATE: Modify the opportunity
collection.update(
    ids=["test_999"],
    documents=[
        "An advanced cybersecurity internship covering "
        "ethical hacking, penetration testing and network defense."
    ],
    metadatas=[{
        "title": "Advanced Cybersecurity Internship",
        "category": "Internship"
    }]
)
print("\nUPDATE: Opportunity updated.")

# Verify update
result = collection.get(ids=["test_999"])
print("Updated record:", result["metadatas"])

# DELETE: Remove the temporary opportunity
collection.delete(ids=["test_999"])
print("\nDELETE: Temporary opportunity removed.")

# Verify deletion and original records
print("Temporary record count:", collection.get(ids=["test_999"])["ids"].__len__())
print("Final opportunity count:", collection.count())
