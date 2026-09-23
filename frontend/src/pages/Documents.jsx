import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyPanel from '../components/EmptyPanel.jsx'
import FileUploader from '../components/analysis/FileUploader.jsx'
import { ingestRAGDocuments } from '../api/ragApi.js'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'
import { API_BASE_URL } from '../api/chatApi.js'

function formatUploadedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function fileExtension(name) {
  const value = String(name || '')
  const index = value.lastIndexOf('.')

  return index >= 0
    ? value.slice(index + 1).toUpperCase()
    : 'FILE'
}

export default function Documents() {
  const {
    addUploadedDocument,
    lastIngest,
    recordIngest,
    selectedDocumentIds,
    toggleDocumentSelection,
  } = useUploadedDocuments()

  const [catalog, setCatalog] = useState([])
  const [file, setFile] = useState(null)
  const [ingestError, setIngestError] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [loadingCatalog, setLoadingCatalog] = useState(true)

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents`)

        if (response.ok) {
          const data = await response.json()
          setCatalog(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch document catalog:', error)
      } finally {
        setLoadingCatalog(false)
      }
    }

    fetchCatalog()
  }, [])

  function handleUploaded(result) {
    addUploadedDocument(result)
    setFile(null)

    if (result?.document_id) {
      setCatalog((current) => {
        const next = current.filter(
          (document) => document.document_id !== result.document_id,
        )

        return [
          {
            document_id: result.document_id,
            file_name: result.file_name,
            uploaded_at: result.uploaded_at || new Date().toISOString(),
            chunks_created: result.chunks_created,
            status: result.status || 'indexed',
          },
          ...next,
        ]
      })
    }
  }

  async function handleIngest() {
    if (ingesting) return

    setIngesting(true)
    setIngestError('')

    try {
      const result = await ingestRAGDocuments()
      recordIngest(result)

      const response = await fetch(`${API_BASE_URL}/api/documents`)

      if (response.ok) {
        const data = await response.json()
        setCatalog(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      setIngestError(
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Unable to index stored files.',
      )
    } finally {
      setIngesting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-8">
      <PageHeader
        title="Documents"
        subtitle="Manage the local document library used by Analysis and Knowledge Base search."
      >
        <button
          type="button"
          disabled={ingesting}
          onClick={handleIngest}
          className="rounded-sm border border-line-strong bg-panel px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ingesting ? 'Indexing...' : 'Re-index stored files'}
        </button>
      </PageHeader>

      <section className="rounded-sm border border-line bg-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
              Add document
            </p>
            <h3 className="mt-1 text-base font-medium text-ink">
              Add a local source to the workspace
            </h3>
            <p className="mt-1 text-sm text-ink-secondary">
              PDF and TXT files are uploaded to the local backend and indexed for retrieval.
            </p>
          </div>

          <span className="text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
            Local storage
          </span>
        </div>

        <div className="mt-3">
          <FileUploader
            file={file}
            onFileChange={setFile}
            onUploaded={handleUploaded}
          />
        </div>
      </section>

      {ingestError ? (
        <div className="mt-4 rounded-sm border border-warning/40 bg-panel px-4 py-3">
          <p className="text-sm text-warning">{ingestError}</p>
        </div>
      ) : null}

      {lastIngest ? (
        <section className="mt-4 rounded-sm border border-line bg-panel px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                Latest indexing
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {lastIngest.status === 'success'
                  ? 'Index updated successfully'
                  : lastIngest.status}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-muted">
              <span>
                {lastIngest.documents_processed} documents
              </span>
              <span>
                {lastIngest.chunks_created} chunks
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">
              Document library
            </p>
            <h3 className="mt-1 text-base font-medium text-ink">
              Indexed sources
            </h3>
          </div>

          <div className="rounded-sm border border-line bg-panel px-3 py-2">
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

        <div className="mt-3">
          {loadingCatalog ? (
            <div className="rounded-sm border border-line bg-panel px-5 py-8">
              <p className="text-sm text-muted">
                Loading document library...
              </p>
            </div>
          ) : catalog.length === 0 ? (
            <EmptyPanel title="No indexed documents">
              Upload a PDF or TXT file to create the first local source.
            </EmptyPanel>
          ) : (
            <div className="overflow-hidden rounded-sm border border-line bg-panel">
              {catalog.map((document, index) => {
                const selected = selectedDocumentIds.includes(
                  document.document_id,
                )

                return (
                  <div
                    key={document.document_id}
                    className={`flex flex-col gap-2.5 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                      index > 0 ? 'border-t border-line' : ''
                    } ${
                      selected ? 'bg-sky-50/60' : 'hover:bg-hover'
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleDocumentSelection(document.document_id)
                        }
                        aria-label={`Select ${document.file_name}`}
                        className="mt-1 h-4 w-4 rounded-sm border-line bg-app text-accent focus:ring-accent"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-ink">
                            {document.file_name}
                          </p>

                          {selected ? (
                            <span className="rounded-sm border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-sky-700 uppercase">
                              In scope
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs text-muted">
                          ID {document.document_id}
                          {' · '}
                          {fileExtension(document.file_name)}
                          {document.uploaded_at
                            ? ` · ${new Date(document.uploaded_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}`
                            : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {typeof document.chunks_created === 'number' ? (
                        <span className="text-xs text-muted">
                          {document.chunks_created} chunks
                        </span>
                      ) : null}

                      <span className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-emerald-700 uppercase">
                        Indexed
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


