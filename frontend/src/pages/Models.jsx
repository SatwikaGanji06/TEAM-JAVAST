import PageHeader from '../components/PageHeader.jsx'
import { MODELS, MODEL_RUNTIME } from '../data/systemData.js'

export default function Models() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-8">
      <PageHeader
        title="Models"
        subtitle="Technical information about the local model stack. This is not a place to start work."
      />

      <section className="rounded-sm border border-line bg-panel px-4 py-4">
        <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Runtime
        </h3>
        <p className="mt-2 text-sm text-ink">{MODEL_RUNTIME.name}</p>
        <p className="mt-1 text-sm text-ink-secondary">{MODEL_RUNTIME.purpose}</p>
        <p className="mt-2 text-xs text-muted">{MODEL_RUNTIME.endpointNote}</p>
      </section>

      <ul className="mt-4 space-y-3">
        {MODELS.map((model) => (
          <li key={model.id} className="rounded-sm border border-line bg-panel px-4 py-4">
            <p className="text-sm text-ink">{model.name}</p>
            <p className="mt-1 text-xs tracking-[0.12em] text-muted uppercase">
              {model.role} · {model.runtime}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{model.notes}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-muted">
        Coding Agent is experimental and is not part of the primary workspace.
      </p>
    </div>
  )
}
