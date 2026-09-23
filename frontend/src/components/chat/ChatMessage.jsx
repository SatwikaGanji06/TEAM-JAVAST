function sourceTitle(source, index) {
  const fromField =
    typeof source?.document === 'string'
      ? source.document.trim()
      : ''

  const fromMetadata =
    typeof source?.metadata?.source === 'string'
      ? source.metadata.source.trim()
      : ''

  return (
    fromField ||
    fromMetadata ||
    `Retrieved passage ${index + 1}`
  )
}

function statusLabel(status) {
  return String(status || 'unknown').toUpperCase()
}

function renderInline(text, keyPrefix = '') {
  const normalized = String(text || '')
    .replace(/\\\*\\\*/g, '**')
    .replace(/\\\./g, '.')
  const parts = normalized.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (
      part.startsWith('**') &&
      part.endsWith('**') &&
      part.length >= 4
    ) {
      return (
        <strong
          key={`${keyPrefix}-bold-${index}`}
          className="font-semibold text-ink"
        >
          {part.slice(2, -2)}
        </strong>
      )
    }

    return (
      <span key={`${keyPrefix}-text-${index}`}>
        {part}
      </span>
    )
  })
}

function renderAnalysisContent(text) {
  const normalizedText = String(text || '')
    .replace(/\\\*\\\*/g, '**')
    .replace(/\\\./g, '.')
  const lines = normalizedText.split(/\r?\n/)
  const elements = []
  let listItems = []
  let orderedItems = []

  function flushLists() {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`unordered-${elements.length}`}
          className="my-2 space-y-1.5 pl-5"
        >
          {listItems.map((item, index) => (
            <li
              key={`unordered-item-${index}`}
              className="relative text-sm leading-6 text-ink"
            >
              <span className="absolute -left-4 text-accent">•</span>
              {renderInline(item, `u-${elements.length}-${index}`)}
            </li>
          ))}
        </ul>
      )

      listItems = []
    }

    if (orderedItems.length > 0) {
      elements.push(
        <ol
          key={`ordered-${elements.length}`}
          className="my-2 space-y-1.5 pl-5"
        >
          {orderedItems.map((item, index) => (
            <li
              key={`ordered-item-${index}`}
              className="text-sm leading-6 text-ink"
            >
              {renderInline(item, `o-${elements.length}-${index}`)}
            </li>
          ))}
        </ol>
      )

      orderedItems = []
    }
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()

    if (!line) {
      flushLists()

      elements.push(
        <div
          key={`space-${index}`}
          className="h-2"
        />
      )

      return
    }

    const h2 = line.match(/^##\s+(.+)$/)
    const h1 = line.match(/^#\s+(.+)$/)
    const bullet = line.match(/^[-*]\s+(.+)$/)
    const numbered = line.match(/^\d+\.\s+(.+)$/)

    if (h1) {
      flushLists()

      elements.push(
        <h3
          key={`h1-${index}`}
          className="mb-3 mt-1 text-base font-semibold tracking-tight text-ink"
        >
          {renderInline(h1[1], `h1-${index}`)}
        </h3>
      )

      return
    }

    if (h2) {
      flushLists()

      elements.push(
        <h4
          key={`h2-${index}`}
          className="mb-2 mt-4 text-[11px] font-semibold tracking-[0.16em] text-accent uppercase"
        >
          {renderInline(h2[1], `h2-${index}`)}
        </h4>
      )

      return
    }

    if (bullet) {
      orderedItems.length > 0 && flushLists()
      listItems.push(bullet[1])
      return
    }

    if (numbered) {
      listItems.length > 0 && flushLists()
      orderedItems.push(numbered[1])
      return
    }

    flushLists()

    elements.push(
      <p
        key={`paragraph-${index}`}
        className="text-sm leading-6 text-ink"
      >
        {renderInline(line, `p-${index}`)}
      </p>
    )
  })

  flushLists()

  return elements
}

