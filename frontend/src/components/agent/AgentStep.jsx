function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3">
      <path
        fill="currentColor"
        d="M6.4 11.2 3.6 8.4l.9-.9 1.9 1.9 5.1-5.1.9.9-6 6Z"
      />
    </svg>
  )
}

function statusClasses(status) {
  if (status === 'completed') {
    return {
      marker: 'border-success/70 bg-success/15 text-success',
      title: 'text-ink',
      description: 'text-muted',
      badge: 'text-success',
    }
  }

  if (status === 'running') {
    return {
      marker: 'border-accent/80 bg-accent/10 text-accent',
      title: 'text-ink',
      description: 'text-ink-secondary',
      badge: 'text-accent',
    }
  }

  return {
    marker: 'border-line-strong bg-app text-muted',
    title: 'text-muted',
    description: 'text-muted',
    badge: 'text-muted',
  }
}

export default function AgentStep({ step, status, isLast }) {
  const styles = statusClasses(status)

  return (
    <li className="flex gap-3">
      <div className="flex w-5 flex-col items-center">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${styles.marker}`}
        >
          {status === 'completed' ? (
            <CheckIcon />
          ) : (
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === 'running'
                  ? 'bg-accent agent-running-dot'
                  : 'bg-muted'
              }`}
            />
          )}
        </span>
        {isLast ? null : <span className="mt-1 w-px flex-1 bg-line" />}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm ${styles.title}`}>{step.title}</p>
          <span
            className={`shrink-0 text-[10px] font-medium tracking-[0.16em] uppercase ${styles.badge}`}
          >
            {status}
          </span>
        </div>
        <p className={`mt-1 text-xs leading-5 ${styles.description}`}>
          {step.description}
        </p>
      </div>
    </li>
  )
}
