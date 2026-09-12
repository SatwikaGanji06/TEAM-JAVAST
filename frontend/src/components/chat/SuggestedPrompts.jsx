export default function SuggestedPrompts({ prompts, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="rounded-sm border border-line bg-panel px-2.5 py-1.5 text-left text-xs text-ink-secondary transition-colors hover:border-line-strong hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
