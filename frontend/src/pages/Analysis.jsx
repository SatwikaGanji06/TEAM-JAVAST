import { useEffect, useRef, useState } from 'react'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import SuggestedPrompts from '../components/chat/SuggestedPrompts.jsx'
import { queryRAG } from '../api/ragApi.js'
import { fileTypeLabel } from '../components/analysis/FileUploader.jsx'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'

const STARTERS = [
  'Summarize the indexed documents',
  'What risks are described?',
  'List the key findings',
]

export default function Analysis({ isActive = true }) {
  const { addUploadedDocument } = useUploadedDocuments()
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

  async function sendQuestion(question) {
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
      const data = await queryRAG(text)
      setMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          role: 'assistant',
          text: data.answer,
          sources: data.sources,
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
      <header className="mb-4 shrink-0">
        <h2 className="text-lg font-medium tracking-tight text-ink">Analysis</h2>
        <p className="mt-1 text-sm text-muted">
          Conversational review of indexed documents. Attach a PDF or TXT file
          to index it, then ask a question.
        </p>
      </header>

      <div
        ref={listRef}
        className="min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto pr-1"
      >
        {showWelcome ? (
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
              Local analysis
            </p>
            <h3 className="mt-3 max-w-md text-xl font-medium tracking-tight text-ink">
              Ask about the documents you have indexed
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-ink-secondary">
              Answers come from retrieved passages in the local index, then the
              local model. Attach a file below if you need to index one first.
            </p>
            <div className="mt-6">
              <SuggestedPrompts
                prompts={STARTERS}
                disabled={!isActive || isThinking}
                onSelect={sendQuestion}
              />
            </div>
          </div>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isThinking ? (
          <p className="text-[11px] tracking-[0.16em] text-accent uppercase">
            Searching indexed documents…
          </p>
        ) : null}
      </div>

      <div className="mt-3 shrink-0 border-t border-line bg-app pt-3">
        <ChatInput
          disabled={!isActive || isThinking}
          onSend={sendQuestion}
          file={file}
          onFileChange={handleFileChange}
          onUploaded={handleUploaded}
        />
      </div>
    </div>
  )
}
