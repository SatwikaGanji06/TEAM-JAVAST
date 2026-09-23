import { useEffect, useRef, useState } from 'react'
import ChatInput from '../components/chat/ChatInput.jsx'
import SuggestedPrompts from '../components/chat/SuggestedPrompts.jsx'
import { generateApprovalNote, runAgentAnalysis } from '../api/ragApi.js'
import { fileTypeLabel } from '../components/analysis/FileUploader.jsx'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'

const STARTERS = [
  'Summarize the indexed documents',
  'What risks are described?',
  'List the key findings',
]

const WORKFLOW = [
  ['01', 'Read', 'Document intelligence'],
  ['02', 'Retrieve', 'Local evidence'],
  ['03', 'Calculate', 'Deterministic tools'],
  ['04', 'Verify', 'Evidence checks'],
]

function getActionLabel(action) {
  const labels = {
    document_reader: 'Document reader',
    rag_search: 'Evidence retrieval',
    calculator: 'Calculator',
    verification: 'Verification',
  }

  return labels[action] || action?.replaceAll('_', ' ') || 'Agent step'
}

function formatStatus(status) {
  return String(status || 'unknown').replaceAll('_', ' ').toUpperCase()
}

function splitAnswer(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function VerificationPanel({ verification }) {
  const checks = Array.isArray(verification?.checks)
    ? verification.checks
    : []

  const status = verification?.status || 'unknown'
  const verified = status === 'verified'

  return (
    <section className="border-t border-line px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
            Verification
          </p>
          <p className="mt-1 text-sm font-medium text-ink">
            Evidence and execution checks
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${
            verified
              ? 'border-accent/30 bg-accent/5 text-accent'
              : 'border-warning/30 bg-warning/5 text-warning'
          }`}
        >
          {formatStatus(status)}
        </span>
      </div>

      {checks.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {checks.map((check, index) => {
            const passed = check?.passed !== false

            return (
              <div
                key={`${check?.name || 'check'}-${index}`}
                className="flex items-start gap-3 rounded-sm border border-line bg-elevated px-3 py-2.5"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                    passed
                      ? 'border-accent/40 text-accent'
                      : 'border-warning/40 text-warning'
                  }`}
                >
                  {passed ? '✓' : '!'}
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink">
                    {check?.name || 'Verification check'}
                  </p>

                  {check?.message ? (
                    <p className="mt-0.5 text-[11px] leading-5 text-muted">
                      {check.message}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">
          No individual verification checks were returned.
        </p>
      )}
    </section>
  )
}

