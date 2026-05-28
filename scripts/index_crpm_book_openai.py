import os
import re
import time
import hashlib
from pathlib import Path

from dotenv import load_dotenv
import fitz
from tqdm import tqdm
from openai import OpenAI, RateLimitError
from pinecone import Pinecone

load_dotenv(".env.local")

PDF_PATH = Path("data/crpm-book.pdf")
NAMESPACE = "crpm-book-v1"

OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"

CHUNK_WORDS = 900
OVERLAP_WORDS = 120
BATCH_SIZE = 10
EMBED_SLEEP_SECONDS = 0.8

openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

pinecone_client = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)

index = pinecone_client.Index(
    host=os.getenv("PINECONE_INDEX_HOST")
)


def clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def detect_section(text: str) -> str:
    patterns = [
        r"(\d+\.\d+\s+[A-Z][A-Za-z0-9 ,:/()&+\-]+)",
        r"(\d+\)\s+[A-Z][A-Za-z0-9 ,:/()&+\-]+)",
        r"(Machine\s+\d+[:\s]+[A-Za-z0-9 ,:/()&+\-]+)",
        r"(Calculated Risk and Profit Machines\s*\(CRPM\))",
        r"(Theta\s*\(.*?\))",
        r"(Portfolio Delta and Theta)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()

    return "General"


def chunk_words(words, size, overlap):
    start = 0

    while start < len(words):
        end = start + size
        yield words[start:end]

        if end >= len(words):
            break

        start = end - overlap


def make_id(text: str, page_start: int, chunk_index: int) -> str:
    raw = f"{page_start}-{chunk_index}-{text[:200]}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def embed_text(text: str, max_retries: int = 6):
    for attempt in range(max_retries):
        try:
            response = openai_client.embeddings.create(
                model=OPENAI_EMBEDDING_MODEL,
                input=text,
            )

            time.sleep(EMBED_SLEEP_SECONDS)

            return response.data[0].embedding

        except RateLimitError:
            wait_time = min(2 ** attempt, 30)
            print(
                f"Rate limit reached. Waiting {wait_time} seconds..."
            )
            time.sleep(wait_time)

    raise RuntimeError(
        "OpenAI rate limit persisted after retries."
    )


def extract_pages():
    doc = fitz.open(str(PDF_PATH))
    pages = []

    for i, page in enumerate(doc):
        text = page.get_text("text") or ""
        text = clean_text(text)

        if text:
            pages.append(
                {
                    "page": i + 1,
                    "text": text,
                    "section": detect_section(text),
                }
            )

    return pages


def build_chunks(pages):
    chunks = []

    for page in pages:
        words = page["text"].split()

        for idx, chunk in enumerate(
            chunk_words(words, CHUNK_WORDS, OVERLAP_WORDS)
        ):
            chunk_text = " ".join(chunk).strip()

            if len(chunk_text) < 300:
                continue

            chunks.append(
                {
                    "id": make_id(
                        chunk_text,
                        page["page"],
                        idx,
                    ),
                    "text": chunk_text,
                    "page": page["page"],
                    "section": page["section"],
                    "source": "The Essence of Quantitative Math Trading with Options",
                    "author": "Massimiliano Riolfo",
                    "language": "en",
                    "namespace": NAMESPACE,
                }
            )

    return chunks


def upsert_chunks(chunks, batch_size=BATCH_SIZE):
    for i in tqdm(range(0, len(chunks), batch_size)):
        batch = chunks[i : i + batch_size]
        vectors = []

        for chunk in batch:
            vector = embed_text(chunk["text"])

            vectors.append(
                {
                    "id": chunk["id"],
                    "values": vector,
                    "metadata": {
                        "text": chunk["text"],
                        "page": chunk["page"],
                        "section": chunk["section"],
                        "source": chunk["source"],
                        "author": chunk["author"],
                        "language": chunk["language"],
                    },
                }
            )

        index.upsert(
            vectors=vectors,
            namespace=NAMESPACE,
        )

        print(
            f"Uploaded chunks {i + 1} to {min(i + batch_size, len(chunks))}"
        )


def main():
    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f"PDF not found: {PDF_PATH}"
        )

    print("Extracting PDF pages with PyMuPDF...")
    pages = extract_pages()
    print(f"Pages extracted: {len(pages)}")

    print("Building chunks...")
    chunks = build_chunks(pages)
    print(f"Chunks created: {len(chunks)}")

    print("Uploading to Pinecone...")
    upsert_chunks(chunks)

    print("Done.")
    print(f"Namespace: {NAMESPACE}")
    print(f"Chunks uploaded: {len(chunks)}")


if __name__ == "__main__":
    main()