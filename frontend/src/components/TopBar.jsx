import StatusBadge from './StatusBadge.jsx'
import UserProfileMenu from './profile/UserProfileMenu.jsx'

export default function TopBar({ title, onNavigate }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-6">
      <h1 className="text-sm font-medium tracking-wide text-ink">{title}</h1>

      <div className="flex items-center gap-5">
        <StatusBadge tone="online">System online</StatusBadge>
        <StatusBadge tone="local" icon="lock">
          Local
        </StatusBadge>
        <UserProfileMenu onNavigate={onNavigate} />
      </div>
    </header>
  )
}
