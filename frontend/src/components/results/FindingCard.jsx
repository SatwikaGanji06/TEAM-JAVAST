import { useState } from 'react'

const SEVERITY_BADGE = {
  HIGH: 'border-danger/35 bg-danger/8 text-danger',
  MEDIUM: 'border-warning/30 bg-warning/8 text-warning',
  LOW: 'border-line bg-elevated text-ink-secondary',
}

const SEVERITY_ACCENT = {
  HIGH: 'border-l-danger',
  MEDIUM: 'border-l-warning',
  LOW: 'border-l-line',
}

export default function FindingCard({ finding }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const badgeClass = SEVERITY_BADGE[finding.severity] ?? SEVERITY_BADGE.LOW
  const accentClass = SEVERITY_ACCENT[finding.severity] ?? SEVERITY_ACCENT.LOW
  const detail = finding.evidenceDetail

  return (
    <article
      className={`rounded-sm border border-line border-l-2 bg-panel px-4 py-4 ${accentClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted">
            Finding #{finding.number}
          </p>
          <h3 className="mt-1 text-sm text-ink">{finding.title}</h3>
        </div>
        <span
          className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-medium tracking-[0.16em] uppercase ${badgeClass}`}
        >
          {finding.severity}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-secondary">{finding.summary}</p>

      <div className="mt-3">
        <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
          Evidence
        </p>
        <ul className="mt-1.5 space-y-1">
          {finding.evidence.map((item) => (
            <li key={item} className="text-xs text-ink-secondary">
              <span className="mr-2 text-accent">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
          Recommended action
        </p>
        <p className="mt-1 text-sm text-ink">{finding.recommendedAction}</p>
      </div>

      <div className="mt-3">
        <button
          type="button"
          aria-expanded={evidenceOpen}
          onClick={() => setEvidenceOpen((open) => !open)}
          className="text-[10px] font-medium tracking-[0.14em] text-accent uppercase transition-colors hover:text-accent"
        >
          {evidenceOpen ? 'Hide evidence' : 'View evidence'}
        </button>
      </div>

      {evidenceOpen && detail ? (
        <div className="mt-3 rounded-sm border border-line bg-elevated px-3 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
              Evidence detail
            </p>
            <p className="text-[10px] tracking-[0.16em] text-muted uppercase">
              Demo evidence
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">
                Source
              </dt>
              <dd className="mt-1 break-all text-ink">{detail.source}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">
                Page
              </dt>
              <dd className="mt-1 text-ink">{detail.page}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">
                Evidence type
              </dt>
              <dd className="mt-1 text-ink">{detail.type}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10px] tracking-[0.14em] text-muted uppercase">
                Content
              </dt>
              <dd className="mt-1 text-sm leading-6 text-ink-secondary">
                {detail.content}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[10px] tracking-[0.12em] text-muted uppercase">
            Mock excerpt — not extracted from a live document
          </p>
        </div>
      ) : null}
    </article>
  )
}
