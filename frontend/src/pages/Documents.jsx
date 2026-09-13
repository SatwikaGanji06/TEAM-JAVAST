import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import FileUploader, { fileTypeLabel } from '../components/analysis/FileUploader.jsx'
import { useUploadedDocuments } from '../session/UploadedDocumentsContext.jsx'

export default function Documents() {
  const { documents, addUploadedDocument } = useUploadedDocuments()
  const [file, setFile] = useState(null)
  const [adding, setAdding] = useState(false)

  function handleUploaded(result) {
    addUploadedDocument(result)
    setFile(null)
    setAdding(false)
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Documents"
        subtitle="Upload PDF or TXT files through POST /api/rag/upload. There is no document-list API, so only uploads confirmed in this browser session can be shown."
      >
        <button
          type="button"
          onClick={() => setAdding((current) => !current)}
          className="rounded-sm bg-sky-500/90 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
        >
          {adding ? 'Cancel' : 'Upload document'}
        </button>
      </PageHeader>

      {adding ? (
        <div className="mb-6 rounded-sm border border-line bg-panel p-4">
          <p className="mb-3 text-xs text-muted">
            A file is listed here only after the upload API returns a document
            id. Indexing is shown only when that response includes a chunk count.
          </p>
          <FileUploader
            file={file}
            onFileChange={setFile}
            onUploaded={handleUploaded}
          />
        </div>
      ) : null}

      {documents.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line-strong px-4 py-10 text-center">
          <p className="text-sm text-ink">No documents to list.</p>
          <p className="mt-1 text-xs text-muted">
            Previously indexed files cannot be shown because the backend does
            not provide a document-list endpoint.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {documents.map((document) => {
            const indexed =
              document.status === 'success' &&
              typeof document.chunks_created === 'number'

            return (
              <li
                key={document.document_id}
                className="rounded-sm border border-line bg-panel px-4 py-4"
              >
                <p className="truncate text-sm text-ink">
                  {document.file_name || `Document ${document.document_id}`}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {fileTypeLabel({ name: document.file_name || '' })}
                  {` · ID ${document.document_id}`}
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  {indexed
                    ? `Indexed · ${document.chunks_created} chunks created`
                    : `Upload status: ${document.status || 'unknown'} · indexing not confirmed`}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
