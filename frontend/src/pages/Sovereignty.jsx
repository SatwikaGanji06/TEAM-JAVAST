import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { SOVEREIGNTY_ITEMS } from '../data/systemData.js'

export default function Sovereignty() {
  return (
    <div className="mx-auto w-full max-w-3xl pb-8">
      <PageHeader
        title="Sovereignty"
        subtitle="How this workbench is meant to keep processing local. This page is a system overview, not a live security certificate."
      />

      <div className="mb-6">
        <StatusBadge tone="local" icon="lock">
          Local processing
        </StatusBadge>
      </div>

      <ul className="space-y-3">
        {SOVEREIGNTY_ITEMS.map((item) => (
          <li key={item.id} className="rounded-sm border border-line bg-panel px-4 py-4">
            <p className="text-sm text-ink">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
