export default function RecommendationPanel({ text, basis }) {
  return (
    <aside className="rounded-sm border border-accent/25 bg-panel px-4 py-4">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
        AI recommendation
      </p>
      <p className="mt-1 text-[11px] tracking-wide text-muted">
        AI-generated recommendation — human review required.
      </p>
      <p className="mt-3 text-sm leading-6 text-ink">{text}</p>

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
          Basis
        </p>
        <ul className="mt-2 space-y-1.5">
          {basis.map((item) => (
            <li key={item} className="text-sm text-ink-secondary">
              <span className="mr-2 text-accent">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
