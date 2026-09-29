import { createContext, ReactNode, useContext, useEffect } from 'react'

export type Theme = 'light' | 'water' | 'dark'
type ThemeValue = { theme: Theme; setTheme: (theme: Theme) => void; cycleTheme: () => void }
const ThemeContext = createContext<ThemeValue | undefined>(undefined)
const key = 'jal-impact-theme-v2'

function applyDarkTheme() {
  document.documentElement.dataset.theme = 'dark'
  document.documentElement.style.colorScheme = 'dark'
  try {
    window.localStorage.setItem(key, 'dark')
  } catch {
    // Dark mode remains active even when browser storage is unavailable.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => { applyDarkTheme() }, [])
  const setTheme = (_theme: Theme) => applyDarkTheme()
  const cycleTheme = () => applyDarkTheme()

  return <ThemeContext.Provider value={{ theme: 'dark', setTheme, cycleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used within ThemeProvider')
  return value
}
