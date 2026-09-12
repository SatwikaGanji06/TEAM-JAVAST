export default function AnalysisTypeCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
      className={`w-full rounded-sm border px-4 py-3.5 text-left transition-colors ${
        selected
          ? 'border-accent/70 bg-accent/5'
          : 'border-line bg-panel hover:border-line-strong hover:bg-hover'
      }`}
    >
      <p className="text-sm text-ink">{option.title}</p>
      <p className="mt-1.5 text-xs leading-5 text-muted">
        {option.description}
      </p>
    </button>
  )
}
