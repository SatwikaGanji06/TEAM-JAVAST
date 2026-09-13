export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-medium tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </header>
  )
}
