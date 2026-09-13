import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const SOVEREIGNTY_ITEMS = [
  {
    id: 'local-processing',
    title: 'Local processing',
    detail:
      'The browser sends RAG upload and query requests to the local FastAPI backend configured for this workbench.',
  },
  {
    id: 'local-models',
    title: 'Local models',
    detail:
      'The backend is designed to use local Qwen models through Ollama. This page does not verify that those processes are running.',
  },
  {
    id: 'network-policy',
    title: 'Network policy',
    detail:
      'The backend includes a local-host network policy for model calls. That is product configuration, not a live security scan.',
  },
]

export default function Sovereignty() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-8">
      <PageHeader
        title="Sovereignty"
        subtitle="How this workbench is meant to keep processing local. This is configuration and intent, not live network status."
      />

      <div className="mb-6">
        <StatusBadge tone="local" icon="lock">
          Local processing intended
        </StatusBadge>
      </div>

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
