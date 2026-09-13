import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SuggestedPrompts from '../components/chat/SuggestedPrompts.jsx'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import { queryRAG } from '../api/ragApi.js'

const STARTERS = [
  'Summarize the indexed documents',
  'What safety issues are mentioned?',
  'What maintenance actions are recommended?',
]

export default function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  async function runSearch(nextQuery) {
    const text = (nextQuery || '').trim()
    if (!text || loading) return

    setQuery(text)
    setLoading(true)
    setError('')
    setResult(null)
    setLastQuery(text)

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

  function search(event) {
    event.preventDefault()
    runSearch(query)
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-10">
      <PageHeader
        title="Knowledge Base"
        subtitle="Search the indexed document corpus. Results include the model answer and the retrieved source passages."
      />

      <form onSubmit={search} className="rounded-sm border border-line bg-panel p-4">
        <label className="block">
          <span className="mb-2 block text-xs text-ink-secondary">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask a question about indexed documents…"
            className="w-full rounded-sm border border-line bg-app px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-accent/50"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <SuggestedPrompts
            prompts={STARTERS}
            disabled={loading}
            onSelect={runSearch}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`rounded-sm px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase ${
              loading || !query.trim()
                ? 'cursor-not-allowed bg-elevated text-muted'
                : 'bg-sky-500/90 text-slate-950 hover:bg-sky-400'
            }`}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      <section className="mt-8">
        {loading ? (
          <p className="text-[11px] tracking-[0.16em] text-accent uppercase">
            Searching indexed documents…
          </p>
        ) : null}

        {error ? (
          <div className="rounded-sm border border-warning/40 bg-panel px-4 py-4">
            <p className="text-sm text-warning">{error}</p>
          </div>
        ) : null}

        {result ? (
          <div className="space-y-3">
            {lastQuery ? (
              <p className="text-xs text-muted">Results for “{lastQuery}”</p>
            ) : null}
            <ChatMessage
              message={{
                id: 'kb-result',
                role: 'assistant',
                text: result.answer,
                sources: result.sources,
              }}
            />
          </div>
        ) : !loading && !error ? (
          <div className="rounded-sm border border-line bg-panel px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">Search the indexed corpus</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              There is no standalone catalog of SOP or manual entries. Use
              search to retrieve passages from documents that have already been
              indexed, or open Analysis for a conversation.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
