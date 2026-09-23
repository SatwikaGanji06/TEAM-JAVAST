import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'

function formatTimestamp(timestamp) {
  if (!timestamp) return '—'

  try {
    return new Date(timestamp).toLocaleString()
  } catch {
    return timestamp
  }
}

function timestampValue(timestamp) {
  const value = timestamp ? new Date(timestamp).getTime() : NaN
  return Number.isFinite(value) ? value : 0
}

function SecurityCard({ label, value, description }) {
  return (
    <div className="rounded border border-line bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </p>

        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-success">
          ACTIVE
        </span>
      </div>

      <p className="mt-3 text-lg font-medium text-ink">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted">
        {description}
      </p>
    </div>
  )
}

function actionLabel(action) {
  const labels = {
    AGENT_PLAN: 'Agent planning',
    DOCUMENT_READER: 'Document reader',
    RAG_SEARCH: 'RAG search',
    CALCULATOR: 'Calculator',
    VERIFICATION: 'Verification',
    LLM_RESPONSE: 'LLM response',
    MODEL_SELECTED: 'Model selected',
    MODEL_INFERENCE: 'Model inference',
    REQUEST_FAILED: 'Request failed',
  }

  return labels[action] || String(action || 'Event')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function resourceLabel(resource) {
  const labels = {
    industrial_analysis: 'Industrial analysis',
    tool_analysis: 'Tool analysis',
    general_chat: 'General chat',
    agent: 'Agent',
    system: 'System',
  }

  return labels[resource] || String(resource || 'system').replaceAll('_', ' ')
}

function fallbackQuery(group) {
  const first = group.events[0]
  const resource = first?.resource

  if (resource === 'industrial_analysis') {
    return 'Industrial analysis operation'
  }

  if (resource === 'tool_analysis') {
    return 'Tool analysis operation'
  }

  if (resource === 'general_chat') {
    return 'General chat request'
  }

  if (first?.action === 'REQUEST_FAILED') {
    return 'Failed request'
  }

  return `${resourceLabel(resource)} operation`
}

function eventExecution(event) {
  return event.execution || (event.external_call ? 'EXTERNAL' : 'LOCAL')
}

function eventExternalApi(event) {
  return (event.external_api ?? event.external_call) ? 'YES' : 'NO'
}

function eventDataEgress(event) {
  return (event.data_egress ?? event.external_call) ? 'YES' : 'NO'
}

function eventSucceeded(event) {
  return Boolean(event.success)
}

function groupAuditEvents(events) {
  const chronological = [...events].sort(
    (a, b) => timestampValue(a.timestamp) - timestampValue(b.timestamp),
  )

  const groups = []
  let current = null

  for (const event of chronological) {
    const startsOperation = event.action === 'AGENT_PLAN'

    if (startsOperation) {
      if (current) groups.push(current)

      current = {
        id: `operation-${groups.length}-${event.timestamp || 'unknown'}`,
        events: [event],
      }
      continue
    }

    if (current) {
      current.events.push(event)
      continue
    }

    groups.push({
      id: `standalone-${groups.length}-${event.timestamp || 'unknown'}`,
      events: [event],
    })
  }

  if (current) groups.push(current)

  return groups
}

function runTaskMatchesGroup(run, group) {
  const resources = new Set(group.events.map((event) => event.resource))
  const task = String(run?.task || '')

  if (!task) return true
  if (task === 'industrial_analysis') return resources.has('industrial_analysis')
  if (task === 'tool_analysis') return resources.has('tool_analysis')
  if (task === 'general_chat') return resources.has('general_chat')

  return false
}

function matchRunsToGroups(groups, runs) {
  const usedRunIds = new Set()
  const sortedRuns = [...runs].sort(
    (a, b) => timestampValue(b.created_at) - timestampValue(a.created_at),
  )

  return groups.map((group) => {
    const eventTimes = group.events
      .map((event) => timestampValue(event.timestamp))
      .filter(Boolean)

    if (eventTimes.length === 0) {
      return { ...group, run: null }
    }

    let bestRun = null
    let bestDistance = Infinity

    for (const run of sortedRuns) {
      if (usedRunIds.has(run?.run_id)) continue
      if (!runTaskMatchesGroup(run, group)) continue

      const runTime = timestampValue(run.created_at)
      if (!runTime) continue

      const distance = Math.min(
        ...eventTimes.map((eventTime) => Math.abs(eventTime - runTime)),
      )

      // Audit events and the persisted run are created during the same
      // execution. Keep matching conservative so we never invent a run link.
      if (distance <= 15 * 60 * 1000 && distance < bestDistance) {
        bestRun = run
        bestDistance = distance
      }
    }

    if (bestRun) usedRunIds.add(bestRun.run_id)

    return { ...group, run: bestRun }
  })
}

function operationStatus(group) {
  if (group.run?.status) {
    return String(group.run.status).toLowerCase()
  }

  const verification = group.events.find((event) => event.action === 'VERIFICATION')
  if (verification?.details?.toLowerCase().includes('verified')) return 'verified'

  return group.events.every((event) => eventSucceeded(event)) ? 'success' : 'failed'
}

function statusLabel(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'verified') return 'Verified'
  if (normalized === 'success' || normalized === 'successful') return 'Success'
  if (normalized === 'failed' || normalized === 'failure') return 'Failed'
  return normalized ? normalized : 'Unknown'
}

