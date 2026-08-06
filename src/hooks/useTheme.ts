import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme } from '../theme/initTheme'
import { THEME_STORAGE_KEY, type ThemeMode } from '../theme/palette'

export function useTheme(): {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
} {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }
}
