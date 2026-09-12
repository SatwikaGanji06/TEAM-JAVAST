export default function ActivityLog({ events }) {
  const latestId = events[events.length - 1]?.id

  return (
    <section className="flex min-h-[28rem] flex-col rounded-sm border border-line bg-panel">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Live activity
        </h2>
      </div>

      <ol className="flex-1 space-y-0 overflow-y-auto px-4 py-2">
        {events.map((event) => {
          const isLatest = event.id === latestId

          return (
            <li
              key={event.id}
              className={`border-l py-2.5 pl-3 ${
                isLatest ? 'border-accent/70' : 'border-line'
              }`}
            >
              <p
                className={`font-mono text-[11px] ${
                  isLatest ? 'text-accent' : 'text-muted'
                }`}
              >
                {event.time}
              </p>
              <p
                className={`mt-0.5 text-sm ${
                  isLatest ? 'text-ink' : 'text-ink-secondary'
                }`}
              >
                {event.message}
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
