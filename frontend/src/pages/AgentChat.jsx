import { useEffect, useRef, useState } from 'react'
import StatusBadge from '../components/StatusBadge.jsx'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import ChatContextPanel from '../components/chat/ChatContextPanel.jsx'
import SuggestedPrompts from '../components/chat/SuggestedPrompts.jsx'
import {
  CHAT_CONTEXT,
  INITIAL_MESSAGES,
  SUGGESTED_QUESTIONS,
  mockReplyFor,
} from '../data/chatData.js'

const REPLY_DELAY_MS = 900

const ACTION_NOTICES = {
  evidence:
    'Evidence viewer is a frontend placeholder. Source inspection will be connected later.',
  sources:
    'Source list is simulated. Retrieval traces will be connected in a later stage.',
}

export default function AgentChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [isThinking, setIsThinking] = useState(false)
  const listRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const node = listRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, isThinking])

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current)
  }, [])

  function sendQuestion(question) {
    if (isThinking) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
    }

    setMessages((current) => [...current, userMessage])
    setIsThinking(true)

    timerRef.current = window.setTimeout(() => {
      const reply = mockReplyFor(question)
      setMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          role: 'assistant',
          text: reply.text,
          action: reply.action,
        },
      ])
      setIsThinking(false)
    }, REPLY_DELAY_MS)
  }

  function handleAction(messageId, action) {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? { ...message, notice: ACTION_NOTICES[action] }
          : message,
      ),
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight text-ink">
              Ask the Agent
            </h2>
            <p className="mt-1 text-sm text-muted">
              Ask questions about the current analysis, findings, evidence, and
              recommendation.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge tone="local" icon="lock">
                Local AI
              </StatusBadge>
              <span className="text-[11px] font-medium tracking-[0.14em] text-ink-secondary uppercase">
                Qwen
              </span>
              <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
                Demo chat · Simulated local model
              </span>
            </div>
          </div>
        </header>

        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onAction={handleAction}
            />
          ))}
          {isThinking ? (
            <p className="text-[11px] tracking-[0.16em] text-accent uppercase">
              Agent reasoning...
            </p>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <SuggestedPrompts
            prompts={SUGGESTED_QUESTIONS}
            disabled={isThinking}
            onSelect={sendQuestion}
          />
          <ChatInput disabled={isThinking} onSend={sendQuestion} />
        </div>
      </section>

      <div className="h-72 shrink-0 lg:h-auto lg:w-[340px]">
        <ChatContextPanel context={CHAT_CONTEXT} />
      </div>
    </div>
  )
}
