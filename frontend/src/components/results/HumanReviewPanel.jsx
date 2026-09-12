export default function HumanReviewPanel() {
  return (
    <aside className="rounded-sm border border-warning/30 bg-panel px-4 py-4">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-warning uppercase">
        Human review required
      </p>
      <p className="mt-3 text-sm leading-6 text-ink">
        This recommendation is AI-generated decision support. Final approval must
        be performed by an authorized human reviewer.
      </p>
      <p className="mt-2 text-xs text-muted">
        The workbench does not approve inspections. It prepares findings and a
        draft recommendation for human review.
      </p>
    </aside>
  )
}
