import { ThemeToggle } from './ThemeToggle'
import { LocaleToggle } from './LocaleToggle'
import { useI18n } from '../i18n/I18nContext'
import type { ThemeMode } from '../theme/palette'
import type { ConnectionState } from '../types/mqtt'

interface Props {
  connectionState: ConnectionState
  connectionError?: string
  connectionLabel?: string
  appVersion?: string
  theme: ThemeMode
  onToggleTheme: () => void
  onToggleLocale: () => void
  onOpenConnections: () => void
  onDisconnect: () => Promise<void>
  onCheckUpdates?: () => void
}

export function ConnectionBar({
  connectionState,
  connectionError,
  connectionLabel,
  appVersion,
  theme,
  onToggleTheme,
  onToggleLocale,
  onOpenConnections,
  onDisconnect,
  onCheckUpdates
}: Props): JSX.Element {
  const { t, locale } = useI18n()

  const statusMeta: Record<ConnectionState, { label: string; color: string }> = {
    idle: { label: t.connection.statusIdle, color: 'bg-state-idle' },
    disconnected: { label: t.connection.statusIdle, color: 'bg-state-idle' },
    connecting: { label: t.connection.statusConnecting, color: 'bg-state-connecting animate-pulse' },
    connected: { label: t.connection.statusConnected, color: 'bg-state-connected' },
    error: { label: t.connection.statusError, color: 'bg-state-error' }
  }
  const status = statusMeta[connectionState]
  const isConnected = connectionState === 'connected' || connectionState === 'connecting'

  return (
    <header className="h-12 shrink-0 border-b border-bg-border bg-bg-panel px-4 flex items-center gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-sm text-fg whitespace-nowrap tracking-tight">
          MQTT Explorer Alt
        </span>
        {appVersion && (
          <span className="text-[10px] text-fg-subtle tabular-nums">v{appVersion}</span>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${status.color}`} />
        <span className="text-xs text-fg-muted truncate" title={connectionError}>
          {status.label}
          {connectionError ? ` — ${connectionError}` : ''}
        </span>
        {connectionLabel && (
          <>
            <span className="text-fg-subtle">·</span>
            <span className="text-xs text-fg-muted truncate">{connectionLabel}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <LocaleToggle locale={locale} onToggle={onToggleLocale} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        {onCheckUpdates && (
          <button
            type="button"
            onClick={onCheckUpdates}
            className="text-xs text-fg-muted hover:text-fg px-2 py-1 transition-colors"
            title={t.connection.checkUpdates}
          >
            {t.connection.updates}
          </button>
        )}
        <button
          type="button"
          onClick={onOpenConnections}
          className="text-xs bg-bg-raised hover:bg-bg-border border border-bg-border px-3 py-1.5 rounded transition-colors"
        >
          {t.connection.connections}
        </button>
        {isConnected ? (
          <button
            type="button"
            onClick={() => void onDisconnect()}
            className="text-xs bg-bg-raised hover:bg-state-error/20 border border-bg-border hover:border-state-error/40 px-3 py-1.5 rounded font-medium transition-colors"
          >
            {t.connection.disconnect}
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenConnections}
            className="text-xs bg-accent hover:bg-accent-hover text-bg-base px-3 py-1.5 rounded font-medium transition-colors"
          >
            {t.connection.connect}
          </button>
        )}
      </div>
    </header>
  )
}
