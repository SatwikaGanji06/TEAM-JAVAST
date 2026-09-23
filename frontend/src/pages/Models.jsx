export default function Models() {
  const models = [
    {
      name: 'qwen3:4b',
      type: 'Language model',
      description:
        'Turns retrieved document context into analysis answers and supports local agent reasoning.',
    },
    {
      name: 'qwen3-embedding:0.6b',
      type: 'Embedding model',
      description:
        'Converts documents and search queries into vectors for local knowledge retrieval.',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <div className="mb-7 flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            System
          </p>

          <h1 className="mt-2 text-2xl font-medium tracking-tight text-ink">
            Models
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-5 text-muted">
            Local AI models configured for LOKAI's analysis and document
            retrieval workflows.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded border border-line bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-success sm:flex">
          <span className="h-2 w-2 rounded-full bg-success" />
          Local AI stack
        </div>
      </div>

      <section className="rounded border border-line bg-white">
        <div className="flex items-start justify-between gap-5 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Runtime
            </p>

            <h2 className="mt-2 text-base font-medium text-ink">
              Ollama
            </h2>

            <p className="mt-1 text-sm leading-5 text-muted">
              Local model runtime used by the LOKAI backend. The browser
              communicates with the local application backend rather than
              directly with the model runtime.
            </p>
          </div>

          <span className="shrink-0 rounded border border-line px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
            Configured
          </span>
        </div>
      </section>

      <div className="mt-7 mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Configured models
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {models.map((model) => (
          <section
            key={model.name}
            className="rounded border border-line bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-mono text-sm font-medium text-ink">
                  {model.name}
                </h2>

                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  {model.type} · Ollama
                </p>
              </div>

              <span className="flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                Configured
              </span>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-5 text-muted">
              {model.description}
            </p>

            <div className="mt-5 border-t border-line pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Execution
              </p>

              <p className="mt-1 text-xs text-ink">
                Local inference · No cloud model dependency
              </p>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-5 rounded border border-line bg-white px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Local execution path
            </p>

            <p className="mt-1 text-sm text-ink">
              Browser → LOKAI backend → Ollama → Local model
            </p>
          </div>

          <p className="text-xs text-muted">
            This page describes the configured stack; it does not probe model
            availability.
          </p>
        </div>
      </section>
    </div>
  )
}
