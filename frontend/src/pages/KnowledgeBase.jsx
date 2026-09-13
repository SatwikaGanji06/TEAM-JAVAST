import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import { queryRAG } from '../api/ragApi.js'

export default function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function search(event) {
    event.preventDefault()
    const text = query.trim()
    if (!text || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await queryRAG(text)
      setResult(data)
    } catch (searchError) {
      setError(
        searchError instanceof Error && searchError.message.trim()
          ? searchError.message
          : 'Unable to reach the local AI backend.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Knowledge Base"
        subtitle="Search indexed documents with POST /api/rag/query. This page does not list stored SOP or manual records because no catalog API exists."
      />

      <form onSubmit={search} className="mb-6 rounded-sm border border-line bg-panel p-4">
        <label className="block">
          <span className="mb-2 block text-xs text-ink-secondary">Search indexed documents</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a search question…"
            className="w-full rounded-sm border border-line bg-app px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-accent/50"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={`mt-3 rounded-sm px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase ${
            loading || !query.trim()
              ? 'cursor-not-allowed bg-elevated text-muted'
              : 'bg-sky-500/90 text-slate-950 hover:bg-sky-400'
          }`}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error ? <p className="text-sm text-warning">{error}</p> : null}

      {result ? (
        <ChatMessage
          message={{
            id: 'kb-result',
            role: 'assistant',
            text: result.answer,
            sources: result.sources,
          }}
        />
      ) : !loading && !error ? (
        <div className="rounded-sm border border-dashed border-line-strong px-4 py-10 text-center">
          <p className="text-sm text-ink">No knowledge-base catalog to display.</p>
          <p className="mt-1 text-xs text-muted">
            Indexed documents are queried here or through Analysis. Standing SOP
            and manual entries are not stored in a frontend list.
          </p>
        </div>
      ) : null}
    </div>
  )
}
