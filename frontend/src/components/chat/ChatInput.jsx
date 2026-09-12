import { useEffect, useState } from 'react'
import FileUploader from '../analysis/FileUploader.jsx'

export default function ChatInput({
  disabled,
  onSend,
  file = null,
  onFileChange,
  placeholder = 'Ask a question about the indexed documents…',
  draft = '',
}) {
  const [value, setValue] = useState(draft)
  const [indexing, setIndexing] = useState(false)

  useEffect(() => {
    if (draft) {
      setValue(draft)
    }
  }, [draft])

  const blocked = disabled || indexing

  function submit() {
    const next = value.trim()
    if (blocked) return
    if (!next && !file) return

    onSend(next || 'Summarize the indexed documents.')
    setValue('')
  }

  const canSend = !blocked && Boolean(value.trim() || file)

  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-4 focus-within:border-accent">
      <label className="block">
        <span className="sr-only">Ask the agent</span>
        <textarea
          rows={3}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          className="w-full resize-none bg-transparent px-0.5 py-1 text-sm leading-6 text-ink outline-none placeholder:text-ink-secondary disabled:opacity-50"
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
          <FileUploader
            variant="composer"
            file={file}
            disabled={disabled}
            onFileChange={onFileChange}
            onUploadingChange={setIndexing}
          />
          <p className="font-mono text-[10px] tracking-[0.12em] text-ink-secondary uppercase">
            Enter to send · Shift+Enter for newline
          </p>
        </div>
        <button
          type="button"
          disabled={!canSend}
          onClick={submit}
          className={`inline-flex h-8 shrink-0 items-center rounded-md px-4 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
            !canSend
              ? 'cursor-not-allowed bg-elevated text-ink-secondary'
              : 'bg-accent text-app hover:bg-accent-strong'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  )
}
