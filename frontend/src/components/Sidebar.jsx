import { NAV_SECTIONS } from '../navigation.js'
import StatusBadge from './StatusBadge.jsx'

export default function Sidebar({ activeId, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[264px] flex-col border-r border-white/10 bg-[#10131a]">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400 uppercase">
          Sovereign
        </p>
        <p className="mt-1 text-sm font-semibold tracking-[0.16em] text-slate-100 uppercase">
          AI Workbench
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <section key={section.id} className="mb-5 last:mb-0">
            <h2 className="px-2 pb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
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
                          ? 'border-sky-400/80 bg-white/5 text-slate-50'
                          : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
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

      <div className="border-t border-white/10 px-5 py-4">
        <StatusBadge tone="local" icon="lock">
          Local processing
        </StatusBadge>
        <p className="mt-2 text-xs text-slate-400">System Online</p>
      </div>
    </aside>
  )
}
