export default function Sovereignty() {
  const localItems = [
    'Uploaded documents and file contents',
    'Vector embeddings and knowledge base',
    'Agent planning and tool execution',
    'Local model inference',
    'Generated responses and documents',
    'Run history and audit records',
  ]

  const boundaryItems = [
    'Cloud AI providers are not configured',
    'Documents are processed by the local backend',
    'Model inference uses the local Ollama runtime',
    'Outbound access is restricted by application policy',
  ]

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            System
          </p>

          <h1 className="mt-2 text-2xl font-medium tracking-tight text-ink">
            Sovereignty
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            How LOKAI keeps sensitive document analysis within your local
            infrastructure.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded border border-line bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-success sm:flex">
          <span className="h-2 w-2 rounded-full bg-success" />
          Local processing
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Processing
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
              Local
            </span>
          </div>

          <h2 className="mt-3 text-base font-medium text-ink">
            Local execution
          </h2>

          <p className="mt-2 text-sm leading-5 text-muted">
            Uploads, analysis requests, retrieval and agent execution run
            through the local LOKAI backend.
          </p>
        </div>

        <div className="rounded border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Models
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
              Local
            </span>
          </div>

          <h2 className="mt-3 text-base font-medium text-ink">
            Qwen via Ollama
          </h2>

          <p className="mt-2 text-sm leading-5 text-muted">
            Retrieval uses the configured local embedding model and answers
            use the configured Qwen language model through Ollama.
          </p>
        </div>

        <div className="rounded border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Storage
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
              Local
            </span>
          </div>

          <h2 className="mt-3 text-base font-medium text-ink">
            Data stays in-system
          </h2>

          <p className="mt-2 text-sm leading-5 text-muted">
            Documents, vector data, run records, generated files and audit
            records are handled by the local application stack.
          </p>
        </div>

        <div className="rounded border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Network
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
              Restricted
            </span>
          </div>

          <h2 className="mt-3 text-base font-medium text-ink">
            Controlled access
          </h2>

          <p className="mt-2 text-sm leading-5 text-muted">
            The backend is designed to allow model calls only to approved
            local hosts. This describes the configured policy, not a live
            network scan.
          </p>
        </div>
      </div>

      <section className="mt-5 rounded border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Local data flow
          </p>

          <h2 className="mt-2 text-base font-medium text-ink">
            How sensitive work moves through LOKAI
          </h2>

          <p className="mt-1 text-sm text-muted">
            The application keeps the processing path within the configured
            local environment.
          </p>
        </div>

        <div className="grid items-center gap-3 p-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <div className="rounded border border-line bg-app px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              01
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              User input
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Questions, documents and analysis requests
            </p>
          </div>

          <span className="hidden text-lg text-muted md:block">→</span>

          <div className="rounded border border-line bg-app px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              02
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              LOKAI agent
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Plans tasks and invokes approved local tools
            </p>
          </div>

          <span className="hidden text-lg text-muted md:block">→</span>

          <div className="rounded border border-line bg-app px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              03
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              Local model
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Qwen inference through the local Ollama runtime
            </p>
          </div>

          <span className="hidden text-lg text-muted md:block">→</span>

          <div className="rounded border border-line bg-app px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              04
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              Result
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Analysis, evidence and generated documents
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            What stays local
          </p>

          <h2 className="mt-2 text-base font-medium text-ink">
            Sensitive processing
          </h2>

          <div className="mt-4 space-y-2.5">
            {localItems.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-0.5 text-sm font-semibold text-success">
                  ✓
                </span>
                <p className="text-sm leading-5 text-muted">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Network boundary
          </p>

          <h2 className="mt-2 text-base font-medium text-ink">
            Controlled external access
          </h2>

          <div className="mt-4 space-y-2.5">
            {boundaryItems.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-0.5 text-sm font-semibold text-success">
                  ✓
                </span>
                <p className="text-sm leading-5 text-muted">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs leading-5 text-muted">
              Sovereignty here refers to the application architecture and
              configured local execution path. It is not a claim of
              OS-level isolation or a live network security assessment.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-5 flex flex-col justify-between gap-3 rounded border border-line bg-white px-5 py-3.5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-ink">
            Built for sensitive industrial work
          </p>
          <p className="mt-1 text-xs text-muted">
            Keep documents, models and AI-assisted workflows within your
            controlled infrastructure.
          </p>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Your data · Your infrastructure · Your control
        </p>
      </div>
    </div>
  )
}

