import ThemeSelector from '../components/theme/ThemeSelector.jsx'
import { DEMO_PROFILE } from '../data/profileData.js'

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm text-ink">{children}</div>
    </div>
  )
}

export default function Profile() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-8">
      <header>
        <h2 className="text-lg font-medium tracking-tight text-ink">User profile</h2>
        <p className="mt-1 text-sm text-muted">
          Mock workbench identity for frontend demonstration only.
        </p>
      </header>

      <section className="rounded-sm border border-line bg-panel px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-line bg-elevated text-sm font-semibold text-ink">
              {DEMO_PROFILE.initials}
            </span>
            <div>
              <p className="text-base text-ink">{DEMO_PROFILE.name}</p>
              <p className="mt-0.5 text-sm text-ink-secondary">{DEMO_PROFILE.role}</p>
            </div>
          </div>
          <p className="text-[10px] tracking-[0.16em] text-muted uppercase">
            {DEMO_PROFILE.label}
          </p>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <Field label="Department">{DEMO_PROFILE.department}</Field>
          <Field label="Role">{DEMO_PROFILE.role}</Field>
        </dl>
      </section>

      <section className="rounded-sm border border-line bg-panel px-5 py-5">
        <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Workbench access
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <Field label="Access">{DEMO_PROFILE.access}</Field>
          <Field label="Status">
            <span className="inline-flex items-center gap-1.5 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Active
            </span>
          </Field>
          <Field label="Session">{DEMO_PROFILE.session}</Field>
        </div>
      </section>

      <section className="rounded-sm border border-line bg-panel px-5 py-5">
        <h3 className="text-[11px] font-semibold tracking-[0.22em] text-muted uppercase">
          Preferences
        </h3>
        <div className="mt-3 flex items-center justify-between gap-4">
          <Field label="Theme">
            <span className="text-ink-secondary">Appearance only</span>
          </Field>
          <ThemeSelector />
        </div>
      </section>
    </div>
  )
}
