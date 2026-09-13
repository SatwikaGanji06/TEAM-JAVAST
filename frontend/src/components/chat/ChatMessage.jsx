function sourceTitle(source, index) {
  const fromField = typeof source?.document === 'string' ? source.document.trim() : ''
  const fromMetadata =
    typeof source?.metadata?.source === 'string' ? source.metadata.source.trim() : ''
  return fromField || fromMetadata || `Retrieved passage ${index + 1}`
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const sources = Array.isArray(message.sources) ? message.sources : null

  return (
    <article className={`flex w-full min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`min-w-0 max-w-[78%] rounded-sm border px-3 py-2.5 ${
          message.isError
            ? 'border-warning/40 bg-panel'
            : isUser
              ? 'border-line bg-elevated'
              : 'border-line bg-panel'
        }`}
      >
        <p className="mb-1.5 text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
          {isUser ? 'You' : 'Assistant'}
        </p>

        {message.attachment ? (
          <div className="mb-2 rounded-sm border border-line bg-panel px-2.5 py-1.5">
            <p className="truncate text-xs text-ink">{message.attachment.name}</p>
            <p className="text-[10px] tracking-[0.12em] text-muted uppercase">
              {message.attachment.type || 'File'}
              {message.attachment.indexed
                ? ` · ${message.attachment.chunksCreated ?? 0} chunks indexed`
                : ''}
            </p>
          </div>
        ) : null}

        <p
          className={`whitespace-pre-wrap break-words text-sm leading-6 ${
            message.isError ? 'text-warning' : 'text-ink'
          }`}
        >
          {message.text}
        </p>

        {sources && sources.length > 0 ? (
          <div className="mt-3 space-y-2 border-t border-line pt-2">
            <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
              Retrieved sources
            </p>
            {sources.map((source, index) => (
              <div
                key={`${source.document_id ?? 'doc'}-${source.chunk_index ?? index}`}
                className="rounded-sm border border-line bg-elevated px-2.5 py-2"
              >
                <p className="text-xs text-ink">{sourceTitle(source, index)}</p>
                <p className="mt-0.5 text-[10px] tracking-[0.12em] text-muted uppercase">
                  {typeof source.document_id === 'number'
                    ? `Document ${source.document_id}`
                    : 'Document'}
                  {typeof source.chunk_index === 'number'
                    ? ` · Chunk ${source.chunk_index}`
                    : ''}
                  {typeof source.similarity === 'number'
                    ? ` · Similarity ${source.similarity.toFixed(2)}`
                    : ''}
                </p>
                {source.content ? (
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-ink-secondary">
                    {source.content}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {sources && sources.length === 0 && !message.isError ? (
          <p className="mt-2 text-xs text-muted">
            The API returned no retrieved sources for this answer.
          </p>
        ) : null}
      </div>
    </article>
  )
}
