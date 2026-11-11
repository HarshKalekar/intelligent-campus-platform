import os
import mysql.connector
import chromadb
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / "backend" / ".env")

db = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST", "localhost"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE", "intelligent_campus")
)

cursor = db.cursor(dictionary=True)

# Fetch actual opportunities from MySQL
cursor.execute("""
    SELECT
        o.opportunity_id,
        o.title,
        o.description,
        o.opportunity_type,
        c.category_name
    FROM opportunities o
    JOIN categories c
        ON o.category_id = c.category_id
    ORDER BY o.opportunity_id
""")

opportunities = cursor.fetchall()

# Connect to persistent ChromaDB
client = chromadb.PersistentClient(
    path="./vector_db/chroma_data"
)

collection = client.get_or_create_collection(
    name="campus_opportunities",
    metadata={"hnsw:space": "cosine"}
)

# Add or update opportunity documents
for opportunity in opportunities:
    document = (
        f"Opportunity: {opportunity['title']}. "
        f"Description: {opportunity['description']} "
        f"Type: {opportunity['opportunity_type']}. "
        f"Category: {opportunity['category_name']}."
    )

    collection.upsert(
        ids=[str(opportunity["opportunity_id"])],
        documents=[document],
        metadatas=[{
            "mysql_opportunity_id": opportunity["opportunity_id"],
            "title": opportunity["title"],
            "type": opportunity["opportunity_type"],
            "category": opportunity["category_name"]
        }]
    )

print(f"Successfully loaded {len(opportunities)} opportunities!")
print("Total documents in ChromaDB:", collection.count())

cursor.close()
db.close()
