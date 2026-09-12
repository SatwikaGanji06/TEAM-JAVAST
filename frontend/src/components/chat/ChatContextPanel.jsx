import StatusBadge from '../StatusBadge.jsx'

export default function ChatContextPanel({ context }) {
  return (
    <aside className="h-full overflow-y-auto rounded-sm border border-line bg-panel px-4 py-4">
      <h2 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
        Analysis context
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">
            Document
          </dt>
          <dd className="mt-1 break-all text-ink">{context.document}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">
            Analysis
          </dt>
          <dd className="mt-1 text-ink">{context.analysis}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">
            Status
          </dt>
          <dd className="mt-1">
            <StatusBadge tone="online">{context.status}</StatusBadge>
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ['Findings', context.findings],
          ['High', context.high],
          ['Medium', context.medium],
          ['Low', context.low],
        ].map(([label, value]) => (
          <div key={label} className="rounded-sm border border-line px-2.5 py-2">
            <p className="text-[10px] tracking-wide text-muted uppercase">
              {label}
            </p>
            <p className="mt-0.5 text-sm text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h3 className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
          Available context
        </h3>
        <ul className="mt-2 space-y-1.5">
          {context.sources.map((source) => (
            <li key={source} className="text-xs text-ink-secondary">
              <span className="mr-2 text-success">✓</span>
              {source}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h3 className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
          Current model
        </h3>
        <p className="mt-2 text-sm text-ink">{context.model}</p>
        <p className="mt-2 text-[10px] tracking-[0.14em] text-muted uppercase">
          Runtime: {context.runtime}
        </p>
        <p className="mt-1 text-[10px] tracking-[0.14em] text-muted uppercase">
          Execution: {context.execution}
        </p>
        <p className="mt-3 text-[10px] tracking-[0.14em] text-muted uppercase">
          Simulated · not connected
        </p>
      </div>
    </aside>
  )
}
