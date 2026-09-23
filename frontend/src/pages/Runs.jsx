import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'

function formatAction(action) {
  const labels = {
    document_reader: 'Document Reader',
    rag_search: 'RAG Search',
    calculator: 'Calculator',
    llm_response: 'LLM Response',
    verification: 'Verification',
  }

  return labels[action] || action?.replaceAll('_', ' ') || 'Execution Step'
}

function formatDate(value) {
  if (!value) return 'Unknown time'

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function statusLabel(status) {
  if (!status) return 'UNKNOWN'
  return status.replaceAll('_', ' ').toUpperCase()
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase()

  const classes =
    normalized === 'verified'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : normalized === 'needs_review'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-slate-200 bg-slate-50 text-slate-600'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] ${classes}`}
    >
      {statusLabel(status)}
    </span>
  )
}

function RunCard({ run }) {
  const [expanded, setExpanded] = useState(false)

  const plan = Array.isArray(run.plan) ? run.plan : []
  const verification = run.verification || {}
  const checks = Array.isArray(verification.checks)
    ? verification.checks
    : []

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full px-5 py-5 text-left"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">
                RUN #{run.run_id}
              </span>
              <StatusBadge status={run.status} />
            </div>

            <h2 className="break-words text-sm font-semibold text-slate-900">
              {run.query}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              {run.task?.replaceAll('_', ' ')} · {formatDate(run.created_at)}
            </p>
          </div>

          <span className="shrink-0 text-xs font-medium text-slate-500">
            {expanded ? 'Hide details' : 'View execution'}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Execution
          </span>

          {plan.length === 0 ? (
            <span className="text-xs text-slate-400">
              No execution steps recorded
            </span>
          ) : (
            plan.map((step, index) => (
              <span key={`${run.run_id}-${index}`} className="flex items-center gap-2">
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium capitalize text-slate-700">
                  {formatAction(step.action)}
                </span>
                {index < plan.length - 1 && (
                  <span className="px-1 text-sm font-medium text-slate-300">
                    &rarr;
                  </span>
                )}
              </span>
            ))
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5">
          <div className="grid gap-5 md:grid-cols-2">
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Verification
              </h3>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-600">
                    Status
                  </span>
                  <StatusBadge status={verification.status || run.status} />
                </div>

                {checks.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {checks.map((check, index) => (
                      <div
                        key={`${run.run_id}-check-${index}`}
                        className="flex gap-3"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            check.passed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {check.passed ? String.fromCharCode(10003) : '!'}
                        </span>

                        <div>
                          <p className="text-xs font-medium text-slate-700">
                            {check.name || 'Verification check'}
                          </p>
                          {check.message && (
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {check.message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Documents
              </h3>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {Array.isArray(run.document_ids) && run.document_ids.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {run.document_ids.map((id) => (
                      <span
                        key={id}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                      >
                        Document #{id}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No documents were attached to this run.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </article>
  )
}

export default function Runs() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadRuns() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/runs`)

        if (!response.ok) {
          throw new Error('Unable to load run history.')
        }

        const data = await response.json()

        if (!cancelled) {
          setRuns(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error && err.message
              ? err.message
              : 'Unable to load run history.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRuns()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <PageHeader
        title="Runs"
        subtitle="Inspect the execution chain and verification results from completed local agent runs."
      />

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500 shadow-sm">
          Loading run history...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && runs.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            No runs yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Completed agent analyses will appear here after an analysis is
            executed.
          </p>
        </div>
      )}

      {!loading && !error && runs.length > 0 && (
        <div className="space-y-4">
          {runs.map((run) => (
            <RunCard key={run.run_id} run={run} />
          ))}
        </div>
      )}
    </div>
  )
}


