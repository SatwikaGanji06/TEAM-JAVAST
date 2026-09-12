# TEAM JAVAST

### Sovereign On-Premise Agentic AI Workbench

Private by design · Local AI · Open-weight models · Industrial knowledge work

An on-premise AI workbench for confidential industrial documents. The currently implemented core product is **local RAG**: upload a PDF or TXT, index it on this machine, ask a question, and get a grounded answer with sources. The browser talks only to the local FastAPI backend. It never calls Ollama, OpenAI, Gemini, or other cloud AI APIs.

```text
Browser (React / Vite :5173)
        │
        ├─ POST /api/rag/upload   (PDF/TXT)
        └─ POST /api/rag/query    (Home Agent Chat)
                │
                ▼
FastAPI backend (:8000)
        │
        ├─ chunk + embed  →  Ollama qwen3-embedding:0.6b (:11434)
        ├─ store/search   →  PostgreSQL + pgvector
        └─ generate       →  Ollama qwen3:4b (:11434)
```

---

## What currently works

**Core flow (Home / Agent Chat)**

1. Attach a **PDF** or **TXT** in Home.
2. The file is uploaded and indexed locally (`POST /api/rag/upload`).
3. Wait until indexing finishes and the file chip appears.
4. Ask a question (`POST /api/rag/query`).
5. The backend embeds the question, retrieves similar chunks from pgvector, and has Qwen generate an answer from that context.
6. Open **View sources** to see retrieved filename, similarity, and chunk text.

This is the implemented product path. Home does **not** use `POST /api/chat`.

**Also implemented**

- FastAPI `POST /api/rag/ingest` (indexes files already in the configured raw directory; not used for a selected Home file)
- FastAPI `POST /api/chat` (plain Qwen chat; still registered, unused by Home)
- Local-host network allow-list for Ollama generation (`localhost:11434`)
- Audit logging for model selection and inference
- Workbench UI shell (Documents, Knowledge Base, Runs, Models, Sovereignty, Profile)

**Not a live document library / analysis product yet**

- Documents page is a workspace/demo list, not the PostgreSQL index
- Knowledge Base page is UI only
- Runs are sample/demo history, not persisted Agent Chat executions
- New Analysis is not a real analysis pipeline
- No document list/delete/re-index HTTP API
- No model switching in the UI

---

## Supported document types

Ingestion currently supports:

- **PDF** (`.pdf`)
- **TXT** (`.txt`)

DOCX, PNG, JPG, and scanned-image OCR are **not** implemented.

---

## Models

