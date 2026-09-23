import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { sendChatMessage } from '../api/chatApi.js'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendMessage = useCallback(async (message) => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || loading) return

    setMessages((current) => [
      ...current,
      { role: 'user', content: trimmedMessage },
    ])

    setInput('')
    setError('')
    setLoading(true)

    try {
      const data = await sendChatMessage(trimmedMessage)

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.response,
          sources: data.sources || [],
        },
      ])
    } catch (err) {
      setError(
        err instanceof Error && err.message.trim()
          ? err.message
          : 'Unable to reach the local AI backend.',
      )
    } finally {
      setLoading(false)
    }
  }, [loading])

  const value = useMemo(
    () => ({
      messages,
      input,
      loading,
      error,
      setInput,
      sendMessage,
    }),
    [messages, input, loading, error, sendMessage],
  )

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const value = useContext(ChatContext)

  if (!value) {
    throw new Error('useChat must be used within ChatProvider')
  }

  return value
}
