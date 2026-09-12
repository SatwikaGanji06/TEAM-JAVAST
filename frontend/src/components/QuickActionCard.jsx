function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        fill="currentColor"
        d="M7.25 2.75h1.5v4.5h4.5v1.5h-4.5v4.5h-1.5v-4.5h-4.5v-1.5h4.5z"
      />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        fill="currentColor"
        d="M4.5 1.75h5.19L12.5 4.56v9.69A.75.75 0 0 1 11.75 15h-7.5a.75.75 0 0 1-.75-.75v-11.5c0-.41.34-.75.75-.75Zm4.75 1.06V5h2.06L9.25 2.81Z"
      />
    </svg>
  )
}

const ICONS = {
  plus: PlusIcon,
  document: DocumentIcon,
}

export default function QuickActionCard({ action, onSelect }) {
  const Icon = ICONS[action.icon] ?? PlusIcon

  return (
    <button
      type="button"
      onClick={() => onSelect(action.id)}
      className="flex w-full items-start gap-3 rounded-sm border border-white/10 bg-[#10131a] px-4 py-3.5 text-left transition-colors hover:border-white/20 hover:bg-white/5"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-white/10 text-slate-300">
        <Icon />
      </span>
      <span>
        <span className="block text-sm text-slate-100">{action.title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">
          {action.description}
        </span>
      </span>
    </button>
  )
}
