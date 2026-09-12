export default function ChatMessage({ message, onAction }) {
  const isUser = message.role === 'user'

  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] rounded-sm border px-3 py-2.5 ${
          isUser
            ? 'border-line bg-elevated'
            : 'border-line bg-panel'
        }`}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
            {isUser ? 'User' : 'Local agent'}
          </p>
          {isUser ? null : (
            <span className="text-[10px] tracking-[0.12em] text-muted uppercase">
              Simulated
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-ink">
          {message.text}
        </p>
        {message.action === 'evidence' ? (
          <button
            type="button"
            onClick={() => onAction?.(message.id, 'evidence')}
            className="mt-2 text-[10px] font-medium tracking-[0.14em] text-accent uppercase transition-colors hover:text-accent"
          >
            View evidence
          </button>
        ) : null}
        {message.action === 'sources' ? (
          <button
            type="button"
            onClick={() => onAction?.(message.id, 'sources')}
            className="mt-2 text-[10px] font-medium tracking-[0.14em] text-accent uppercase transition-colors hover:text-accent"
          >
            View sources
          </button>
        ) : null}
        {message.notice ? (
          <p className="mt-2 text-xs text-muted">{message.notice}</p>
        ) : null}
      </div>
    </article>
  )
}
