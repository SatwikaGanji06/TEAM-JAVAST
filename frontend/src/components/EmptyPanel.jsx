export default function EmptyPanel({ title, children }) {
  return (
    <div className="rounded-sm border border-dashed border-line-strong bg-panel px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {children ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{children}</p> : null}
    </div>
  )
}
