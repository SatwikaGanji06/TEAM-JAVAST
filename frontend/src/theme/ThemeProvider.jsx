import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const THEME_STORAGE_KEY = 'sovereign-workbench-theme'

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
})

export function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage may be unavailable
  }
  return 'dark'
}

export function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  document.documentElement.style.colorScheme = next
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStoredTheme())

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // localStorage may be unavailable
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next) => {
        setThemeState(next === 'light' ? 'light' : 'dark')
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
