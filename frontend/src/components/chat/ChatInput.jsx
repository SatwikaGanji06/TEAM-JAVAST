import { useState } from 'react'

export default function ChatInput({ disabled, onSend }) {
  const [value, setValue] = useState('')

  function submit() {
    const next = value.trim()
    if (!next || disabled) return
    onSend(next)
    setValue('')
  }

  return (
    <div className="rounded-sm border border-line bg-panel p-3">
      <label className="block">
        <span className="sr-only">Ask the agent</span>
        <textarea
          rows={3}
          value={value}
          disabled={disabled}
          placeholder="Ask about the analysis, findings, evidence, or recommendation..."
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          className="w-full resize-none bg-transparent text-sm leading-6 text-ink outline-none placeholder:text-muted disabled:opacity-50"
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[10px] tracking-[0.12em] text-muted uppercase">
          Enter to send · Shift+Enter for newline
        </p>
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={submit}
          className={`rounded-sm px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors ${
            disabled || !value.trim()
              ? 'cursor-not-allowed bg-elevated text-muted'
              : 'bg-sky-500/90 text-slate-950 hover:bg-sky-400'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  )
}