function EvidencePanel({ sources }) {
  const [open, setOpen] = useState(false)

  if (!Array.isArray(sources) || sources.length === 0) {
    return null
  }

  return (
    <section className="border-t border-line">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-elevated sm:px-6"
      >
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
            Evidence
          </p>
          <p className="mt-1 text-sm text-ink">
            {sources.length} retrieved source{sources.length === 1 ? '' : 's'}
          </p>
        </div>

        <span className="text-xs font-medium tracking-[0.12em] text-muted uppercase">
          {open ? 'Hide' : 'View'}
        </span>
      </button>

      {open ? (
        <div className="space-y-2 border-t border-line bg-elevated px-5 py-4 sm:px-6">
          {sources.map((source, index) => (
            <details
              key={`${source.document_id ?? 'document'}-${source.chunk_index ?? index}`}
              className="group rounded-sm border border-line bg-panel"
            >
              <summary className="cursor-pointer list-none px-3 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink">
                      {source.document ||
                        source.metadata?.source ||
                        `Retrieved source ${index + 1}`}
                    </p>

                    <p className="mt-1 text-[10px] tracking-[0.1em] text-muted uppercase">
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
                  </div>

                  <span className="shrink-0 text-xs text-muted transition-transform group-open:rotate-180">
                    ↓
                  </span>
                </div>
              </summary>

              {source.content ? (
                <div className="border-t border-line px-3 py-3">
                  <p className="whitespace-pre-wrap text-xs leading-5 text-ink-secondary">
                    {source.content}
                  </p>
                </div>
              ) : null}
            </details>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function AnalysisResult({ message }) {
  const analysis = message.analysis || {}
  const paragraphs = splitAnswer(analysis.answer || message.text)

  const verificationStatus =
    analysis.verificationStatus || message.verification?.status || 'unknown'

  const selectedCount =
    typeof analysis.selectedCount === 'number'
      ? analysis.selectedCount
      : 0

  const sourceCount =
    typeof analysis.sourceCount === 'number'
      ? analysis.sourceCount
      : Array.isArray(message.sources)
        ? message.sources.length
        : 0

  const executionSteps = Array.isArray(analysis.executionSteps)
    ? analysis.executionSteps
    : []

  const calculations = Array.isArray(analysis.calculations)
    ? analysis.calculations
    : []

  const verified = verificationStatus === 'verified'

  function openApprovalNote() {
    if (!message.approvalNoteUrl) return
    window.open(message.approvalNoteUrl, '_blank', 'noopener,noreferrer')
  }

  function downloadApprovalNote() {
    if (!message.approvalNoteUrl) return

    const link = document.createElement('a')
    link.href = message.approvalNoteUrl
    link.download = message.approvalNoteFilename || 'LOKAI_Approval_Note.docx'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <article className="overflow-hidden rounded-sm border border-line bg-panel">
      {/* RESULT HEADER */}
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <p className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                Local evidence-based analysis
              </p>
            </div>

            <h3 className="mt-2 text-lg font-medium tracking-tight text-ink">
              Analysis result
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium tracking-[0.12em] text-muted uppercase">
              <span>
                {selectedCount > 0
                  ? `${selectedCount} document${selectedCount === 1 ? '' : 's'}`
                  : 'Indexed document scope'}
              </span>

              <span className="text-line-strong">·</span>

              <span>
                {sourceCount} source{sourceCount === 1 ? '' : 's'}
              </span>

              {typeof message.runId === 'number' ? (
                <>
                  <span className="text-line-strong">·</span>
                  <span>Run #{message.runId}</span>
                </>
              ) : null}
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase ${
              verified
                ? 'border-accent/30 bg-accent/5 text-accent'
                : 'border-warning/30 bg-warning/5 text-warning'
            }`}
          >
            <span>{verified ? '✓' : '!'}</span>
            {formatStatus(verificationStatus)}
          </span>
        </div>
      </div>

      {/* FINDINGS */}
      <section className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
              Findings
            </p>
            <p className="mt-1 text-xs text-muted">
              Grounded in the selected local document scope.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="max-w-4xl whitespace-pre-wrap text-sm leading-7 text-ink"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* CALCULATIONS */}
      {calculations.length > 0 ? (
        <section className="border-t border-line px-5 py-5 sm:px-6">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
            Calculations
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {calculations.map((calculation, index) => (
              <div
                key={index}
                className="rounded-sm border border-line bg-elevated px-3 py-3"
              >
                <p className="whitespace-pre-wrap text-xs leading-5 text-ink">
                  {calculation}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* EXECUTION */}
      {executionSteps.length > 0 ? (
        <section className="border-t border-line px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
                Execution
              </p>
              <p className="mt-1 text-xs text-muted">
                What the local agent used to produce this result.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {executionSteps.map((step, index) => (
              <div
                key={`${step.action}-${index}`}
                className="flex items-center gap-2"
              >
                <div
                  className={`rounded-sm border px-2.5 py-2 ${
                    step.success
                      ? 'border-line bg-elevated'
                      : 'border-warning/30 bg-warning/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] ${
                        step.success ? 'text-accent' : 'text-warning'
                      }`}
                    >
                      {step.success ? '✓' : '!'}
                    </span>

                    <span className="text-[10px] font-semibold tracking-[0.1em] text-ink uppercase">
                      {step.action}
                    </span>
                  </div>
                </div>

                {index < executionSteps.length - 1 ? (
                  <span className="text-xs text-muted">→</span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* VERIFICATION */}
      <VerificationPanel verification={message.verification} />

      {/* APPROVAL NOTE */}
      {message.approvalNoteUrl ? (
        <section className="border-t border-line bg-elevated px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                Document generated
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                LOKAI Approval Note
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Generated from this analysis and the selected documents.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openApprovalNote}
                className="rounded-sm border border-line bg-panel px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-hover"
              >
                Open
              </button>

              <button
                type="button"
                onClick={downloadApprovalNote}
                className="rounded-sm bg-sky-500/90 px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
              >
                Download DOCX
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {message.approvalNoteError ? (
        <section className="border-t border-line px-5 py-4 sm:px-6">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-warning uppercase">
            Approval note
          </p>
          <p className="mt-1 text-xs leading-5 text-warning">
            {message.approvalNoteError}
          </p>
        </section>
      ) : null}

      {/* EVIDENCE */}
      <EvidencePanel sources={message.sources} />
    </article>
  )
}

function UserMessage({ message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%]">
        <p className="mb-1 text-right text-[9px] font-semibold tracking-[0.18em] text-muted uppercase">
          You
        </p>

        <div className="rounded-sm border border-line bg-elevated px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-6 text-ink">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Analysis({ isActive = true }) {
  const { addUploadedDocument, selectedDocumentIds } = useUploadedDocuments()

  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  const listRef = useRef(null)
  const activeRef = useRef(isActive)

  activeRef.current = isActive

  useEffect(() => {
    const node = listRef.current

    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, isThinking])

  function handleFileChange(nextFile) {
    setFile(nextFile)

    if (!nextFile) {
      setUploadResult(null)
    }
  }

  function handleUploaded(result) {
    setUploadResult(result)
    addUploadedDocument(result)
  }

  async function sendQuestion(question, shouldGenerateApprovalNote = false) {
    if (!activeRef.current || isThinking) return

    const text = (question || '').trim()

    if (!text) return

    const attached = file
    const attachedResult = uploadResult

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      attachment: attached
        ? {
            name: attached.name,
            type: fileTypeLabel(attached),
            indexed:
              attachedResult?.status === 'success' &&
              typeof attachedResult.chunks_created === 'number',
            chunksCreated: attachedResult?.chunks_created,
          }
        : null,
    }

    setMessages((current) => [...current, userMessage])
    setFile(null)
    setUploadResult(null)
    setIsThinking(true)

    try {
      const data = await runAgentAnalysis(text, selectedDocumentIds)

      let approvalNoteUrl = null
      let approvalNoteDocumentId = null
      let approvalNoteFilename = null
      let approvalNoteError = null

      if (shouldGenerateApprovalNote) {
        try {
          const approvalNote = await generateApprovalNote(
            text,
            selectedDocumentIds
          )

          approvalNoteDocumentId = approvalNote.documentId
          approvalNoteFilename = approvalNote.filename

          if (!approvalNoteDocumentId) {
            throw new Error('Approval note was generated but was not persisted.')
          }

          approvalNoteUrl =
            (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001') +
            '/api/generated-documents/' +
            approvalNoteDocumentId +
            '/download'
        } catch (error) {
          approvalNoteError =
            error instanceof Error && error.message.trim()
              ? error.message
              : 'Unable to generate the approval note.'
        }
      }

      const agentResults = data.results || []

      const documentResult = agentResults.find(
        (item) => item.action === 'document_reader'
      )

      const ragResult = agentResults.find(
        (item) => item.action === 'rag_search'
      )

      const calculatorResult = agentResults.find(
        (item) => item.action === 'calculator'
      )

      const calculations =
        calculatorResult?.result?.calculations || []

      const ragSources =
        ragResult?.result?.sources || []

      const ragAnswer =
        typeof ragResult?.result?.answer === 'string'
          ? ragResult.result.answer.trim()
          : ''

      const documentReaderText =
        typeof documentResult?.result?.text === 'string'
          ? documentResult.result.text.trim()
          : typeof documentResult?.result?.content === 'string'
            ? documentResult.result.content.trim()
            : ''

      const inspectionFile =
        documentResult?.result?.file_path
          ? documentResult.result.file_path.split(/[\\/]/).pop()
          : null

      const agentSources = [
        ...(inspectionFile
          ? [
              {
                document: inspectionFile,
                document_id: null,
                chunk_index: null,
                similarity: null,
                content:
                  'Document processed by the local document reader.',
              },
            ]
          : []),
        ...ragSources,
      ]

      const primaryAnalysis =
        ragAnswer ||
        documentReaderText ||
        'The selected documents were processed, but the local agent did not return a readable analysis.'

      const verificationStatus =
        data.verification?.status || 'unknown'

      const calculationLines = calculations.map((item) => {
        const label = item.label || 'Calculation'
        const expression = item.expression || ''
        const value = item.value ?? ''
        const unit = item.unit || ''

        return `${label}: ${expression} = ${value} ${unit}`.trim()
      })

      const executionSteps = agentResults.map((item) => ({
        action: getActionLabel(item.action),
        success: item.success !== false,
      }))

      setMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          role: 'assistant',
          text: primaryAnalysis,

          analysis: {
            answer: primaryAnalysis,
            calculations: calculationLines,
            verificationStatus,
            sourceCount: ragSources.length,
            selectedCount: selectedDocumentIds.length,
            executionSteps,
          },

          sources: agentSources,
          verification: data.verification,
          runId: data.run_id,
          agentResults,

          approvalNoteUrl,
          approvalNoteDocumentId,
          approvalNoteFilename,
          approvalNoteError,
        },
      ])
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Unable to reach the local AI backend.'

      setMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          role: 'assistant',
          text: message,
          isError: true,
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const showWelcome = messages.length === 0 && !isThinking

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* HEADER */}
      <header className="shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />

              <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                Local analysis
              </span>
            </div>

            <h2 className="mt-2 text-xl font-medium tracking-tight text-ink">
              Analysis
            </h2>

            <p className="mt-1 max-w-2xl text-sm text-muted">
              Turn selected sensitive documents into grounded, verified work.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
              Scope
            </span>

            <span className="rounded-sm border border-line bg-panel px-2.5 py-1.5 text-[10px] font-medium text-ink-secondary">
              {selectedDocumentIds.length > 0
                ? `${selectedDocumentIds.length} selected`
                : 'All indexed documents'}
            </span>
          </div>
        </div>
      </header>

      {/* WORKSPACE */}
      <div
        ref={listRef}
        className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1"
      >
        {showWelcome ? (
          <section className="overflow-hidden rounded-sm border border-line bg-panel">
            <div className="px-6 py-6 sm:px-9 sm:py-7">
              <div className="max-w-3xl">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-accent uppercase">
                  LOKAI analysis engine
                </p>

                <h3 className="mt-3 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                  Inspect. Understand. Verify.
                </h3>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-secondary">
                  Select your documents, ask a question, and let the local
                  agent retrieve evidence, use deterministic tools when
                  required, and verify the result before presenting it.
                </p>

                <div className="mt-6">
                  <SuggestedPrompts
                    prompts={STARTERS}
                    disabled={!isActive || isThinking}
                    onSelect={sendQuestion}
                  />
                </div>
              </div>
            </div>

            <div className="mx-4 my-3 rounded-sm border border-accent/25 bg-panel px-5 py-4 shadow-sm sm:mx-5 sm:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
                {WORKFLOW.map(([number, title, description], index) => (
                  <div
                    key={number}
                    className="flex min-w-0 flex-1 items-center"
                  >
                    <div className="min-w-0 flex-1 px-1 py-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-semibold tracking-[0.16em] text-muted">
                          {number}
                        </span>

                        <p className="text-sm font-medium text-ink">
                          {title}
                        </p>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-ink-secondary">
                        {description}
                      </p>
                    </div>

                    {index < WORKFLOW.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="hidden px-3 text-sm text-muted lg:block"
                      >
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-5 pb-4">
            {messages.map((message) =>
              message.role === 'user' ? (
                <UserMessage key={message.id} message={message} />
              ) : message.isError ? (
                <div
                  key={message.id}
                  className="rounded-sm border border-warning/30 bg-panel px-5 py-4"
                >
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-warning uppercase">
                    Analysis failed
                  </p>
                  <p className="mt-2 text-sm leading-6 text-warning">
                    {message.text}
                  </p>
                </div>
              ) : (
                <AnalysisResult key={message.id} message={message} />
              )
            )}

            {isThinking ? (
              <div className="rounded-sm border border-line bg-panel px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 text-[10px] text-accent">
                    AI
                  </span>

                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                      Local analysis
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Reading documents, retrieving evidence, and verifying the result…
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* COMPOSER */}
      <div className="shrink-0 pt-3">
        <ChatInput
          disabled={!isActive || isThinking}
          onSend={sendQuestion}
          file={file}
          onFileChange={handleFileChange}
          onUploaded={handleUploaded}
          placeholder="Ask a question about the selected documents…"
        />
      </div>
    </div>
  )
}






