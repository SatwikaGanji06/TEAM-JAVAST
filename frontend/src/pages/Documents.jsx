import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyPanel from '../components/EmptyPanel.jsx'
import FileUploader, { fileTypeLabel } from '../components/analysis/FileUploader.jsx'
import { ingestRAGDocuments } from '../api/ragApi.js'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'

export default function Documents() {
  const { documents, addUploadedDocument, lastIngest, recordIngest } =
    useUploadedDocuments()
  const [file, setFile] = useState(null)
  const [ingestError, setIngestError] = useState('')
  const [ingesting, setIngesting] = useState(false)

  function handleUploaded(result) {
    addUploadedDocument(result)
    setFile(null)
  }

  async function handleIngest() {
    if (ingesting) return
    setIngesting(true)
    setIngestError('')

    try {
      const result = await ingestRAGDocuments()
      recordIngest(result)
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
    <div className="mx-auto w-full max-w-4xl pb-10">
      <PageHeader
        title="Documents"
        subtitle="Index PDF and TXT files for Analysis and Knowledge Base search. The library below lists uploads confirmed in this session."
      >
        <button
          type="button"
          disabled={ingesting}
          onClick={handleIngest}
          className="rounded-sm border border-line-strong px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ingesting ? 'Indexing…' : 'Index stored files'}
        </button>
      </PageHeader>

      <section className="mb-8 rounded-sm border border-line bg-panel p-4">
        <h3 className="mb-1 text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Upload
        </h3>
        <p className="mb-4 text-sm text-ink-secondary">
          Files are added to this list only after the local backend confirms
          indexing.
        </p>
        <FileUploader
          file={file}
          onFileChange={setFile}
          onUploaded={handleUploaded}
        />
      </section>

      {ingestError ? (
        <p className="mb-4 text-sm text-warning">{ingestError}</p>
      ) : null}

      {lastIngest ? (
        <section className="mb-8 rounded-sm border border-line bg-panel px-4 py-4">
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
            Stored-file index
          </h3>
          <p className="mt-2 text-sm text-ink">
            {lastIngest.status === 'success' ? 'Indexed' : lastIngest.status}
            {` · ${lastIngest.documents_processed} documents`}
            {` · ${lastIngest.chunks_created} chunks`}
          </p>
          <p className="mt-1 text-xs text-muted">
            These files live on the server. They are not added to the session
            list unless they were also uploaded from this browser.
          </p>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Session library
        </h3>
        {documents.length === 0 ? (
          <EmptyPanel title="No documents in this session">
            Upload a PDF or TXT file to index it. Previously indexed files are
            not listed here because the backend does not provide a document
            catalog.
          </EmptyPanel>
        ) : (
          <ul className="space-y-3">
            {documents.map((document) => {
              const indexed =
                document.status === 'success' &&
                typeof document.chunks_created === 'number'

              return (
                <li
                  key={document.document_id}
                  className="flex flex-col gap-2 rounded-sm border border-line bg-panel px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">
                      {document.file_name || `Document ${document.document_id}`}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {fileTypeLabel({ name: document.file_name || '' })}
                      {` · ID ${document.document_id}`}
                    </p>
                  </div>
                  <p className="text-xs text-ink-secondary">
                    {indexed
                      ? `${document.chunks_created} chunks indexed`
                      : 'Indexing not confirmed'}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
