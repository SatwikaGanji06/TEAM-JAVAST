import PageHeader from '../components/PageHeader.jsx'

export default function GeneratedDocuments() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Generated Documents"
        subtitle="Approval notes and generated files are not available. The current backend does not expose a document-generation API."
      />

      <div className="rounded-sm border border-dashed border-line-strong px-4 py-10 text-center">
        <p className="text-sm text-ink">No generated documents yet.</p>
        <p className="mt-1 text-xs text-muted">
          Nothing is listed here because no generation or approval-note endpoint
          is connected.
        </p>
      </div>
    </div>
  )
}
