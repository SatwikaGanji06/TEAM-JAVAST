import PageHeader from '../components/PageHeader.jsx'
import { KNOWLEDGE_BASE_SECTIONS } from '../data/knowledgeBaseData.js'

export default function KnowledgeBase() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Knowledge Base"
        subtitle="A future management surface for standing reference material. This is not the indexed document store."
      />

      <p className="mb-6 rounded-sm border border-line bg-panel px-4 py-3 text-sm text-ink-secondary">
        Uploaded PDF and TXT files are indexed by the working RAG pipeline.
        Agent Chat can query that corpus. This page is layout only; it does not
        list or manage those indexed documents.
      </p>

      <div className="space-y-8">
        {KNOWLEDGE_BASE_SECTIONS.map((section) => (
          <section key={section.id}>
            <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
              {section.title}
            </h3>
            <p className="mt-1 text-xs text-ink-secondary">{section.description}</p>
            <ul className="mt-3 space-y-3">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-sm border border-line bg-panel px-4 py-3"
                >
                  <p className="text-sm text-ink">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{item.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
