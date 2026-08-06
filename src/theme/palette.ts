/** MQTT Explorer Alt — Signal paleti */

export type ThemeMode = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'mqtt-explorer-theme'

export const palette = {
  dark: {
    label: 'Koyu',
    bgBase: '#0f1219',
    bgPanel: '#161b26',
    bgRaised: '#1e2533',
    border: '#2d3648',
    fg: '#e6e9ef',
    fgMuted: '#8993a4',
    fgSubtle: '#5a6478',
    accent: '#2dd4bf',
    accentHover: '#14b8a6',
    accentMuted: '#0f3d38',
    stateConnected: '#34d399',
    stateConnecting: '#fbbf24',
    stateError: '#f87171',
    stateIdle: '#6b7280'
  },
  light: {
    label: 'Açık',
    bgBase: '#f0ede6',
    bgPanel: '#faf9f6',
    bgRaised: '#e8e4db',
    border: '#cfc9bc',
    fg: '#1a1f2e',
    fgMuted: '#5c6578',
    fgSubtle: '#8a929e',
    accent: '#0d9488',
    accentHover: '#0f766e',
    accentMuted: '#ccfbf1',
    stateConnected: '#059669',
    stateConnecting: '#d97706',
    stateError: '#dc2626',
    stateIdle: '#9ca3af'
  }
} as const
