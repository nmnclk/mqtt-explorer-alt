import type { ThemeMode } from '../theme/palette'

interface Props {
  theme: ThemeMode
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props): JSX.Element {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-xs text-fg-muted hover:text-fg px-2 py-1 rounded border border-transparent hover:border-bg-border transition-colors"
      title={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
    >
      {isDark ? '☀' : '☾'}
    </button>
  )
}
