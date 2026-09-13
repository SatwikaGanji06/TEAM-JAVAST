import PageHeader from '../components/PageHeader.jsx'

export default function Runs() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Runs"
        subtitle="Agent run history is not available. The backend does not expose a runs API."
      />

      <div className="rounded-sm border border-dashed border-line-strong px-4 py-10 text-center">
        <p className="text-sm text-ink">No runs yet.</p>
        <p className="mt-1 text-xs text-muted">
          Planner, calculator, and verification steps are not simulated here.
        </p>
      </div>
    </div>
  )
}
