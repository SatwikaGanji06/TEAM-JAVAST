import PageHeader from '../components/PageHeader.jsx'
import AnalysisSection from '../components/analysis/AnalysisSection.jsx'
import AgentWorkflow from '../components/agent/AgentWorkflow.jsx'
import FindingCard from '../components/results/FindingCard.jsx'
import FindingSummary from '../components/results/FindingSummary.jsx'
import RecommendationPanel from '../components/results/RecommendationPanel.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  AI_RECOMMENDATION,
  FINDING_COUNTS,
  FINDINGS,
  OVERALL_ASSESSMENT,
} from '../data/analysisResultData.js'
import {
  getRun,
  runStatusLabel,
  runStatusTone,
  workflowForStatus,
  workflowProgress,
} from '../data/runsData.js'

export default function RunDetail({ runId, onNavigate }) {
  const run = getRun(runId)
  const steps = workflowForStatus(run.status)
  const progress = workflowProgress(run.status)
  const showFindings = run.status === 'completed' && run.hasDetail

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-8">
      <PageHeader
        title={run.title}
        subtitle={run.document}
      >
        <button
          type="button"
          onClick={() => onNavigate?.('runs')}
          className="rounded-sm border border-line px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-ink-secondary uppercase hover:bg-hover hover:text-ink"
        >
          All runs
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={runStatusTone(run.status)}>
          {runStatusLabel(run.status)}
        </StatusBadge>
        <span className="text-xs text-muted">{run.time}</span>
      </div>

      <p className="text-xs text-muted">
        Demo run layout. This is not a live agent execution.
      </p>

      <AnalysisSection title="Request">
        <div className="rounded-sm border border-line bg-panel px-4 py-4">
          <p className="text-sm leading-6 text-ink">{run.request}</p>
        </div>
      </AnalysisSection>

      <AgentWorkflow steps={steps} progress={progress} />

      {showFindings ? (
        <>
          <AnalysisSection title="Findings">
            <FindingSummary counts={FINDING_COUNTS} />
            <div className="mt-3 space-y-3">
              {FINDINGS.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          </AnalysisSection>

          <AnalysisSection title="Result">
            <div className="space-y-3">
              <div className="rounded-sm border border-line bg-panel px-4 py-4">
                <p className="text-sm leading-6 text-ink">{OVERALL_ASSESSMENT}</p>
              </div>
              <RecommendationPanel
                text={AI_RECOMMENDATION.text}
                basis={AI_RECOMMENDATION.basis}
              />
            </div>
          </AnalysisSection>
        </>
      ) : null}

      {run.status === 'processing' ? (
        <div className="rounded-sm border border-line bg-panel px-4 py-4">
          <p className="text-sm text-ink">This run is still processing.</p>
          <p className="mt-1 text-xs text-muted">
            Findings and the final result will appear here when the work is
            complete. Live processing is not connected yet.
          </p>
        </div>
      ) : null}

      {run.status === 'cancelled' ? (
        <div className="rounded-sm border border-line bg-panel px-4 py-4">
          <p className="text-sm text-ink">This run was cancelled.</p>
          <p className="mt-1 text-xs text-muted">
            No findings were produced.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            onNavigate?.('home', {
              homeDraft: {
                prompt: `Continue from the ${run.title} run.`,
              },
            })
          }
          className="rounded-sm border border-line-strong px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase hover:bg-hover"
        >
          Ask the agent
        </button>
      </div>
    </div>
  )
}
