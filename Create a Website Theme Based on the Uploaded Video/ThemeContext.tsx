import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
export type Theme = 'light' | 'water' | 'dark'
type ThemeValue = { theme: Theme; setTheme: (theme: Theme) => void; cycleTheme: () => void }
const ThemeContext = createContext<ThemeValue | undefined>(undefined)
const key = 'jal-impact-theme'
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(key) as Theme) || 'water')
  useEffect(() => { localStorage.setItem(key, theme); document.documentElement.dataset.theme = theme }, [theme])
  const cycleTheme = () => setTheme(current => current === 'light' ? 'water' : current === 'water' ? 'dark' : 'light')
  return <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>{children}</ThemeContext.Provider>
}
export function useTheme() { const value = useContext(ThemeContext); if (!value) throw new Error('useTheme must be used within ThemeProvider'); return value }
