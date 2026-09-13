import PageHeader from '../components/PageHeader.jsx'
import EmptyPanel from '../components/EmptyPanel.jsx'

export default function GeneratedDocuments() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-10">
      <PageHeader
        title="Generated Documents"
        subtitle="Approval notes and exported files will appear here when generation is available."
      />
      <EmptyPanel title="No generated documents yet">
        The local backend does not expose an approval-note or document-generation
        endpoint.
      </EmptyPanel>
    </div>
  )
}
