import { THEME_STORAGE_KEY, type ThemeMode } from './palette'

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', theme)
}

/** İlk paint öncesi tema uygula — flash önlenir */
export function initTheme(): ThemeMode {
  const theme = getStoredTheme()
  applyTheme(theme)
  return theme
}
