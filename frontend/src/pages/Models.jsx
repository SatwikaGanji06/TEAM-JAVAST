import PageHeader from '../components/PageHeader.jsx'

const CONFIGURED_MODELS = [
  {
    id: 'text',
    name: 'qwen3:4b',
    type: 'llm',
    purpose: 'Reasoning and text generation',
  },
  {
    id: 'embedding',
    name: 'qwen3-embedding:0.6b',
    type: 'embedding',
    purpose: 'Document and query embeddings for RAG',
  },
]

export default function Models() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-8">
      <PageHeader
        title="Models"
        subtitle="Configuration from the local backend router. This is not live model status."
      />

      <p className="mb-4 rounded-sm border border-line bg-panel px-4 py-3 text-sm text-ink-secondary">
        There is no models or health API. Names below are the configured local
        stack, not a probe of Ollama.
      </p>

      <ul className="space-y-3">
        {CONFIGURED_MODELS.map((model) => (
          <li key={model.id} className="rounded-sm border border-line bg-panel px-4 py-4">
            <p className="text-sm text-ink">{model.name}</p>
            <p className="mt-1 text-xs tracking-[0.12em] text-muted uppercase">
              {model.type} · configured
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{model.purpose}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
