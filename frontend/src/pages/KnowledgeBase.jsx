import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import SuggestedPrompts from '../components/chat/SuggestedPrompts.jsx'
import { queryRAG } from '../api/ragApi.js'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'

const STARTERS = [
  'Summarize the indexed documents',
  'What safety issues are mentioned?',
  'What maintenance actions are recommended?',
]

function sourceTitle(source, index) {
  return (
    source?.document ||
    source?.metadata?.source ||
    `Retrieved passage ${index + 1}`
  )
}

export default function KnowledgeBase() {
  const { selectedDocumentIds } = useUploadedDocuments()

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
      const data = await queryRAG(text, selectedDocumentIds)
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

  const sources = Array.isArray(result?.sources)
    ? result.sources
    : []

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <PageHeader
        title="Knowledge Base"
        subtitle="Search local indexed evidence and inspect the source passages used to answer your question."
      />

      <section className="rounded-sm border border-line bg-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
              Local evidence search
            </p>
            <h3 className="mt-1 text-base font-medium text-ink">
              Search indexed documents
            </h3>
          </div>

          <div className="rounded-sm border border-line bg-elevated px-3 py-2">
            <span className="text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
              Scope
            </span>
            <span className="ml-2 text-xs font-medium text-ink">
              {selectedDocumentIds.length > 0
                ? `${selectedDocumentIds.length} selected`
                : 'All indexed documents'}
            </span>
          </div>
        </div>

        <form
          onSubmit={search}
          autoComplete="off"
          className="mt-5"
        >
          <label className="block">
            <span className="sr-only">Search indexed documents</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask a question about the indexed evidence..."
              className="w-full rounded-sm border border-line bg-app px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent/50"
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
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <section className="mt-5 rounded-sm border border-line bg-panel px-5 py-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-accent uppercase">
            Retrieving local evidence
          </p>
          <p className="mt-1 text-sm text-muted">
            Searching the selected document scope...
          </p>
        </section>
      ) : null}

      {error ? (
        <section className="mt-5 rounded-sm border border-warning/40 bg-panel px-5 py-4">
          <p className="text-sm text-warning">{error}</p>
        </section>
      ) : null}

      {!loading && !error && !result ? (
        <section className="mt-5 rounded-sm border border-line bg-panel px-5 py-10 text-center">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
            Local evidence
          </p>
          <h3 className="mt-2 text-base font-medium text-ink">
            Search the indexed corpus
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
            Ask a question to retrieve relevant passages from the documents available to LOKAI.
          </p>
        </section>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-5">
          <section className="rounded-sm border border-line bg-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-accent uppercase">
                  Search result
                </p>
                <p className="mt-1 text-xs text-muted">
                  {lastQuery}
                </p>
              </div>

              <span className="rounded-sm border border-line bg-elevated px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-muted uppercase">
                {sources.length} {sources.length === 1 ? 'source' : 'sources'}
              </span>
            </div>

            <div className="px-5 py-5">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                Answer
              </p>

              <div className="mt-3 rounded-sm border border-line bg-elevated px-4 py-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-ink">
                  {result.answer}
                </p>
              </div>
            </div>
          </section>

          {sources.length > 0 ? (
            <section className="rounded-sm border border-line bg-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                    Retrieved evidence
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Source passages returned from the local vector search.
                  </p>
                </div>

                <span className="text-[10px] font-medium tracking-[0.12em] text-muted uppercase">
                  {sources.length} sources
                </span>
              </div>

              <div className="divide-y divide-line">
                {sources.map((source, index) => (
                  <article
                    key={`${source.document_id ?? 'doc'}-${source.chunk_index ?? index}`}
                    className="px-5 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {sourceTitle(source, index)}
                        </p>
                        <p className="mt-1 text-[10px] tracking-[0.12em] text-muted uppercase">
                          Document {source.document_id ?? '—'}
                          {' · '}
                          Chunk {source.chunk_index ?? '—'}
                        </p>
                      </div>

                      {typeof source.similarity === 'number' ? (
                        <span className="shrink-0 text-xs font-medium text-muted">
                          {source.similarity.toFixed(2)}
                        </span>
                      ) : null}
                    </div>

                    {source.content ? (
                      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-ink-secondary">
                        {source.content}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
