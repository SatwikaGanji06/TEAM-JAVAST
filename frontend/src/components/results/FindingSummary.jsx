const COUNT_STYLES = {
  'Total findings': 'text-ink',
  High: 'text-danger',
  Medium: 'text-warning',
  Low: 'text-ink-secondary',
}

export default function FindingSummary({ counts }) {
  const items = [
    { label: 'Total findings', value: counts.total },
    { label: 'High', value: counts.high },
    { label: 'Medium', value: counts.medium },
    { label: 'Low', value: counts.low },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-sm border border-line bg-panel px-4 py-3"
        >
          <p className="text-[11px] tracking-[0.14em] text-muted uppercase">
            {item.label}
          </p>
          <p className={`mt-1 text-lg ${COUNT_STYLES[item.label] ?? 'text-ink'}`}>
            {item.value}
          </p>
        </article>
      ))}
    </div>
  )
}
