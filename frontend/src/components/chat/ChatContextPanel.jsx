export default function ChatContextPanel({ attachment }) {
  return (
    <aside className="h-full overflow-y-auto rounded-sm border border-line bg-panel px-4 py-4">
      <h2 className="text-[11px] font-semibold tracking-[0.18em] text-ink-secondary uppercase">
        This conversation
      </h2>

      <div className="mt-4">
        <p className="text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
          Document
        </p>
        {attachment ? (
          <p className="mt-1 break-all text-sm text-ink">{attachment.name}</p>
        ) : (
          <p className="mt-1 text-sm text-ink-secondary">
            No file attached. Use Attach in the composer, or open Documents from
            the sidebar.
          </p>
        )}
      </div>

      <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
        <div>
          <dt className="text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
            Knowledge Base
          </dt>
          <dd className="mt-1 text-sm leading-6 text-ink-secondary">
            Persistent reference material the agent can use later. It is not the
            same as your working files.
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
            Runs
          </dt>
          <dd className="mt-1 text-sm leading-6 text-ink-secondary">
            When the agent finishes a task, that work can be reviewed under Runs.
          </dd>
        </div>
      </dl>
    </aside>
  )
}
