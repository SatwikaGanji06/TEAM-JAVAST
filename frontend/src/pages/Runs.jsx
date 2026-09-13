import PageHeader from '../components/PageHeader.jsx'
import EmptyPanel from '../components/EmptyPanel.jsx'

export default function Runs() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-10">
      <PageHeader
        title="Runs"
        subtitle="Completed analysis jobs will appear here when run tracking is available."
      />
      <EmptyPanel title="No runs yet">
        Analysis conversations are not stored as runs. There is no run-history
        API on the local backend.
      </EmptyPanel>
    </div>
  )
}
