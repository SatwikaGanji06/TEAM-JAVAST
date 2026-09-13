export default function SuggestedPrompts({ prompts, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="inline-flex h-8 items-center rounded-md border border-line px-2.5 text-left text-xs text-ink-secondary transition-colors hover:border-accent/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
