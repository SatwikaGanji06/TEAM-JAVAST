import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'

function formatDate(value) {
  if (!value) return 'Unknown time'

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatDocumentType(value) {
  if (!value) return 'Generated document'
  return value.replaceAll('_', ' ')
}

function DocumentCard({ document }) {
  const downloadUrl =
    `${API_BASE_URL}/api/generated-documents/${document.document_id}/download`

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold tracking-[0.12em] text-slate-600">
            DOC
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">
                DOCUMENT #{document.document_id}
              </span>

              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                {formatDocumentType(document.document_type)}
              </span>
            </div>

            <h2 className="mt-2 break-words text-sm font-semibold text-slate-900">
              {document.filename}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Created {formatDate(document.created_at)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-slate-700 transition hover:bg-slate-50"
          >
            OPEN
          </a>

          <a
            href={downloadUrl}
            download={document.filename}
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-white transition hover:bg-sky-600"
          >
            DOWNLOAD DOCX
          </a>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Source Request
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            {document.source_query || 'No source request recorded.'}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Source Documents
          </p>

          {Array.isArray(document.document_ids) &&
          document.document_ids.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {document.document_ids.map((id) => (
                <span
                  key={id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  Document #{id}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              No source documents recorded.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default function GeneratedDocuments() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDocuments() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/generated-documents`
        )

        if (!response.ok) {
          throw new Error('Unable to load generated documents.')
        }

        const data = await response.json()

        if (!cancelled) {
          setDocuments(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error && err.message
              ? err.message
              : 'Unable to load generated documents.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDocuments()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <PageHeader
        title="Generated Documents"
        subtitle="Review and download documents produced by completed local agent runs."
      />

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500 shadow-sm">
          Loading generated documents...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            No generated documents yet
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Approval notes and other generated files will appear here after
            they are created from an analysis.
          </p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="space-y-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.document_id}
              document={document}
            />
          ))}
        </div>
      )}
    </div>
  )
}
