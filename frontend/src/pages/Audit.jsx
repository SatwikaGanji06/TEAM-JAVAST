import PageHeader from '../components/PageHeader.jsx'
import EmptyPanel from '../components/EmptyPanel.jsx'

export default function Audit() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-10">
      <PageHeader
        title="Audit"
        subtitle="Security and inference events will appear here when an audit API is available."
      />
      <EmptyPanel title="No audit events to display">
        The workbench backend does not expose an audit-log retrieval endpoint.
      </EmptyPanel>
    </div>
  )
}
