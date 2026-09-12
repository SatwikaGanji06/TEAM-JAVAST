# Sovereign AI Workbench — Frontend

React + Vite UI for TEAM JAVAST’s **sovereign, on-premise, agentic AI workbench**.

This is an industrial control surface for confidential inspection documents — not a generic chatbot. Operators upload a report, watch a local agent workflow, review findings, and ask questions about the analysis. Intelligence belongs behind FastAPI later; this prototype uses **mock data and local React state only**.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/**

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

Stack: React 19, Vite 7, JavaScript (not TypeScript), Tailwind CSS 4.

## Demo workflow

```
New Analysis
  → Agent Run (simulated stages)
  → Analysis Result (findings + recommendation)
  → Ask the Agent (contextual Q&A)
```

Human review is required. The UI never presents AI output as an autonomous approval.

## Implemented pages

| Page | Status | Notes |
| --- | --- | --- |
| **Dashboard** | Implemented (mock) | System status, quick actions, recent runs, local infrastructure |
| **New Analysis** | Implemented (mock) | Document select, analysis type, instructions, start → queued demo state |
| **Agent Run** | Implemented (simulated) | Workflow timeline + live activity log; timed frontend simulation |
| **Analysis Result** | Implemented (mock) | Findings, severity, AI recommendation, human review, approval-note placeholder |
| **Ask the Agent** | Implemented (mock chat) | Contextual Q&A over the current analysis; simulated replies |
| Documents / Knowledge Base / Models / Sovereignty / Coding Agent | Placeholder | Not in this frontend MVP |

Global shell: dark industrial sidebar + top bar with **SYSTEM ONLINE** and **LOCAL**. Local processing is a system-wide property, not a per-analysis toggle.

## Architecture (intended)

```
React / Vite frontend
        │  HTTP APIs (not connected yet)
        ▼
   FastAPI backend
        │
        ▼
      Agent / RAG
        │
        ▼
   Model Router / Ollama
        │
        ▼
  Local models (e.g. Qwen3:4B)
```

The frontend **must not** implement Ollama, OCR, RAG, vector search, agent reasoning, or document generation. Those stay on the backend.

Current prototype: **no FastAPI, Ollama, or Qwen calls**. Chat, agent run, and findings are labeled as demo / simulated.

## Project layout

```text
frontend/
├── src/
│   ├── App.jsx
│   ├── navigation.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── NewAnalysis.jsx
│   │   ├── AgentRun.jsx
│   │   ├── AnalysisResult.jsx
│   │   └── AgentChat.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── analysis/
│   │   ├── agent/
│   │   ├── results/
│   │   └── chat/
│   └── data/          # mock contracts
├── package.json
└── README.md
```

## Design

Dark industrial enterprise workbench: compact spacing, subtle borders, technical typography, restrained accents. Control-room language, not chat bubbles as the primary product.

Ask the Agent is an **investigation layer** on top of:

```
Document → Agent analysis → Findings → Recommendation → Approval note
```

## Still to build

- Knowledge Base / RAG UI
- Models / model router UI
- Sovereignty monitor (real verification)
- Backend API integration (replace mocks)
- Approval-note DOCX generation
- Final demo polish

Coding Agent is **out of MVP** and is not implemented.
