import UserProfileMenu from './profile/UserProfileMenu.jsx'
import { WORKBENCH_STATUS } from '../data/systemData.js'

export default function TopBar({ title, onNavigate }) {
  const showTitle = title && title !== 'Home'

  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-surface px-4 py-2 md:px-6">
      {showTitle ? (
        <h1 className="font-mono text-[11px] font-medium tracking-[0.16em] text-ink-secondary uppercase">
          {title}
        </h1>
      ) : (
        <h1 className="sr-only">Home</h1>
      )}

      <div
        className={`flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 ${
          showTitle ? 'ml-auto' : 'w-full justify-between sm:justify-end'
        }`}
      >
        <ul className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          {WORKBENCH_STATUS.map((item) => (
            <li
              key={item.id}
              className="font-mono text-[10px] leading-4 tracking-[0.1em] whitespace-nowrap text-ink-secondary uppercase"
            >
              <span>{item.label}</span>
              {item.value ? (
                <>
                  <span className="mx-1 text-line-strong">:</span>
                  <span
                    className={
                      item.id === 'system' ? 'text-success' : 'text-ink'
                    }
                  >
                    {item.value}
                  </span>
                </>
              ) : null}
            </li>
          ))}
        </ul>
        <UserProfileMenu onNavigate={onNavigate} />
      </div>
    </header>
  )
}
