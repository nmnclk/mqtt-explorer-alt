import { useI18n } from '../i18n/I18nContext'
import type { Locale } from '../i18n/types'

interface Props {
  locale: Locale
  onToggle: () => void
}

export function LocaleToggle({ locale, onToggle }: Props): JSX.Element {
  const { t } = useI18n()
  const nextLabel = locale === 'tr' ? 'EN' : 'TR'
  const title = locale === 'tr' ? t.locale.switchToEn : t.locale.switchToTr

  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-xs text-fg-muted hover:text-fg px-2 py-1 rounded border border-transparent hover:border-bg-border font-medium tabular-nums"
      title={title}
      aria-label={title}
    >
      {nextLabel}
    </button>
  )
}
