export default function ChatMessage({ message, onAction }) {
  const isUser = message.role === 'user'

  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] ${isUser ? 'text-right' : ''}`}>
        <p className="mb-1 font-mono text-[10px] font-medium tracking-[0.14em] text-ink-secondary uppercase">
          {isUser ? 'You' : 'Assistant'}
        </p>
        {message.attachment ? (
          <div className="mb-2 rounded-md border border-line bg-panel px-2.5 py-1.5 text-left">
            <p className="truncate text-xs text-ink">{message.attachment.name}</p>
            <p className="font-mono text-[10px] tracking-[0.12em] text-ink-secondary uppercase">
              {message.attachment.type || 'File'} · Attached
            </p>
          </div>
        ) : null}
        <p
          className={`whitespace-pre-wrap text-sm leading-6 text-ink ${
            isUser ? 'text-left' : ''
          }`}
        >
          {message.text}
        </p>
        {message.action === 'evidence' ? (
          <button
            type="button"
            onClick={() => onAction?.(message.id, 'evidence')}
            className="mt-2 font-mono text-[10px] font-medium tracking-[0.14em] text-accent uppercase transition-colors hover:text-accent-strong"
          >
            View evidence
          </button>
        ) : null}
        {message.action === 'sources' ? (
          <button
            type="button"
            onClick={() => onAction?.(message.id, 'sources')}
            className="mt-2 font-mono text-[10px] font-medium tracking-[0.14em] text-accent uppercase transition-colors hover:text-accent-strong"
          >
            View sources
          </button>
        ) : null}
        {message.notice ? (
          <p className="mt-2 whitespace-pre-wrap text-xs text-ink-secondary">{message.notice}</p>
        ) : null}
      </div>
    </article>
  )
}
