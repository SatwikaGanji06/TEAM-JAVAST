import { NAV_SECTIONS } from '../navigation.js'

export default function Sidebar({ activeId, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[264px] flex-col border-r border-line bg-panel">
      <div className="px-5 py-5">
        <p className="font-mono text-[10px] font-medium tracking-[0.22em] text-ink-secondary uppercase">
          MRPL
        </p>
        <p className="mt-1 text-[15px] leading-snug font-semibold tracking-tight text-ink">
          Operations Workbench
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <section key={section.id} className="mb-5 last:mb-0">
            <h2 className="font-mono px-2 pb-2 text-[10px] font-medium tracking-[0.18em] text-ink-secondary uppercase">
              {section.label}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.id === activeId

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => onNavigate(item.id)}
                      className={`flex w-full items-center rounded-sm border-l-2 px-3 py-1.5 text-left text-[13px] transition-colors ${
                        isActive
                          ? 'border-accent bg-hover font-medium text-ink'
                          : 'border-transparent text-ink-secondary hover:bg-hover hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}