Both models run in local [Ollama](https://ollama.com/). The UI does not switch models.

| Model | Role |
|---|---|
| `qwen3-embedding:0.6b` | Embeds document chunks on upload and embeds the question at query time |
| `qwen3:4b` | Generates the grounded answer from retrieved context |

---

## Storage / RAG

PostgreSQL + pgvector is the **searchable source of truth**.

| Store | Role |
|---|---|
| `documents` | Document metadata (name, type, size, storage path, uploader) |
| `document_chunks` | Chunk text, JSON metadata, and `VECTOR(1024)` embeddings |
| pgvector similarity | `VectorStore.search_similar_chunks()` (top 5 neighbors) |

Home queries search this index, not the Documents page list. A query is **corpus-wide**; it is not limited to the file chip shown in the composer.

---

## Backend API

Base URL (default): `http://localhost:8000`

CORS allows `http://localhost:5173` and `http://127.0.0.1:5173`.

### `POST /api/rag/upload`

Multipart form field: `file` (PDF or TXT).

Example response:

```json
{
  "status": "success",
  "document_id": 17,
  "file_name": "safety.txt",
  "chunks_created": 2
}
```

Useful errors (in `detail`): unsupported type, unreadable PDF, Ollama embedding unavailable, document index unavailable.

### `POST /api/rag/query`

```json
{ "query": "What does the procedure say about shutdown?" }
```

Example response:

```json
{
  "answer": "...",
  "sources": [
    {
      "document": "safety.txt",
      "document_id": 17,
      "chunk_index": 0,
      "content": "...",
      "similarity": 0.82,
      "metadata": { "source": "safety.txt" }
    }
  ]
}
```

If nothing usable is retrieved, `answer` is `The information was not found in the indexed documents.` and `sources` is `[]`.

PDF page numbers may be present in `metadata.page`; Home **View sources** currently shows filename, similarity, and chunk text.

### `POST /api/rag/ingest`

No body. Indexes PDF/TXT files already in `RAG_RAW_DOCUMENTS_DIR` (default `rag/data/raw`). This is **not** the Home attach path.

Example response:

```json
{
  "status": "success",
  "documents_processed": 2,
  "chunks_created": 40
}
```

### `POST /api/chat` (not the Home path)

Still registered. Home Agent Chat does not call it.

```json
{ "message": "Explain what you can do." }
```

```json
{ "response": "..." }
```

---

## Prerequisites

- Python 3.12+
- Node.js 18+
- [Ollama](https://ollama.com/) running locally
- PostgreSQL with the **pgvector** extension
- Models: `qwen3:4b` and `qwen3-embedding:0.6b`

---

## Installation

From the **repository root**.

### Backend + RAG libraries

```bash
python -m pip install -r backend/requirements.txt
python -m pip install -r rag/requirements.txt
```

`rag/requirements.txt` includes `pypdf` and `numpy`, which PDF ingestion needs.

### Frontend

```bash
cd frontend
npm install
```

---

## Ollama setup

```bash
ollama serve
ollama pull qwen3:4b
ollama pull qwen3-embedding:0.6b
ollama list
```

Keep `ollama serve` running on port **11434**.

---

## PostgreSQL setup

1. Install PostgreSQL and enable **pgvector**.
2. Create a database. The code default name is `ai_workbench`.
3. Apply schema and seed from the repository root (use your local `psql` role):

```bash
psql -d ai_workbench -f database/schema.sql
psql -d ai_workbench -f database/seed.sql
```

`database/schema.sql` creates `vector`, `documents`, `document_chunks` (embedding `VECTOR(1024)`), and related tables. `database/seed.sql` inserts roles and users.

Upload currently defaults to `uploaded_by=1` (`DOCUMENT_UPLOADER_USER_ID`). Seed creates that user as the first `users` row. If you skip seed, inserts into `documents` will fail the foreign key unless you set a valid user id.

`DATABASE_PASSWORD` must match the local PostgreSQL role. The code default is an empty password; do not assume that works on your machine.

Optional helper (adds/extends embedding columns only; it does not replace `schema.sql`):

```bash
python rag/setup_db.py
```

---

## Environment variables

Variables actually read by the current code:

| Variable | Used by | Default in code |
|---|---|---|
| `DATABASE_NAME` | document service, vector store | `ai_workbench` |
| `DATABASE_USER` | document service, vector store | `postgres` |
| `DATABASE_PASSWORD` | document service, vector store | empty |
| `DATABASE_HOST` | document service, vector store | `localhost` |
| `DATABASE_PORT` | document service, vector store | `5432` |
| `DOCUMENT_UPLOADER_USER_ID` | document insert | `1` |
| `RAG_RAW_DOCUMENTS_DIR` | upload save path and `/api/rag/ingest` | `rag/data/raw` |
| `VITE_API_BASE_URL` | frontend `fetch` | `http://localhost:8000` |

Copy `frontend/.env.example` to `frontend/.env` only if you need to override the API origin.

Do not put secrets in git. Match `DATABASE_*` to your local PostgreSQL role.

---

## Start the application

Use four processes, in this order: PostgreSQL → Ollama → backend → frontend.

### Backend (repository root)

Do **not** `cd backend` and run `uvicorn main:app`. Imports are `backend.*`, so start from the repo root:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Optional terminal Qwen chat (not RAG, also from repo root):

```bash
python -m backend.cli
```

### Frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173/**

---

## Ports

| Service | Port | Who calls it |
|---|---|---|
| Vite (React) | 5173 | Your browser |
| FastAPI | 8000 | The browser (`fetch`) |
| Ollama | 11434 | Python only (`backend/models/qwen.py`, `rag/embeddings/ollama_embeddings.py`) |
| PostgreSQL | 5432 (default) | Python only |

The frontend must not call port 11434.

---

## 3–5 minute demo

1. Start PostgreSQL with pgvector, schema, and seed applied.
2. Start Ollama with `qwen3:4b` and `qwen3-embedding:0.6b`.
3. Start the backend from the repository root.
4. Start the frontend and open Home.
5. Attach a **PDF or TXT** whose content you know.
6. Wait until **Indexing document…** finishes and the indexed file chip appears. Do **not** send before that.
7. Ask a question whose answer is in that file.
8. Show the grounded answer.
9. Click **View sources** and show the retrieved chunk.

**Warnings**

- Send is disabled while indexing; do not ask before the chip appears.
- The query searches the **indexed corpus**, not only the attachment chip.
- Stay on **Home**. Documents / Knowledge Base / Runs are not the live index.

---

## Workbench UI

There is no React Router. The address stays `http://localhost:5173/` while you switch pages in the sidebar.

| Page | What it is today |
|---|---|
| **Home** | Real RAG: attach PDF/TXT, index, ask, answer, View sources |
| **Documents** | Workspace/demo list. Selecting a PDF/TXT still indexes via `/api/rag/upload`; the visible list is not the database library |
| **Knowledge Base** | Layout only. Not the indexed store |
| **Runs** | Sample run history. Not live Agent Chat executions |
| **Models** | Describes the local stack. No model switching |
| **Sovereignty** | Local-processing overview. Not a live security scan |
| **Profile** | Demo identity and theme (dark / light) |

Start on **Home**.

---

## Repository layout

```text
TEAM-JAVAST/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, mounts chat + RAG routers
│   ├── rag_router.py           # POST /api/rag/upload, /query, /ingest
│   ├── router.py               # POST /api/chat
│   ├── cli.py                  # Optional terminal Qwen chat (not RAG)
│   ├── requirements.txt
│   ├── models/qwen.py          # Ollama generation (qwen3:4b)
│   ├── services/               # rag_service, ingestion_service, document_service
│   └── security/
│       ├── audit.py
│       └── network.py          # Local-host allow-list for Ollama
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/ragApi.js       # queryRAG, uploadRAGDocument, ingestRAGDocuments
│   │   ├── api/chatApi.js      # sendChatMessage → /api/chat (unused by Home)
│   │   ├── pages/              # Home is Agent Chat
│   │   ├── components/
│   │   └── data/
│   └── .env.example
├── rag/
│   ├── embeddings/             # qwen3-embedding:0.6b
│   ├── ingestion/              # PDF/TXT load, chunk, embed, store
│   ├── database/postgres.py    # pgvector store/search
│   └── requirements.txt
├── database/
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, native `fetch` |
| Backend | Python, FastAPI, Uvicorn, Pydantic, `requests` |
| Generation | Ollama `qwen3:4b` |
| Embeddings | Ollama `qwen3-embedding:0.6b` |
| Retrieval | PostgreSQL + pgvector (`documents`, `document_chunks`) |

---

## Current limitations

- Ingestion is **PDF and TXT** only.
- Query is **not** filtered to the currently attached file; it searches the indexed corpus.
- Documents is **not** a database-backed library (no list/delete/re-index API).
- Knowledge Base is UI only.
- Runs are not persisted Agent Chat executions.
- New Analysis is not a real analysis pipeline.
- Live demo requires **Ollama + PostgreSQL/pgvector**. The UI cannot fake a successful index or answer if those services are down.
- Model switching is not implemented in the UI.

---

## Security notes

- The browser only contacts the local FastAPI origin (`VITE_API_BASE_URL` or `http://localhost:8000`).
- `ask_qwen()` is blocked unless the destination is an allowed local Ollama URL.
- Audit events are written under `backend/security/`.
- Header **Local** / **System online** badges are UI indicators. Sovereignty status is not a live network attestation.

Do not send document contents to cloud AI APIs.

---

## Troubleshooting

**Upload: “Document indexing requires the local Ollama embedding service.”**

- `ollama serve` must be running.
- `qwen3-embedding:0.6b` must be pulled.

**Upload/query: “Unable to reach the document index.”**

- PostgreSQL must be running with pgvector.
- `DATABASE_*` must match the local role.
- `database/schema.sql` (and seed for `uploaded_by=1`) must be applied.

**Query: “Unable to reach the local AI backend.”**

- FastAPI must be running on port 8000 (started from the **repository root**).
- Ollama must be running with `qwen3:4b`.

**Query: “The information was not found in the indexed documents.”**

- Indexing may not have finished, or the index is empty.
- Ask about content that is actually in an indexed PDF/TXT.

**`ModuleNotFoundError: backend`**

- You started Uvicorn from `backend/` as `main:app`. Use `python -m uvicorn backend.main:app` from the repo root.

**`npm run dev` from the repo root fails.** Run it from `frontend/`.

**Heading / composer not visible.** Click **Home** in the sidebar. The URL does not change between pages.
