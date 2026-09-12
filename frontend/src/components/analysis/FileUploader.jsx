import { useRef, useState } from 'react'
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
} from '../../data/analysisOptions.js'

function formatFileSize(bytes) {
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

function fileTypeLabel(file) {
  const extension = getExtension(file.name).replace('.', '').toUpperCase()
  return extension || file.type || 'Unknown'
}

export default function FileUploader({ file, onFileChange }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  function applyFile(nextFile) {
    if (!nextFile) return

    if (!isAcceptedFile(nextFile)) {
      setError('Use a PDF, DOCX, PNG, or JPG/JPEG file.')
      return
    }

    setError('')
    onFileChange(nextFile)
  }

  function handleInputChange(event) {
    const nextFile = event.target.files?.[0]
    applyFile(nextFile)
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    applyFile(event.dataTransfer.files?.[0])
  }

  function handleRemove() {
    setError('')
    onFileChange(null)
  }

  return (
    <div>
      {file ? (
        <div className="flex items-center justify-between gap-4 rounded-sm border border-accent/40 bg-panel px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
              Selected document
            </p>
            <p className="mt-1 text-sm text-ink">{file.name}</p>
            <p className="mt-1 text-xs text-muted">
              {formatFileSize(file.size)} · {fileTypeLabel(file)}
            </p>
          </div>
          <button
            type="button"
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
          <p className="mt-3 text-sm text-ink">
            Drop inspection report here
          </p>
          <p className="mt-1 text-xs text-muted">PDF, DOCX or image files</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-sm border border-line-strong bg-elevated px-4 py-2 text-xs font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:border-line-strong hover:bg-hover"
          >
            Browse Files
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        aria-label="Inspection report file"
        onChange={handleInputChange}
      />

      {error ? <p className="mt-3 text-xs text-warning">{error}</p> : null}
    </div>
  )
}
