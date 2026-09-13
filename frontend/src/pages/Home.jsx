import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import QuickActionCard from '../components/QuickActionCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { pingBackend } from '../api/ragApi.js'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'

const ACTIONS = [
  {
    id: 'analysis',
    icon: 'plus',
    title: 'Start analysis',
    description: 'Ask the local model about indexed documents.',
  },
  {
    id: 'documents',
    icon: 'document',
    title: 'Add documents',
    description: 'Upload PDF or TXT files to index for retrieval.',
  },
  {
    id: 'knowledge-base',
    icon: 'search',
    title: 'Search knowledge',
    description: 'Run a retrieval query across the indexed corpus.',
  },
]

export default function Home({ onNavigate }) {
  const { documents, lastIngest } = useUploadedDocuments()
  const [backendReady, setBackendReady] = useState(null)

  useEffect(() => {
    let cancelled = false

    pingBackend().then((ready) => {
      if (!cancelled) setBackendReady(ready)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const indexedChunks = documents.reduce((total, document) => {
    return total + (typeof document.chunks_created === 'number' ? document.chunks_created : 0)
  }, 0)

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <PageHeader
        title="Home"
        subtitle="Analyze industrial documents with local retrieval and generation. Start a conversation, index files, or search the corpus."
      >
        <button
          type="button"
          onClick={() => onNavigate?.('analysis')}
          className="rounded-sm bg-sky-500/90 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
        >
          Start New Analysis
        </button>
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-sm border border-line bg-panel px-4 py-4">
          <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Session uploads</p>
          <p className="mt-2 text-2xl font-medium text-ink">{documents.length}</p>
          <p className="mt-1 text-xs text-ink-secondary">
            Confirmed in this browser session
          </p>
        </article>
        <article className="rounded-sm border border-line bg-panel px-4 py-4">
          <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Indexed chunks</p>
          <p className="mt-2 text-2xl font-medium text-ink">{indexedChunks}</p>
          <p className="mt-1 text-xs text-ink-secondary">
            From uploads confirmed this session
          </p>
        </article>
        <article className="rounded-sm border border-line bg-panel px-4 py-4">
          <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Local backend</p>
          <div className="mt-2">
            {backendReady == null ? (
              <p className="text-sm text-ink-secondary">Checking…</p>
            ) : backendReady ? (
              <StatusBadge tone="online">Reachable</StatusBadge>
            ) : (
              <p className="text-sm text-warning">Unavailable</p>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Workbench API on this machine
          </p>
        </article>
      </section>

      <section className="mt-8">
        <h3 className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Workspace
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          {ACTIONS.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              onSelect={onNavigate}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
            Recent session documents
          </h3>
          <button
            type="button"
            onClick={() => onNavigate?.('documents')}
            className="text-[11px] tracking-[0.12em] text-ink-secondary uppercase hover:text-ink"
          >
            Manage
          </button>
        </div>
        {documents.length === 0 ? (
          <p className="rounded-sm border border-line bg-panel px-4 py-4 text-sm text-ink-secondary">
            No files have been uploaded in this session yet.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-sm border border-line bg-panel">
            {documents.slice(0, 5).map((document) => (
              <li key={document.document_id} className="px-4 py-3">
                <p className="truncate text-sm text-ink">{document.file_name}</p>
                <p className="mt-1 text-xs text-muted">
                  {typeof document.chunks_created === 'number'
                    ? `${document.chunks_created} chunks indexed`
                    : 'Upload confirmed'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lastIngest ? (
        <section className="mt-8 rounded-sm border border-line bg-panel px-4 py-4">
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
            Last server index
          </h3>
          <p className="mt-2 text-sm text-ink">
            {lastIngest.documents_processed} documents · {lastIngest.chunks_created} chunks
          </p>
          <p className="mt-1 text-xs text-ink-secondary">
            Result of the most recent index of stored server files.
          </p>
        </section>
      ) : null}
    </div>
  )
}
