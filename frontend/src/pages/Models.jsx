import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const CONFIGURED_MODELS = [
  {
    id: 'text',
    name: 'qwen3:4b',
    type: 'Language model',
    runtime: 'Ollama',
    purpose: 'Turns retrieved document context into analysis answers.',
  },
  {
    id: 'embedding',
    name: 'qwen3-embedding:0.6b',
    type: 'Embedding model',
    runtime: 'Ollama',
    purpose: 'Embeds uploaded documents and search questions for retrieval.',
  },
]

export default function Models() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <PageHeader
        title="Models"
        subtitle="Configured local model stack for this workbench. This page does not probe whether the models are loaded."
      />

      <section className="mb-4 rounded-sm border border-line bg-panel px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm text-ink">Runtime</h3>
            <p className="mt-1 text-sm text-ink-secondary">
              Ollama on this machine. The browser talks only to the local
              workbench backend.
            </p>
          </div>
          <StatusBadge tone="local" icon="lock">
            Configured
          </StatusBadge>
        </div>
      </section>

      <ul className="space-y-3">
        {CONFIGURED_MODELS.map((model) => (
          <li key={model.id} className="rounded-sm border border-line bg-panel px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink">{model.name}</p>
                <p className="mt-1 text-xs tracking-[0.12em] text-muted uppercase">
                  {model.type} · {model.runtime}
                </p>
              </div>
              <StatusBadge tone="local">Configured</StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-secondary">{model.purpose}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
