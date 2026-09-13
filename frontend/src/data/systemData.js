export const WORKBENCH_STATUS = [
  { id: 'system', label: 'SYSTEM', value: 'ONLINE' },
  { id: 'network', label: 'AIR-GAPPED NETWORK', value: '' },
  { id: 'location', label: 'LOCATION', value: 'MRPL UNIT-3' },
]

export const MODELS = [
  {
    id: 'qwen-text',
    name: 'Qwen3:4B',
    role: 'Reasoning and conversation',
    runtime: 'Ollama',
    notes:
      'Local Qwen generation model used by Agent Chat to answer from retrieved document context. This page does not switch models.',
  },
  {
    id: 'qwen-embed',
    name: 'Qwen3 Embedding 0.6B',
    role: 'Document and query embeddings',
    runtime: 'Ollama',
    notes:
      'Used by the RAG pipeline to embed uploaded PDF/TXT documents and questions. This page does not switch models.',
  },
]

export const MODEL_RUNTIME = {
  name: 'Ollama',
  purpose: 'Runs open-weight models on this machine.',
  endpointNote: 'The browser talks only to the local workbench backend, not to Ollama directly.',
}

export const SOVEREIGNTY_ITEMS = [
  {
    id: 'local-processing',
    title: 'Local processing',
    detail:
      'Chat requests are sent to the local FastAPI backend. Model inference is designed to run on this machine through Ollama.',
  },
  {
    id: 'local-models',
    title: 'Local models',
    detail:
      'The conversational path uses Qwen3:4B. No cloud model provider is wired into the chat client.',
  },
  {
    id: 'cloud-ai',
    title: 'Cloud AI',
    detail:
      'This workbench does not call OpenAI, Gemini, or other cloud AI APIs from the frontend.',
  },
  {
    id: 'external-api',
    title: 'External APIs',
    detail:
      'The browser only contacts the local backend origin configured for development.',
  },
  {
    id: 'network',
    title: 'Network restrictions',
    detail:
      'The backend includes a local-host network policy for model calls. This page reports product intent, not a live security scan.',
  },
]
