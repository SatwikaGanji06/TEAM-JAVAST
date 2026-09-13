import { useEffect, useRef, useState } from 'react'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import SuggestedPrompts from '../components/chat/SuggestedPrompts.jsx'
import { sendChatMessage } from '../api/chatApi.js'
import { HOME_STARTERS } from '../data/homeData.js'
import { fileTypeLabel } from '../components/analysis/FileUploader.jsx'

function sourceDocumentName(source) {
  const fromField = source?.document
  const fromMetadata = source?.metadata?.source

  const name =
    typeof fromField === 'string' && fromField.trim()
      ? fromField.trim()
      : typeof fromMetadata === 'string' &&
          fromMetadata.trim()
        ? fromMetadata.trim()
        : null

  return name
}

function formatSources(sources) {
  return sources
    .map((source, index) => {
      const name = sourceDocumentName(source)
      const title =
        name || `Retrieved passage ${index + 1}`

      const similarity =
        typeof source.similarity === 'number'
          ? ` · ${source.similarity.toFixed(2)}`
          : ''

      const content =
        source.content || source.text || ''

      return `${title}${similarity}\n${content}`.trim()
    })
    .join('\n\n')
}


export default function Home({
  onNavigate,
  draft,
  onDraftConsumed,
}) {
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [file, setFile] = useState(null)
  const [composerDraft, setComposerDraft] = useState('')
  const listRef = useRef(null)

  const [seenDraft, setSeenDraft] = useState(null)

  if (draft && draft !== seenDraft) {
    setSeenDraft(draft)

    if (draft.prompt) {
      setComposerDraft(draft.prompt)
    }

    if (draft.file) {
      setFile(draft.file)
    }
  }


  useEffect(() => {
    const node = listRef.current

    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, isThinking])


  useEffect(() => {
    if (!draft) return
    onDraftConsumed?.()
  }, [draft, onDraftConsumed])


  async function sendQuestion(question) {
    if (isThinking) return

    const text = (question || '').trim()

    if (!text) return

    const attached = file

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      attachment: attached
        ? {
            name: attached.name,
            type: fileTypeLabel(attached),
          }
        : null,
    }

    setMessages((current) => [
      ...current,
      userMessage,
    ])

    setFile(null)
    setComposerDraft('')
    setIsThinking(true)

    try {
      /*
       * IMPORTANT:
       *
       * Everything goes through /api/chat.
       *
       * The backend decides:
       *   normal chat
       *   RAG
       *   tools
       *   RAG + tools
       * and finally Qwen3:4B generates the response.
       */
      const data = await sendChatMessage(text)

      const sources = Array.isArray(data.sources)
        ? data.sources
        : []

      setMessages((current) => [
        ...current,
       {
  id: `agent-${Date.now()}`,
  role: 'assistant',
  text: data.response,
  sources,
  exportQuery: text,
  action: 'sources',
},
      ])
    } catch (error) {
      const message =
        error instanceof Error &&
        error.message.trim()
          ? error.message
          : 'Unable to reach the local AI backend.'

      setMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          role: 'assistant',
          text: message,
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }


  function handleAction(messageId, action) {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) {
          return message
        }

        if (action === 'sources') {
          const sources = Array.isArray(
            message.sources,
          )
            ? message.sources
            : []

          if (sources.length === 0) {
            return {
              ...message,
              action: 'export',
            }
          }

          return {
            ...message,
            notice: formatSources(sources),
          }
        }

        return message
      }),
    )
  }


  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">

        <p className="mb-3 shrink-0 text-sm leading-6 text-ink-secondary">
          Chat with the local AI system, attach a PDF or TXT
          for document analysis, and receive grounded responses
          from the local model.
        </p>


        <div className="mb-3 shrink-0">
          <SuggestedPrompts
            prompts={HOME_STARTERS}
            disabled={isThinking}
            onSelect={setComposerDraft}
          />
        </div>


        <div className="shrink-0">
          <ChatInput
            disabled={isThinking}
            onSend={sendQuestion}
            file={file}
            onFileChange={setFile}
            draft={composerDraft}
          />
        </div>


        <div
          ref={listRef}
          className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
        >

          {messages.length === 0 &&
          !isThinking ? (
            <p className="text-sm text-ink-secondary">
              Responses will appear here after you send a request.
            </p>
          ) : null}


          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onAction={handleAction}
            />
          ))}


          {isThinking ? (
            <p className="font-mono text-[11px] tracking-[0.14em] text-system uppercase">
              Reasoning
            </p>
          ) : null}

        </div>

      </section>


      <section className="mt-5 shrink-0 border-t border-line pt-4">

        <div className="mb-2 flex items-center justify-between gap-3">

          <h2 className="font-mono text-[11px] font-medium tracking-[0.16em] text-ink-secondary uppercase">
            Recent Runs
          </h2>

          <button
            type="button"
            onClick={() => onNavigate?.('runs')}
            className="font-mono text-[11px] tracking-[0.12em] text-ink-secondary uppercase hover:text-ink"
          >
            View all
          </button>

        </div>

        <p className="text-sm text-ink">
          No live run history yet
        </p>

        <p className="mt-1 text-sm leading-6 text-ink-secondary">
          Run tracking is not connected. Sample layout is on the Runs page.
        </p>

      </section>

    </div>
  )
}