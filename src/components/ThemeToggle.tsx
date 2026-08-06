import { useI18n } from '../i18n/I18nContext'
import type { ThemeMode } from '../theme/palette'

interface Props {
  theme: ThemeMode
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props): JSX.Element {
  const { t } = useI18n()
  const isDark = theme === 'dark'
  const label = isDark ? t.theme.switchToLight : t.theme.switchToDark

  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-xs text-fg-muted hover:text-fg px-2 py-1 rounded border border-transparent hover:border-bg-border transition-colors"
      title={label}
      aria-label={label}
    >
      {isDark ? '☀' : '☾'}
    </button>
  )
}