function statusClass(status) {
  const normalized = String(status || '').toLowerCase()
  return normalized === 'failed' || normalized === 'failure'
    ? 'text-warning'
    : 'text-success'
}

function EventRow({ event }) {
  return (
    <div className="border-t border-line px-4 py-4 first:border-t-0 sm:px-5">
      <div className="grid gap-3 md:grid-cols-[155px_165px_1fr_100px] md:items-start">
        <div>
          <p className="text-xs text-muted">
            {formatTimestamp(event.timestamp)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            {actionLabel(event.action)}
          </p>

          <p className="mt-1 text-xs text-muted">
            {event.resource || 'system'}
          </p>
        </div>

        <div>
          <p className="text-sm leading-6 text-ink">
            {event.details || 'Local workbench event'}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
            <span>Execution: {eventExecution(event)}</span>
            <span>External API: {eventExternalApi(event)}</span>
            <span>Data Egress: {eventDataEgress(event)}</span>
          </div>

          {event.model ? (
            <p className="mt-1 text-xs text-muted">
              Model: {event.model}
            </p>
          ) : null}
        </div>

        <div className="text-left md:text-right">
          <span
            className={
              eventSucceeded(event)
                ? 'text-xs font-semibold uppercase tracking-[0.12em] text-success'
                : 'text-xs font-semibold uppercase tracking-[0.12em] text-warning'
            }
          >
            {eventSucceeded(event) ? 'Success' : 'Failed'}
          </span>
        </div>
      </div>
    </div>
  )
}

function AuditOperation({ operation, expanded, onToggle }) {
  const { events, run } = operation
  const status = operationStatus(operation)
  const firstEvent = events[0]
  const query = run?.query || fallbackQuery(operation)
  const model = run?.model || events.find((event) => event.model)?.model || '—'
  const documentIds = Array.isArray(run?.document_ids) ? run.document_ids : []
  const executionEvents = events.map((event) => actionLabel(event.action))
  const uniqueExecutionEvents = executionEvents.filter(
    (label, index) => executionEvents.indexOf(label) === index,
  )

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-4 text-left transition-colors hover:bg-surface sm:px-5"
        aria-expanded={expanded}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 w-3 shrink-0 text-xs text-muted">
                {expanded ? '▼' : '▶'}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {query}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                  {run?.run_id ? <span>Run #{run.run_id}</span> : null}
                  <span className={statusClass(status)}>
                    {statusLabel(status)}
                  </span>
                  <span>{events.length} event{events.length === 1 ? '' : 's'}</span>
                  <span>LOCAL</span>
                  {model !== '—' ? <span>{model}</span> : null}
                </div>

                <p className="mt-2 truncate text-xs text-muted">
                  {uniqueExecutionEvents.join(' → ')}
                </p>
              </div>
            </div>
          </div>

          <div className="pl-6 text-left md:pl-0 md:text-right">
            <p className="text-xs text-muted">
              {formatTimestamp(firstEvent?.timestamp)}
            </p>

            {documentIds.length > 0 ? (
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                Documents {documentIds.map((id) => `#${id}`).join(', ')}
              </p>
            ) : null}
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-line bg-surface/60 px-4 py-5 sm:px-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
            <div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Request
                </p>
                <p className="mt-2 text-sm leading-6 text-ink">
                  {query}
                </p>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Execution Events
                </p>

                <div className="rounded border border-line bg-white">
                  {events.map((event, index) => (
                    <EventRow
                      key={`${event.timestamp}-${event.action}-${index}`}
                      event={event}
                    />
                  ))}
                </div>
              </div>
            </div>

            <aside className="rounded border border-line bg-white px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                System
              </p>

              <dl className="mt-3 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Run</dt>
                  <dd className="text-right text-ink">
                    {run?.run_id ? `#${run.run_id}` : '—'}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Model</dt>
                  <dd className="text-right text-ink">{model}</dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Execution</dt>
                  <dd className="text-right text-ink">
                    {eventExecution(events[events.length - 1] || {})}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">External API</dt>
                  <dd className="text-right text-ink">
                    {events.some((event) => eventExternalApi(event) === 'YES') ? 'YES' : 'NO'}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted">Data Egress</dt>
                  <dd className="text-right text-ink">
                    {events.some((event) => eventDataEgress(event) === 'YES') ? 'YES' : 'NO'}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function Audit() {
  const [events, setEvents] = useState([])
  const [runs, setRuns] = useState([])
  const [expanded, setExpanded] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAudit() {
    try {
      setLoading(true)
      setError('')

      const [auditResponse, runsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/audit`),
        fetch(`${API_BASE_URL}/api/runs`),
      ])

      if (!auditResponse.ok) {
        throw new Error('Unable to load audit events.')
      }

      if (!runsResponse.ok) {
        throw new Error('Unable to load run history.')
      }

      const auditData = await auditResponse.json()
      const runsData = await runsResponse.json()

      setEvents(Array.isArray(auditData?.events) ? auditData.events : [])
      setRuns(Array.isArray(runsData?.runs) ? runsData.runs : [])
    } catch (err) {
      setError(err.message || 'Unable to load local audit data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudit()
  }, [])

  const operations = useMemo(() => {
    const grouped = groupAuditEvents(events)
    return matchRunsToGroups(grouped, runs).sort(
      (a, b) => timestampValue(b.events[0]?.timestamp) - timestampValue(a.events[0]?.timestamp),
    )
  }, [events, runs])

  function toggleOperation(id) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totalOperations = operations.length
  const successfulOperations = operations.filter((operation) => {
    const status = String(operationStatus(operation)).toLowerCase()
    return status === 'success' || status === 'verified'
  }).length
  const failedOperations = operations.filter((operation) => {
    const status = String(operationStatus(operation)).toLowerCase()
    return status === 'failed' || status === 'failure'
  }).length
  const verifiedOperations = operations.filter((operation) => {
    return String(operationStatus(operation)).toLowerCase() === 'verified'
  }).length

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <PageHeader
        title="Audit"
        subtitle="Local security and inference events recorded by the workbench."
      />

      <section className="mb-6">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">
          Security &amp; Data Boundary
        </p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SecurityCard
            label="Local Inference"
            value="Qwen3 4B"
            description="Model inference runs through the local Ollama runtime."
          />

          <SecurityCard
            label="External APIs"
            value="NONE"
            description="Core AI requests remain inside the local environment."
          />

          <SecurityCard
            label="Data Egress"
            value="BLOCKED"
            description="Application network policy blocks unauthorized external requests."
          />

          <SecurityCard
            label="Deployment"
            value="ON-PREMISE"
            description="Processing and storage are designed to remain within controlled infrastructure."
          />
        </div>
      </section>

      <section className="mb-6 rounded border border-line bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Data Boundary
            </p>

            <p className="mt-1 text-sm text-muted">
              User input → Agent → Local Model → Response
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-success">
              LOCAL ONLY
            </p>

            <p className="mt-1 text-xs text-muted">
              External API: None
            </p>
          </div>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Local Audit Trail
          </p>

          <p className="mt-1 text-sm text-muted">
            {operations.length} operation{operations.length === 1 ? '' : 's'} · {events.length} recent event{events.length === 1 ? '' : 's'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadAudit}
          className="rounded border border-line bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-ink hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded border border-line bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Total Operations
          </p>
          <p className="mt-2 text-2xl font-medium text-ink">
            {totalOperations}
          </p>
        </div>

        <div className="rounded border border-line bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Successful
          </p>
          <p className="mt-2 text-2xl font-medium text-success">
            {successfulOperations}
          </p>
        </div>

        <div className="rounded border border-line bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Failed
          </p>
          <p className="mt-2 text-2xl font-medium text-warning">
            {failedOperations}
          </p>
        </div>

        <div className="rounded border border-line bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Verified
          </p>
          <p className="mt-2 text-2xl font-medium text-success">
            {verifiedOperations}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-line bg-white">
        {loading ? (
          <div className="p-8 text-sm text-muted">
            Loading local audit events...
          </div>
        ) : error ? (
          <div className="p-8 text-sm text-warning">
            {error}
          </div>
        ) : operations.length === 0 ? (
          <div className="p-8">
            <p className="text-sm font-medium text-ink">
              No audit events yet.
            </p>

            <p className="mt-1 text-sm text-muted">
              Use General Chat or Analysis, then return here to see the local execution trail.
            </p>
          </div>
        ) : (
          <div>
            {operations.map((operation) => (
              <AuditOperation
                key={operation.id}
                operation={operation}
                expanded={expanded.has(operation.id)}
                onToggle={() => toggleOperation(operation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

