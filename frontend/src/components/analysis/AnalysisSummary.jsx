export default function AnalysisSummary({
  documentName,
  analysisLabel,
  canStart,
  onStart,
}) {
  return (
    <div className="rounded-sm border border-line bg-panel px-4 py-4">
      <dl className="space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-xs tracking-[0.14em] text-muted uppercase">
            Document
          </dt>
          <dd className="truncate text-ink">
            {documentName ?? 'No document selected'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-xs tracking-[0.14em] text-muted uppercase">
            Analysis
          </dt>
          <dd className="text-ink">{analysisLabel}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-muted">
        Analysis will be processed using the local AI infrastructure.
      </p>

      <button
        type="button"
        disabled={!canStart}
        onClick={onStart}
        className={`mt-5 w-full rounded-sm px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors ${
          canStart
            ? 'bg-accent text-app hover:bg-accent-strong'
            : 'cursor-not-allowed bg-elevated text-muted'
        }`}
      >
        Start analysis →
      </button>
    </div>
  )
}
