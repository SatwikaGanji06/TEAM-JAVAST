import StatusBadge from '../components/StatusBadge.jsx'
import StatusCard from '../components/StatusCard.jsx'
import QuickActionCard from '../components/QuickActionCard.jsx'
import {
  INFRASTRUCTURE,
  QUICK_ACTIONS,
  RECENT_RUNS,
  SYSTEM_STATUS,
} from '../data/mockDashboard.js'

function SectionLabel({ children }) {
  return (
    <h2 className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
      {children}
    </h2>
  )
}

export default function Dashboard({ onNavigate }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <section>
        <SectionLabel>System status</SectionLabel>
        <div className="grid grid-cols-4 gap-3">
          {SYSTEM_STATUS.map((item) => (
            <StatusCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              onSelect={onNavigate}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Recent agent runs</SectionLabel>
        <ul className="divide-y divide-line rounded-sm border border-line bg-panel">
          {RECENT_RUNS.map((run) => (
            <li
              key={run.id}
              className="flex items-start justify-between gap-4 px-4 py-3.5"
            >
              <div>
                <p className="text-sm text-ink">{run.title}</p>
                <p className="mt-1 text-xs text-muted">{run.subtitle}</p>
              </div>
              <div className="shrink-0 text-right">
                <StatusBadge tone="online">{run.status}</StatusBadge>
                <p className="mt-1 text-xs text-muted">{run.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionLabel>Local AI infrastructure</SectionLabel>
        <ul className="divide-y divide-line rounded-sm border border-line bg-panel">
          {INFRASTRUCTURE.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <StatusBadge tone="online">{service.name}</StatusBadge>
              <span className="text-[11px] font-medium tracking-[0.14em] text-success uppercase">
                {service.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
