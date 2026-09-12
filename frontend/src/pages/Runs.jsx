import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { RUNS, runStatusLabel, runStatusTone } from '../data/runsData.js'

export default function Runs({ onNavigate }) {
  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Runs"
        subtitle="Sample run history for layout. These cards are not Agent Chat executions, and live run tracking is not connected yet."
      />

      <ul className="space-y-3">
        {RUNS.map((run) => (
          <li
            key={run.id}
            className="flex flex-col gap-3 rounded-sm border border-line bg-panel px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm text-ink">{run.title}</p>
              <p className="mt-1 text-xs text-muted">{run.document}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StatusBadge tone={runStatusTone(run.status)}>
                  {runStatusLabel(run.status)}
                </StatusBadge>
                {run.findings != null ? (
                  <span className="text-xs text-ink-secondary">
                    {run.findings} findings
                  </span>
                ) : null}
                <span className="text-xs text-muted">{run.time}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('run-detail', { runId: run.id })}
              className="shrink-0 rounded-sm border border-line-strong px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:bg-hover"
            >
              View run
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
