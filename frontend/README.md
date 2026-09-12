# Sovereign AI Workbench — Frontend

React + Vite UI for TEAM JAVAST.

The browser talks only to the local FastAPI backend. It does not call Ollama.

## Run

From the repository root, follow the main [README](../README.md). Frontend only:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/**

Optional: copy `.env.example` to `.env`

```text
VITE_API_BASE_URL=http://localhost:8000
```

Scripts: `npm run build`, `npm run preview`, `npm run lint`.

Stack: React 19, Vite 7, JavaScript, Tailwind CSS 4.

## Pages

There is no React Router. `App.jsx` switches pages. The URL stays `/`.

| Sidebar | Component | Notes |
|---|---|---|
| Home | `pages/Home.jsx` | Chat → `api/chatApi.js` → `POST /api/chat` |
| Documents | `pages/Documents.jsx` | File library (session/mock). Analyze seeds Home. |
| Knowledge Base | `pages/KnowledgeBase.jsx` | Reference layout only |
| Runs | `pages/Runs.jsx` / `RunDetail.jsx` | Demo history |
| Models | `pages/Models.jsx` | Model stack copy |
| Sovereignty | `pages/Sovereignty.jsx` | Local-processing overview |
| Profile | `pages/Profile.jsx` | Demo profile + theme |

## Chat path

```text
Home composer
  → sendChatMessage(message)
  → POST ${VITE_API_BASE_URL}/api/chat
  → FastAPI → ask_qwen() → Ollama → Qwen3:4B
```

Attachments in the composer are UI-only until an upload API exists.

## Layout

```text
frontend/src/
├── App.jsx
├── navigation.js
├── api/chatApi.js
├── pages/
├── components/          # sidebar, chat, analysis, results
├── data/
└── theme/
```
