import StatusBadge from './StatusBadge.jsx'

export default function StatusCard({ item }) {
  const isLocal = item.tone === 'local'
  const isOnline = item.tone === 'online'

  return (
    <article className="rounded-sm border border-line bg-panel px-4 py-3.5">
      {isOnline || isLocal ? (
        <StatusBadge tone={isLocal ? 'local' : 'online'} icon={isLocal ? 'lock' : 'dot'}>
          {item.label}
        </StatusBadge>
      ) : (
        <p className="text-xs font-medium tracking-[0.12em] text-ink uppercase">
          {item.label}
        </p>
      )}
      <p className="mt-2 text-xs text-muted">{item.detail}</p>
    </article>
  )
}
