import AgentStep from './AgentStep.jsx'

export default function AgentWorkflow({ steps, progress }) {
  return (
    <section className="rounded-sm border border-line bg-panel px-4 py-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
            Agent workflow
          </h2>
          <p className="mt-1 text-sm text-ink">{progress}%</p>
        </div>
      </div>

      <div className="mb-5 h-1 overflow-hidden rounded-sm bg-elevated">
        <div
          className="h-full bg-accent/80 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol>
        {steps.map((step, index) => (
          <AgentStep
            key={step.id}
            step={step}
            status={step.status}
            isLast={index === steps.length - 1}
          />
        ))}
      </ol>
    </section>
  )
}
