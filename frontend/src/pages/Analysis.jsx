import { useEffect, useRef, useState } from 'react'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import { queryRAG } from '../api/ragApi.js'
import { fileTypeLabel } from '../components/analysis/FileUploader.jsx'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'

export default function Analysis() {
  const { addUploadedDocument } = useUploadedDocuments()
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const listRef = useRef(null)

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
    if (isThinking) return

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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <header className="mb-4 shrink-0">
        <h2 className="text-lg font-medium tracking-tight text-ink">Analysis</h2>
        <p className="mt-1 text-sm text-muted">
          Ask questions against indexed documents. Attach a PDF or TXT file to
          upload it through the existing document API before you send.
        </p>
      </header>

      <div
        ref={listRef}
        className="min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto pr-1"
      >
        {messages.length === 0 && !isThinking ? (
          <p className="text-sm text-ink-secondary">
            Messages will appear here after you send a question.
          </p>
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
          disabled={isThinking}
          onSend={sendQuestion}
          file={file}
          onFileChange={handleFileChange}
          onUploaded={handleUploaded}
        />
      </div>
    </div>
  )
}
