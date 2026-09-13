import { useEffect, useState } from 'react'
import FileUploader from '../analysis/FileUploader.jsx'

export default function ChatInput({
  disabled,
  onSend,
  file = null,
  onFileChange,
  onUploaded,
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

    onSend(next || `Summarize ${file.name}.`)
    setValue('')
  }

  const canSend = !blocked && Boolean(value.trim() || file)

  return (
    <div className="rounded-sm border border-line bg-panel p-3">
      <label className="block">
        <span className="sr-only">Message</span>
        <textarea
          rows={2}
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
          className="w-full resize-none bg-transparent text-sm leading-6 text-ink outline-none placeholder:text-muted disabled:opacity-50"
        />
      </label>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
          {onFileChange ? (
            <FileUploader
              variant="composer"
              file={file}
              disabled={disabled}
              onFileChange={onFileChange}
              onUploaded={onUploaded}
              onUploadingChange={setIndexing}
            />
          ) : null}
          <p className="text-[10px] tracking-[0.12em] text-muted uppercase">
            Enter to send · Shift+Enter for newline
          </p>
        </div>
        <button
          type="button"
          disabled={!canSend}
          onClick={submit}
          className={`rounded-sm px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors ${
            !canSend
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
