import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import FileUploader, { fileTypeLabel } from '../components/analysis/FileUploader.jsx'
import { INITIAL_DOCUMENTS } from '../data/documentsData.js'

const SAMPLE_DOCUMENT_IDS = new Set(
  INITIAL_DOCUMENTS.map((document) => document.id),
)

export default function Documents() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)

  const filtered = documents.filter((document) =>
    document.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  function addDocument() {
    if (!uploadFile) return

    setDocuments((current) => [
      {
        id: `doc-${Date.now()}`,
        name: uploadFile.name,
        type: fileTypeLabel(uploadFile),
        pages: null,
        added: 'Just now',
        usedInRuns: 0,
      },
      ...current,
    ])
    setUploadFile(null)
    setAdding(false)
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Documents"
        subtitle="This page is a workspace list, not the searchable index. PDF/TXT files you select here are indexed for Agent Chat by the backend."
      >
        <button
          type="button"
          onClick={() => setAdding((current) => !current)}
          className="rounded-md bg-accent px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-app uppercase transition-colors hover:bg-accent-strong"
        >
          {adding ? 'Cancel' : '+ Add document'}
        </button>
      </PageHeader>

      {adding ? (
        <div className="mb-6 rounded-sm border border-line bg-panel p-4">
          <p className="mb-3 text-xs text-muted">
            Select a PDF or TXT file to index it for Agent Chat. Adding it to
            this list is optional and stays in this browser session. Indexed
            files do not appear here automatically.
          </p>
          <FileUploader file={uploadFile} onFileChange={setUploadFile} />
          <button
            type="button"
            disabled={!uploadFile}
            onClick={addDocument}
            className={`mt-3 rounded-sm px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase ${
              uploadFile
                ? 'bg-accent text-app hover:bg-accent-strong'
                : 'cursor-not-allowed bg-elevated text-muted'
            }`}
          >
            Add to this list
          </button>
        </div>
      ) : null}

      <label className="mb-4 block">
        <span className="sr-only">Search this list</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search this list..."
          className="w-full rounded-sm border border-line bg-panel px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-accent/50"
        />
      </label>

      {filtered.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line-strong px-4 py-10 text-center">
          <p className="text-sm text-ink">No items match this search.</p>
          <p className="mt-1 text-xs text-muted">
            Clear the search to see this workspace list.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((document) => (
            <li
              key={document.id}
              className="flex flex-col gap-3 rounded-sm border border-line bg-panel px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{document.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {document.type}
                  {document.pages ? ` · ${document.pages} pages` : ''}
                  {` · Added ${document.added}`}
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  {SAMPLE_DOCUMENT_IDS.has(document.id)
                    ? 'Layout sample · not the RAG index'
                    : 'On this list only · not a database library'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
