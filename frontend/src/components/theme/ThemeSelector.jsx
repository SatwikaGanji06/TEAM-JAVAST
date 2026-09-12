import { useTheme } from '../../theme/ThemeProvider.jsx'

const OPTIONS = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
]

export default function ThemeSelector({ size = 'md' }) {
  const { theme, setTheme } = useTheme()
  const compact = size === 'sm'

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex rounded-sm border border-line bg-app ${
        compact ? 'p-0.5' : 'p-0.5'
      }`}
    >
      {OPTIONS.map((option) => {
        const selected = theme === option.id

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(option.id)}
            className={`rounded-sm font-medium tracking-[0.12em] uppercase transition-colors ${
              compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
            } ${
              selected
                ? 'bg-elevated text-ink'
                : 'text-muted hover:bg-hover hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
