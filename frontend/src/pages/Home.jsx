import { useEffect, useState } from 'react'
import QuickActionCard from '../components/QuickActionCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { API_BASE_URL } from '../api/chatApi.js'

async function pingBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/docs`)
    return response.ok
  } catch {
    return false
  }
}

async function fetchDocumentCatalog() {
  const response = await fetch(`${API_BASE_URL}/api/documents`)

  if (!response.ok) {
    throw new Error('Unable to retrieve document catalog.')
  }

  return response.json()
}

const ACTIONS = [
  {
    id: 'analysis',
    icon: 'plus',
    title: 'Start analysis',
    description: 'Run an agentic analysis over industrial documents.',
  },
  {
    id: 'documents',
    icon: 'document',
    title: 'Add documents',
    description: 'Upload PDF or TXT files for local retrieval.',
  },
  {
    id: 'knowledge-base',
    icon: 'search',
    title: 'Search knowledge',
    description: 'Search the indexed industrial knowledge base.',
  },
]

export default function Home({ onNavigate }) {
  const [backendReady, setBackendReady] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [catalogError, setCatalogError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadHomeData() {
      const [backendStatus, catalogResult] = await Promise.allSettled([
        pingBackend(),
        fetchDocumentCatalog(),
      ])

      if (cancelled) return

      if (backendStatus.status === 'fulfilled') {
        setBackendReady(backendStatus.value)
      } else {
        setBackendReady(false)
      }

      if (catalogResult.status === 'fulfilled') {
        setCatalog(
          Array.isArray(catalogResult.value) ? catalogResult.value : [],
        )
        setCatalogError(false)
      } else {
        setCatalog([])
        setCatalogError(true)
      }
    }

    loadHomeData()

    return () => {
      cancelled = true
    }
  }, [])

  const indexedChunks = catalog.reduce((total, document) => {
    const chunks =
      typeof document.chunks_created === 'number'
        ? document.chunks_created
        : typeof document.chunk_count === 'number'
          ? document.chunk_count
          : 0

    return total + chunks
  }, 0)

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <section className="mb-16 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <h1
            className="animate-fade-in text-5xl font-bold tracking-tighter text-ink sm:text-7xl"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            LOKAI
          </h1>

          <p
            className="animate-slide-up-fade-in mt-4 text-lg font-medium tracking-[0.1em] text-ink-secondary uppercase sm:text-xl"
            style={{ animationDelay: '0.3s', opacity: 0 }}
          >
            Local AI for Sensitive Work
          </p>

          <p
            className="animate-slide-up-fade-in mx-auto mt-6 max-w-2xl text-base text-muted sm:text-lg"
            style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            LOKAI is an on-premise AI platform that lets organizations use
            RAG, document intelligence and AI agents on sensitive data without
            sending that data to external cloud AI services.
          </p>

          <div
            className="animate-fade-in mt-10"
            style={{ animationDelay: '0.7s', opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => onNavigate?.('analysis')}
              className="rounded-sm bg-sky-500/90 px-6 py-3 text-[11px] font-semibold tracking-[0.14em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
            >
              Start New Analysis
            </button>
          </div>
        </div>
      </section>

      <div
        className="animate-fade-in space-y-8"
        style={{ animationDelay: '0.9s', opacity: 0 }}
      >
        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-sm border border-line bg-panel px-4 py-4">
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
              Indexed documents
            </p>

            <p className="mt-2 text-2xl font-medium text-ink">
              {catalog.length}
            </p>

            <p className="mt-1 text-xs text-ink-secondary">
              Documents available to the local knowledge base
            </p>
          </article>

          <article className="rounded-sm border border-line bg-panel px-4 py-4">
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
              Indexed chunks
            </p>

            <p className="mt-2 text-2xl font-medium text-ink">
              {catalogError ? '—' : indexedChunks}
            </p>

            <p className="mt-1 text-xs text-ink-secondary">
              Indexed passages available for retrieval
            </p>
          </article>

          <article className="rounded-sm border border-line bg-panel px-4 py-4">
            <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
              Local backend
            </p>

            <div className="mt-2">
              {backendReady == null ? (
                <p className="text-sm text-ink-secondary">Checking...</p>
              ) : backendReady ? (
                <StatusBadge tone="online">Reachable</StatusBadge>
              ) : (
                <p className="text-sm text-warning">Unavailable</p>
              )}
            </div>

            <p className="mt-1 text-xs text-ink-secondary">
              LOKAI API on this machine
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
              Recent indexed documents
            </h3>

            <button
              type="button"
              onClick={() => onNavigate?.('documents')}
              className="text-[11px] tracking-[0.12em] text-ink-secondary uppercase hover:text-ink"
            >
              Manage
            </button>
          </div>

          {catalogError ? (
            <p className="rounded-sm border border-line bg-panel px-4 py-4 text-sm text-warning">
              Unable to load the document catalog.
            </p>
          ) : catalog.length === 0 ? (
            <p className="rounded-sm border border-line bg-panel px-4 py-4 text-sm text-ink-secondary">
              No indexed documents are currently available.
            </p>
          ) : (
            <ul className="divide-y divide-line rounded-sm border border-line bg-panel">
              {catalog.slice(0, 5).map((document) => (
                <li key={document.document_id} className="px-4 py-3">
                  <p className="truncate text-sm text-ink">
                    {document.file_name}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {typeof document.chunks_created === 'number'
                      ? `${document.chunks_created} chunks indexed`
                      : 'Indexed locally'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
