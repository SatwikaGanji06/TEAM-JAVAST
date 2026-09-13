import { useState } from 'react'
import { generateApprovalNote } from '../../api/chatApi.js'


export default function ChatMessage({
  message,
  onAction,
}) {
  const isUser = message.role === 'user'
  const [exporting, setExporting] = useState(false)


  async function handleExport() {
    if (exporting) return

    setExporting(true)

    try {
      const blob = await generateApprovalNote(
        message.exportQuery || message.text,
      )

      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'approval_note.docx'

      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
    } finally {
      setExporting(false)
    }
  }


  return (
    <article
      className={`flex ${
        isUser
          ? 'justify-end'
          : 'justify-start'
      }`}
    >

      <div
        className={`max-w-[78%] ${
          isUser ? 'text-right' : ''
        }`}
      >

        <p className="mb-1 font-mono text-[10px] font-medium tracking-[0.14em] text-ink-secondary uppercase">
          {isUser ? 'You' : 'Assistant'}
        </p>


        {message.attachment ? (
          <div className="mb-2 rounded-md border border-line bg-panel px-2.5 py-1.5 text-left">

            <p className="truncate text-xs text-ink">
              {message.attachment.name}
            </p>

            <p className="font-mono text-[10px] tracking-[0.12em] text-ink-secondary uppercase">
              {message.attachment.type || 'File'} · Attached
            </p>

          </div>
        ) : null}


        <p
          className={`whitespace-pre-wrap text-sm leading-6 text-ink ${
            isUser ? 'text-left' : ''
          }`}
        >
          {message.text}
        </p>


        {message.action === 'sources' ? (
          <button
            type="button"
            onClick={() =>
              onAction?.(
                message.id,
                'sources',
              )
            }
            className="mt-2 mr-3 font-mono text-[10px] font-medium tracking-[0.14em] text-accent uppercase transition-colors hover:text-accent-strong"
          >
            View sources
          </button>
        ) : null}


        {!isUser ? (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="mt-2 font-mono text-[10px] font-medium tracking-[0.14em] text-accent uppercase transition-colors hover:text-accent-strong disabled:opacity-50"
          >
            {exporting
              ? 'Generating…'
              : 'Export as DOCX'}
          </button>
        ) : null}


        {message.notice ? (
          <p className="mt-2 whitespace-pre-wrap text-xs text-ink-secondary">
            {message.notice}
          </p>
        ) : null}

      </div>

    </article>
  )
}