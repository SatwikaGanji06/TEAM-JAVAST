import StatusBadge from './StatusBadge.jsx'

export default function TopBar({ title }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d1016] px-6">
      <h1 className="text-sm font-medium tracking-wide text-slate-100">
        {title}
      </h1>

      <div className="flex items-center gap-5">
        <StatusBadge tone="online">System online</StatusBadge>
        <StatusBadge tone="local" icon="lock">
          Local
        </StatusBadge>
      </div>
    </header>
  )
}
