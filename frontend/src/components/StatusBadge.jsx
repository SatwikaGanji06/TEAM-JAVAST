const TONES = {
  online: {
    dot: 'bg-success',
    text: 'text-success',
  },
  local: {
    dot: 'bg-accent',
    text: 'text-ink',
  },
  processing: {
    dot: 'bg-accent agent-running-dot',
    text: 'text-accent',
  },
  failed: {
    dot: 'bg-danger',
    text: 'text-danger',
  },
  cancelled: {
    dot: 'bg-muted',
    text: 'text-muted',
  },
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-3 w-3 text-system"
    >
      <path
        fill="currentColor"
        d="M8 1.5A3.5 3.5 0 0 0 4.5 5v1.25H4A1.5 1.5 0 0 0 2.5 7.75v5A1.5 1.5 0 0 0 4 14.25h8a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12 6.25h-.5V5A3.5 3.5 0 0 0 8 1.5Zm2 4.75H6V5a2 2 0 1 1 4 0v1.25Z"
      />
    </svg>
  )
}

export default function StatusBadge({
  tone = 'online',
  icon = 'dot',
  children,
}) {
  const styles = TONES[tone] ?? TONES.online

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase ${styles.text}`}
    >
      {icon === 'lock' ? (
        <LockIcon />
      ) : (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
