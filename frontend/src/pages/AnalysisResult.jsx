import { useState } from 'react'
import AnalysisSection from '../components/analysis/AnalysisSection.jsx'
import FindingCard from '../components/results/FindingCard.jsx'
import FindingSummary from '../components/results/FindingSummary.jsx'
import RecommendationPanel from '../components/results/RecommendationPanel.jsx'
import HumanReviewPanel from '../components/results/HumanReviewPanel.jsx'
import NextActionPanel from '../components/results/NextActionPanel.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  AI_RECOMMENDATION,
  ANALYSIS_RESULT_META,
  FINDING_COUNTS,
  FINDINGS,
  OVERALL_ASSESSMENT,
} from '../data/analysisResultData.js'

const DEMO_NOTE =
  'Approval note generation queued — demo mode.'

export default function AnalysisResult({ onNavigate }) {
  const [noteNotice, setNoteNotice] = useState('')

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-tight text-ink">
            Analysis Results
          </h2>
          <p className="mt-1 text-sm text-muted">
            Inspection findings, evidence, and AI-generated recommendation.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge tone="online">Analysis complete</StatusBadge>
            <StatusBadge tone="local" icon="lock">
              Local AI
            </StatusBadge>
            <span className="text-[11px] font-medium tracking-[0.14em] text-ink-secondary uppercase">
              {ANALYSIS_RESULT_META.model}
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
              Demo result
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Mock frontend data — no live model inference has occurred.
          </p>
        </div>
      </header>

      <FindingSummary counts={FINDING_COUNTS} />

      <AnalysisSection title="Document information">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <article className="rounded-sm border border-line bg-panel px-4 py-3">
            <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
              Document
            </p>
            <p className="mt-1 truncate text-sm text-ink">
              {ANALYSIS_RESULT_META.document}
            </p>
          </article>
          <article className="rounded-sm border border-line bg-panel px-4 py-3">
            <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
              Analysis type
            </p>
            <p className="mt-1 text-sm text-ink">
              {ANALYSIS_RESULT_META.analysisType}
            </p>
          </article>
          <article className="rounded-sm border border-line bg-panel px-4 py-3">
            <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
              Status
            </p>
            <p className="mt-1">
              <StatusBadge tone="online">{ANALYSIS_RESULT_META.status}</StatusBadge>
            </p>
          </article>
          <article className="rounded-sm border border-line bg-panel px-4 py-3">
            <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
              Processing
            </p>
            <p className="mt-1 text-sm text-ink">
              {ANALYSIS_RESULT_META.processing}
            </p>
          </article>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Findings">
        <div className="space-y-3">
          {FINDINGS.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      </AnalysisSection>

      <AnalysisSection title="Overall assessment">
        <div className="rounded-sm border border-line bg-panel px-4 py-4">
          <p className="text-sm leading-6 text-ink">{OVERALL_ASSESSMENT}</p>
        </div>
      </AnalysisSection>

      <AnalysisSection title="AI recommendation">
        <RecommendationPanel
          text={AI_RECOMMENDATION.text}
          basis={AI_RECOMMENDATION.basis}
        />
      </AnalysisSection>

      <HumanReviewPanel />

      <NextActionPanel
        notice={noteNotice}
        onGenerateNote={() => setNoteNotice(DEMO_NOTE)}
        onAskAgent={() => onNavigate?.('home')}
      />
    </div>
  )
}
