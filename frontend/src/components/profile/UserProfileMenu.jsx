import { useEffect, useId, useRef, useState } from 'react'
import ThemeSelector from '../theme/ThemeSelector.jsx'
import { DEMO_PROFILE } from '../../data/profileData.js'

export default function UserProfileMenu({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const rootRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return undefined

    function handlePointer(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function goToProfile() {
    setOpen(false)
    setNotice('')
    onNavigate?.('profile')
  }

  function handleSignOut() {
    setNotice('Demo profile only — no session to close.')
    window.setTimeout(() => setOpen(false), 900)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setNotice('')
          setOpen((current) => !current)
        }}
        className="flex items-center gap-2 rounded-sm border border-transparent px-1.5 py-1 transition-colors hover:border-line hover:bg-hover"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-sm border border-line bg-elevated text-[10px] font-semibold tracking-wide text-ink">
          {DEMO_PROFILE.initials}
        </span>
        <span className="hidden text-xs text-ink sm:inline">{DEMO_PROFILE.name}</span>
        <span className="text-[10px] text-muted" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-30 w-64 rounded-sm border border-line bg-panel p-3 shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
        >
          <div className="border-b border-line pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-elevated text-xs font-semibold text-ink">
                {DEMO_PROFILE.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{DEMO_PROFILE.name}</p>
                <p className="text-xs text-ink-secondary">{DEMO_PROFILE.role}</p>
              </div>
            </div>
            <p className="mt-2 text-[10px] tracking-[0.16em] text-muted uppercase">
              {DEMO_PROFILE.label}
            </p>
          </div>

          <div className="space-y-1 border-b border-line py-2">
            <button
              type="button"
              role="menuitem"
              onClick={goToProfile}
              className="w-full rounded-sm px-2 py-1.5 text-left text-[11px] font-medium tracking-[0.16em] text-ink-secondary uppercase transition-colors hover:bg-hover hover:text-ink"
            >
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={goToProfile}
              className="w-full rounded-sm px-2 py-1.5 text-left text-[11px] font-medium tracking-[0.16em] text-ink-secondary uppercase transition-colors hover:bg-hover hover:text-ink"
            >
              Preferences
            </button>
            <div className="px-2 pt-2 pb-1">
              <p className="mb-1.5 text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
                Theme
              </p>
              <ThemeSelector size="sm" />
            </div>
          </div>

          <div className="border-b border-line py-3">
            <p className="text-[10px] tracking-[0.16em] text-muted uppercase">
              Local session
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] text-success uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              {DEMO_PROFILE.status}
            </p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="mt-2 w-full rounded-sm px-2 py-1.5 text-left text-[11px] font-medium tracking-[0.16em] text-ink-secondary uppercase transition-colors hover:bg-hover hover:text-ink"
          >
            Sign out
          </button>

          {notice ? (
            <p className="mt-2 text-[11px] text-muted" role="status">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
