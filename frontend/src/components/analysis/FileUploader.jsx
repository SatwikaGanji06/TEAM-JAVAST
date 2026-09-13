import { useRef, useState } from 'react'
import { uploadRAGDocument } from '../../api/ragApi.js'
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
} from '../../data/analysisOptions.js'

export function formatFileSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExtension(name) {
  const index = name.lastIndexOf('.')
  return index >= 0 ? name.slice(index).toLowerCase() : ''
}

function isAcceptedFile(file) {
  const extension = getExtension(file.name)
  return (
    ACCEPTED_EXTENSIONS.includes(extension) ||
    ACCEPTED_MIME_TYPES.includes(file.type)
  )
}

function uploadErrorMessage(error) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return 'Unable to reach the local AI backend.'
}

export function fileTypeLabel(file) {
  if (file?.typeLabel) return file.typeLabel
  if (file?.type && !file.type.includes('/')) return file.type
  const extension = getExtension(file?.name || '').replace('.', '').toUpperCase()
  return extension || file?.type || 'File'
}

export default function FileUploader({
  file,
  onFileChange,
  onUploaded,
  onUploadingChange,
  variant = 'dropzone',
  disabled = false,
}) {
  const inputRef = useRef(null)
  const uploadingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const busy = disabled || uploading
  const indexed =
    uploadResult?.status === 'success' &&
    typeof uploadResult.chunks_created === 'number'

  async function applyFile(nextFile) {
    if (!nextFile || disabled || uploadingRef.current) return

    if (!isAcceptedFile(nextFile)) {
      setError('Unsupported file type. Use a PDF or TXT file.')
      return
    }

    setError('')
    uploadingRef.current = true
    setUploading(true)
    onUploadingChange?.(true)

    try {
      const result = await uploadRAGDocument(nextFile)
      setUploadResult(result)
      onFileChange(nextFile)
      onUploaded?.(result)
    } catch (uploadError) {
      setUploadResult(null)
      onFileChange(null)
      setError(uploadErrorMessage(uploadError))
    } finally {
      uploadingRef.current = false
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  function handleInputChange(event) {
    const nextFile = event.target.files?.[0]
    applyFile(nextFile)
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    if (busy) return
    applyFile(event.dataTransfer.files?.[0])
  }

  function handleRemove() {
    if (busy) return
    setError('')
    setUploadResult(null)
    onFileChange(null)
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      className="sr-only"
      accept={ACCEPTED_EXTENSIONS.join(',')}
      aria-label="Attach a PDF or TXT file"
      disabled={busy}
      onChange={handleInputChange}
    />
  )

  const resultLabel = indexed
    ? ` · ${uploadResult.chunks_created} chunks indexed`
    : uploadResult
      ? ' · Upload returned without a confirmed index'
      : ''

  if (variant === 'composer') {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {file ? (
          <div className="flex min-w-0 items-center gap-2 rounded-sm border border-line bg-elevated px-2.5 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-xs text-ink">{file.name}</p>
              <p className="text-[10px] tracking-[0.12em] text-muted uppercase">
                {fileTypeLabel(file)}
                {file.size ? ` · ${formatFileSize(file.size)}` : ''}
                {resultLabel}
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="shrink-0 text-[10px] tracking-[0.12em] text-muted uppercase hover:text-ink disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-8 items-center rounded-sm border border-line px-3 text-[11px] font-semibold tracking-[0.12em] text-ink-secondary uppercase transition-colors hover:border-accent/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Attach
        </button>
        {fileInput}
        {error ? (
          <p className="w-full text-xs text-warning">{error}</p>
        ) : uploading ? (
          <p className="w-full text-xs text-muted">Uploading and indexing…</p>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      {file ? (
        <div className="flex items-center justify-between gap-4 rounded-sm border border-accent/40 bg-panel px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
              Uploaded document
            </p>
            <p className="mt-1 text-sm text-ink">{file.name}</p>
            <p className="mt-1 text-xs text-muted">
              {formatFileSize(file.size)} · {fileTypeLabel(file)}
              {resultLabel}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            className="rounded-sm border border-line px-3 py-1.5 text-xs tracking-wide text-ink-secondary uppercase transition-colors hover:border-line-strong hover:bg-hover hover:text-ink"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            if (busy) return
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center rounded-sm border border-dashed px-6 py-10 text-center transition-colors ${
            isDragging
              ? 'border-accent/70 bg-accent/5'
              : 'border-line-strong bg-panel hover:border-line-strong'
          }`}
        >
          <p className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
            Document
          </p>
          <p className="mt-3 text-sm text-ink">Drop a PDF or TXT file here</p>
          <p className="mt-1 text-xs text-muted">
            {uploading
              ? 'Uploading and indexing…'
              : 'Files are indexed only after the upload API confirms it'}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-sm border border-line-strong bg-elevated px-4 py-2 text-xs font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:border-line-strong hover:bg-hover"
          >
            Browse files
          </button>
        </div>
      )}

      {fileInput}

      {error ? <p className="mt-3 text-xs text-warning">{error}</p> : null}
    </div>
  )
}