function VerificationSection({ verification }) {
  if (!verification) return null

  const checks = Array.isArray(verification.checks)
    ? verification.checks
    : []

  const verified =
    String(verification.status || '').toLowerCase() === 'verified'

  return (
    <div className="border-t border-line px-5 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
            Verification
          </p>

          <p className="mt-1 text-xs text-ink-secondary">
            Evidence and execution checks
          </p>
        </div>

        <span
          className={`rounded-sm border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] ${
            verified
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-warning/40 bg-panel text-warning'
          }`}
        >
          {statusLabel(verification.status)}
        </span>
      </div>

      {checks.length > 0 ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {checks.map((check, index) => (
            <div
              key={`${check.name || 'check'}-${index}`}
              className="rounded-sm border border-line bg-elevated px-3 py-3"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 text-sm font-semibold ${
                    check.passed
                      ? 'text-emerald-600'
                      : 'text-warning'
                  }`}
                >
                  {check.passed
                    ? String.fromCharCode(10003)
                    : '!'}
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink capitalize">
                    {check.name || 'Verification check'}
                  </p>

                  {check.message ? (
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {check.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  const sources =
    Array.isArray(message.sources)
      ? message.sources
      : []

  const hasApprovalNote =
    Boolean(message.approvalNoteUrl)

  const approvalNoteError =
    message.approvalNoteError

  const hasRun =
    typeof message.runId === 'number'

  const analysis =
    message.analysis || null

  function openApprovalNote() {
    if (!message.approvalNoteUrl) return

    window.open(
      message.approvalNoteUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function downloadApprovalNote() {
    if (!message.approvalNoteUrl) return

    const link = document.createElement('a')

    link.href = message.approvalNoteUrl
    link.download =
      message.approvalNoteFilename ||
      'LOKAI_Approval_Note.docx'

    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (analysis && !isUser) {
    return (
      <article className="w-full overflow-hidden rounded-sm border border-line bg-panel">

        {/* HEADER */}
        <div className="border-b border-line px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />

                <p className="text-[10px] font-semibold tracking-[0.18em] text-accent uppercase">
                  Analysis result
                </p>
              </div>

              <p className="mt-1.5 text-sm font-medium text-ink">
                Local evidence-based analysis
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm border border-line bg-elevated px-2.5 py-1 text-[10px] font-medium text-muted">
                {analysis.selectedCount > 0
                  ? `${analysis.selectedCount} documents`
                  : 'Indexed scope'}
              </span>

              {analysis.sourceCount ? (
                <span className="rounded-sm border border-line bg-elevated px-2.5 py-1 text-[10px] font-medium text-muted">
                  {analysis.sourceCount} sources
                </span>
              ) : null}

              {hasRun ? (
                <span className="rounded-sm border border-line bg-elevated px-2.5 py-1 text-[10px] font-medium text-muted">
                  Run #{message.runId}
                </span>
              ) : null}

              <span
                className={`rounded-sm border px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] ${
                  analysis.verificationStatus === 'verified'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-warning/40 bg-panel text-warning'
                }`}
              >
                {statusLabel(analysis.verificationStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* FINDINGS */}
        <div className="px-5 py-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
            Findings
          </p>

          <div className="mt-3 rounded-sm border border-line bg-elevated px-4 py-4">
            <div className="max-w-none">
              {renderAnalysisContent(analysis.answer)}
            </div>
          </div>
        </div>

        {/* CALCULATIONS */}
        {analysis.calculations?.length > 0 ? (
          <div className="border-t border-line px-5 py-5">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                Deterministic calculations
              </p>

              <p className="mt-1 text-xs text-muted">
                Calculated by the local verification tool.
              </p>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {analysis.calculations.map((calculation, index) => (
                <div
                  key={`${calculation}-${index}`}
                  className="rounded-sm border border-line bg-elevated px-3.5 py-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">
                      {String.fromCharCode(10003)}
                    </span>

                    <p className="text-sm font-medium leading-6 text-ink">
                      {calculation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* EVIDENCE */}
        {sources.length > 0 ? (
          <div className="border-t border-line px-5 py-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                  Evidence
                </p>

                <p className="mt-1 text-xs text-ink-secondary">
                  Retrieved from the selected local document scope.
                </p>
              </div>

              <span className="text-[10px] font-medium tracking-[0.1em] text-muted uppercase">
                {analysis.sourceCount || sources.length} sources
              </span>
            </div>

            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              {sources.map((source, index) => (
                <div
                  key={`${source.document_id ?? 'doc'}-${source.chunk_index ?? index}`}
                  className="rounded-sm border border-line bg-elevated px-3.5 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-xs font-medium text-ink">
                      {sourceTitle(source, index)}
                    </p>

                    {typeof source.similarity === 'number' ? (
                      <span className="shrink-0 rounded-sm border border-line bg-panel px-1.5 py-0.5 text-[10px] font-medium text-muted">
                        {source.similarity.toFixed(2)}
                      </span>
                    ) : null}
                  </div>

                  {source.content ? (
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-ink-secondary">
                      {source.content}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* EXECUTION */}
        {analysis.executionSteps?.length > 0 ? (
          <div className="border-t border-line px-5 py-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
              Execution
            </p>

            <p className="mt-1 text-xs text-muted">
              What the local agent used to produce this result.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {analysis.executionSteps.map((step, index) => (
                <div
                  key={`${step.action}-${index}`}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 rounded-sm border border-line bg-elevated px-3 py-2">
                    <span className="text-emerald-600">
                      {String.fromCharCode(10003)}
                    </span>

                    <span className="text-[10px] font-semibold tracking-[0.08em] text-ink uppercase">
                      {step.action}
                    </span>
                  </div>

                  {index < analysis.executionSteps.length - 1 ? (
                    <span className="text-xs text-muted">
                      ?
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* VERIFICATION */}
        <VerificationSection
          verification={message.verification}
        />

        {/* APPROVAL NOTE */}
        {hasApprovalNote ? (
          <div className="border-t border-line px-5 py-5">
            <div className="rounded-sm border border-accent/20 bg-elevated px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600">
                      {String.fromCharCode(10003)}
                    </span>

                    <p className="text-[10px] font-semibold tracking-[0.16em] text-accent uppercase">
                      Approval note ready
                    </p>
                  </div>

                  <p className="mt-1.5 truncate text-sm font-medium text-ink">
                    {message.approvalNoteFilename ||
                      'LOKAI Approval Note'}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Generated from this analysis and the selected documents.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openApprovalNote}
                    className="rounded-sm border border-line bg-panel px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-elevated"
                  >
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={downloadApprovalNote}
                    className="rounded-sm bg-sky-500/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
                  >
                    Download DOCX
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {approvalNoteError ? (
          <div className="border-t border-warning/40 bg-panel px-5 py-4">
            <div className="flex items-start gap-2">
              <span className="text-warning">!</span>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-warning uppercase">
                  Approval note
                </p>

                <p className="mt-1 text-xs leading-5 text-warning">
                  {approvalNoteError}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* FOOTER */}
        <div className="border-t border-line bg-elevated px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium tracking-[0.1em] text-muted uppercase">
            <span>Local processing</span>

            {hasRun ? (
              <span>Run #{message.runId}</span>
            ) : null}

            {analysis.selectedCount > 0 ? (
              <span>
                {analysis.selectedCount} document scope
              </span>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  /* GENERAL MESSAGE */
  return (
    <article
      className={`flex w-full min-w-0 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
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

        <p
          className={`whitespace-pre-wrap break-words text-sm leading-6 ${
            message.isError
              ? 'text-warning'
              : 'text-ink'
          }`}
        >
          {message.text}
        </p>
      </div>
    </article>
  )
}


