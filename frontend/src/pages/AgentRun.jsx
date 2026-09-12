import { useEffect, useMemo, useState } from 'react'
import AgentWorkflow from '../components/agent/AgentWorkflow.jsx'
import ActivityLog from '../components/agent/ActivityLog.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  AGENT_RUN_META,
  INITIAL_COMPLETED_COUNT,
  INITIAL_EVENTS,
  STEP_ADVANCE_EVENTS,
  STEP_INTERVAL_MS,
  WORKFLOW_STEPS,
} from '../data/agentRunData.js'

function stepStatus(index, completedCount) {
  if (index < completedCount) return 'completed'
  if (index === completedCount && completedCount < WORKFLOW_STEPS.length) {
    return 'running'
  }
  return 'pending'
}

function progressPercent(completedCount) {
  if (completedCount >= WORKFLOW_STEPS.length) return 100
  const whileRunning = [17, 33, 50, 67, 83, 92]
  return whileRunning[completedCount] ?? 0
}

export default function AgentRun({ onNavigate }) {
  const [completedCount, setCompletedCount] = useState(INITIAL_COMPLETED_COUNT)
  const [events, setEvents] = useState(INITIAL_EVENTS)

  const isComplete = completedCount >= WORKFLOW_STEPS.length

  useEffect(() => {
    if (isComplete) return undefined

    const timer = window.setTimeout(() => {
      const current = WORKFLOW_STEPS[completedCount]
      const extraEvents = STEP_ADVANCE_EVENTS[current.id] ?? [
        { time: '--:--:--', message: `${current.title} completed` },
      ]

      setEvents((currentEvents) => [
        ...currentEvents,
        ...extraEvents.map((event, index) => ({
          ...event,
          id: `${current.id}-${index}-${completedCount}`,
        })),
      ])
      setCompletedCount((count) => count + 1)
    }, STEP_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [completedCount, isComplete])

  const steps = useMemo(
    () =>
      WORKFLOW_STEPS.map((step, index) => ({
        ...step,
        status: stepStatus(index, completedCount),
      })),
    [completedCount],
  )

  const progress = progressPercent(completedCount)
  const runStatus = isComplete ? 'Completed' : 'Running'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-tight text-ink">
            Agent Run
          </h2>
          <p className="mt-1 text-sm text-muted">{AGENT_RUN_META.task}</p>
        </div>
        <p className="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
          Simulated agent activity
        </p>
      </header>

      <section className="grid grid-cols-4 gap-3">
        <article className="rounded-sm border border-line bg-panel px-4 py-3">
          <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
            Document
          </p>
          <p className="mt-1 truncate text-sm text-ink">
            {AGENT_RUN_META.document}
          </p>
        </article>
        <article className="rounded-sm border border-line bg-panel px-4 py-3">
          <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
            Task
          </p>
          <p className="mt-1 text-sm text-ink">{AGENT_RUN_META.task}</p>
        </article>
        <article className="rounded-sm border border-line bg-panel px-4 py-3">
          <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
            Status
          </p>
          <p className="mt-1">
            {isComplete ? (
              <StatusBadge tone="online">{runStatus}</StatusBadge>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] text-accent uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-accent agent-running-dot" />
                {runStatus}
              </span>
            )}
          </p>
        </article>
        <article className="rounded-sm border border-line bg-panel px-4 py-3">
          <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
            Processing
          </p>
          <p className="mt-1">
            <StatusBadge tone="local" icon="lock">
              Local
            </StatusBadge>
          </p>
        </article>
      </section>

      <div className="grid grid-cols-2 items-start gap-4">
        <AgentWorkflow steps={steps} progress={progress} />
        <ActivityLog events={events} />
      </div>

      {isComplete ? (
        <div className="flex items-center justify-between gap-4 rounded-sm border border-line bg-panel px-4 py-3">
          <p className="text-sm text-ink-secondary">
            Agent workflow completed successfully.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('agent-chat')}
              className="rounded-sm border border-line-strong px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:border-line-strong hover:bg-hover"
            >
              Ask the agent
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('analysis-result')}
              className="rounded-sm bg-sky-500/90 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
            >
              View results
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
