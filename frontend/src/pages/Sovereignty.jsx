import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const SOVEREIGNTY_ITEMS = [
  {
    id: 'local-processing',
    title: 'Local processing',
    detail:
      'Analysis, upload, and search requests stay on the local workbench backend. Cloud AI providers are not wired into this client.',
  },
  {
    id: 'local-models',
    title: 'Local models',
    detail:
      'Retrieval uses the configured Qwen embedding model. Answers use the configured Qwen language model through Ollama.',
  },
  {
    id: 'network-policy',
    title: 'Network policy',
    detail:
      'The backend is designed to allow model calls only to approved local hosts. This page describes that policy; it is not a live scan.',
  },
]

export default function Sovereignty() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <PageHeader
        title="Sovereignty"
        subtitle="How this workbench is intended to keep document analysis on-machine."
      >
        <StatusBadge tone="local" icon="lock">
          Local processing
        </StatusBadge>
      </PageHeader>

      <ul className="space-y-3">
        {SOVEREIGNTY_ITEMS.map((item) => (
          <li key={item.id} className="rounded-sm border border-line bg-panel px-4 py-4">
            <p className="text-sm text-ink">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
