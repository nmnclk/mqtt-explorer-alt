import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { en } from './locales/en'
import { tr } from './locales/tr'
import { LOCALE_STORAGE_KEY, type Locale, type Messages } from './types'

const catalogs: Record<Locale, Messages> = { en, tr }

function detectLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'en' || stored === 'tr') return stored
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

export function initLocale(): Locale {
  const locale = detectLocale()
  document.documentElement.lang = locale
  return locale
}

interface I18nContextValue {
  locale: Locale
  t: Messages
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  numberLocale: string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: catalogs[locale],
      setLocale: setLocaleState,
      toggleLocale: () => setLocaleState((l) => (l === 'tr' ? 'en' : 'tr')),
      numberLocale: locale === 'tr' ? 'tr-TR' : 'en-US'
    }),
    [locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
