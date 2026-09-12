export default function NextActionPanel({
  notice,
  onGenerateNote,
  onAskAgent,
}) {
  return (
    <div className="rounded-sm border border-line bg-panel px-4 py-4">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
        Next action
      </p>
      <p className="mt-2 text-sm text-ink-secondary">
        Create a draft approval note from the analysis results, or ask the agent
        about these findings and the supporting evidence.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onGenerateNote}
          className="rounded-sm bg-sky-500/90 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
        >
          Generate approval note
        </button>
        <button
          type="button"
          onClick={onAskAgent}
          className="rounded-sm border border-line-strong px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:bg-hover"
        >
          Ask the agent
        </button>
      </div>

      {notice ? (
        <p className="mt-3 text-xs text-muted" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  )
}
