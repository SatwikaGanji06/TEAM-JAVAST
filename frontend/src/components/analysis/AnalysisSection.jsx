export default function AnalysisSection({ number, title, children }) {
  return (
    <section>
      <h2 className="mb-3 flex items-baseline gap-3">
        {number ? (
          <span className="font-mono text-[11px] tracking-[0.18em] text-muted">
            {number}
          </span>
        ) : null}
        <span className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          {title}
        </span>
      </h2>
      {children}
    </section>
  )
}
