import PageHeader from '../components/PageHeader.jsx'

export default function Audit() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Audit"
        subtitle="Audit events are not available in this UI. The backend writes audit records locally, but there is no audit-log HTTP API."
      />

      <div className="rounded-sm border border-dashed border-line-strong px-4 py-10 text-center">
        <p className="text-sm text-ink">No audit events to display.</p>
        <p className="mt-1 text-xs text-muted">
          Live audit history cannot be shown until an audit retrieval endpoint
          exists.
        </p>
      </div>
    </div>
  )
}
