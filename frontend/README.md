# TEAM JAVAST — Sovereign AI Workbench (Frontend)

The frontend is the user interface for a **sovereign, on-premise, agentic AI workbench** for confidential industrial documents.

It is not a chatbot. It is an industrial control surface for running a local agent pipeline over inspection reports and related records, then producing auditable findings, recommendations, and approval notes — without sending data off-premises.

## Purpose

Operators, inspectors, and reviewers use this UI to:

- Upload confidential inspection reports and related documents
- Define an analysis task
- Launch a local agent run
- Watch OCR, extraction, vision, RAG, reasoning, and recommendation stages
- Review findings and generate an approval note
- Verify that processing stayed on-premise (sovereignty)

All intelligence lives behind the FastAPI backend. This frontend **only** presents workflow, status, and results, and talks to the backend over HTTP APIs.

## Main demo workflow

The primary demonstration path is:

1. **Upload inspection report**
2. **Define task**
3. **Run agent**
4. **OCR / extraction**
5. **Vision analysis**
6. **Local knowledge retrieval (RAG)**
7. **Reasoning**
8. **Recommendation**
9. **Generate approval note**
10. **Sovereignty verification**

The UI should make this pipeline visible as a sequence of stages with status, artifacts, and a final auditable output — not as a free-form chat thread.

## Stack (planned)

- **React** + **Vite**
- Communicates with a **FastAPI** backend
- Backend owns the agent, model router, and local AI models

```
React / Vite frontend
        │  HTTP APIs
        ▼
   FastAPI backend
        │
        ▼
      Agent
        │
        ▼
   Model Router
        │
        ▼
  Local AI models
```

## UI sections

| Section | Role |
| --- | --- |
| **Dashboard** | Overview of runs, recent outputs, system health, and sovereignty status |
| **New Analysis** | Upload documents, define the task, and start an agent run |
| **Agent Run** | Live (or replayed) activity for OCR, extraction, vision, RAG, reasoning, and recommendation |
| **Findings & Recommendation** | Structured findings, risk/recommendation view, and approval-note generation |
| **Knowledge Base** | Local corpus used for RAG; browse sources and retrieval context |
| **Models** | Model router view: which local models are available and which stage uses which model |
| **Sovereignty Monitor** | Evidence that inference, retrieval, and generation stayed on-premise |
| **Outputs** | Generated artifacts (extraction, notes, reports) for download and review |

## Architecture constraints

The frontend **must**:

- Call backend APIs for all analysis, retrieval, generation, and verification
- Use **mock data** when those APIs are not yet available

The frontend **must not** directly implement:

- Ollama or other local model runtimes
- OCR
- RAG / vector search
- Agent reasoning
- Document generation

Those capabilities belong to the backend, agent, and model router.

## Development stages

Build in this order:

1. **Frontend foundation** — Vite + React project, tooling, tokens, mock contracts
2. **Application shell** — layout, navigation, dark industrial chrome
3. **Dashboard**
4. **New Analysis**
5. **Agent Activity** (Agent Run)
6. **Findings & Recommendation**
7. **Knowledge Base / RAG UI**
8. **Models / Model Router**
9. **Sovereignty Monitor**
10. **Backend API integration** — replace mocks with real endpoints
11. **Final demo polish**

## Design direction

**Dark industrial enterprise interface.**

- Professional, technical, secure, and modern
- Dense enough for operators; not a consumer chatbot
- Emphasize pipeline stages, evidence, and auditability
- Visual language: control room / workbench, not chat bubbles

## Current status

This folder currently holds frontend documentation only. React + Vite scaffolding comes in a later stage. Do not assume packages or application source exist here yet.
