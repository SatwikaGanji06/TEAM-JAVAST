import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { API_BASE_URL, fetchOpenApiPaths } from '../api/ragApi.js'

export default function Home({ onNavigate }) {
  const [paths, setPaths] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const nextPaths = await fetchOpenApiPaths()
        if (!cancelled) {
          setPaths(nextPaths)
        }
      } catch (loadError) {
        if (!cancelled) {
          setPaths([])
          setError(
            loadError instanceof Error && loadError.message.trim()
              ? loadError.message
              : 'Unable to reach the local AI backend.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PageHeader
        title="Home"
        subtitle="Operational overview of the local backend. This page does not run analysis."
      >
        <button
          type="button"
          onClick={() => onNavigate?.('analysis')}
          className="rounded-sm bg-sky-500/90 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-slate-950 uppercase transition-colors hover:bg-sky-400"
        >
          Start New Analysis
        </button>
      </PageHeader>

      <section className="rounded-sm border border-line bg-panel px-4 py-4">
        <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Backend
        </h3>
        <p className="mt-2 text-sm text-ink">{API_BASE_URL}</p>
        <p className="mt-1 text-xs text-muted">
          Configured frontend origin. Status below is from GET /openapi.json.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-ink-secondary">Checking backend…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-warning">{error}</p>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-ink">Backend responded.</p>
            {paths.length === 0 ? (
              <p className="mt-1 text-xs text-muted">
                The OpenAPI document did not list any paths.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {paths.map((path) => (
                  <li key={path} className="text-sm text-ink-secondary">
                    {path}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <p className="mt-6 text-sm leading-6 text-ink-secondary">
        Document counts, run history, and findings are not shown here because
        the backend does not expose those APIs.
      </p>
    </div>
  )
}
