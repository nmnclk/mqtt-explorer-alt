import type { ConnectionState } from '../types/mqtt'

interface Props {
  connectionState: ConnectionState
  connectionError?: string
  connectionLabel?: string
  appVersion?: string
  onOpenConnections: () => void
  onDisconnect: () => Promise<void>
  onCheckUpdates?: () => void
}

export function ConnectionBar({
  connectionState,
  connectionError,
  connectionLabel,
  appVersion,
  onOpenConnections,
  onDisconnect,
  onCheckUpdates
}: Props): JSX.Element {
  const statusMeta: Record<ConnectionState, { label: string; color: string }> = {
    idle: { label: 'Disconnected', color: 'bg-state-idle' },
    disconnected: { label: 'Disconnected', color: 'bg-state-idle' },
    connecting: { label: 'Connecting…', color: 'bg-state-connecting animate-pulse' },
    connected: { label: 'Connected', color: 'bg-state-connected' },
    error: { label: 'Error', color: 'bg-state-error' }
  }
  const status = statusMeta[connectionState]
  const isConnected = connectionState === 'connected' || connectionState === 'connecting'

  return (
    <header className="h-12 shrink-0 border-b border-bg-border bg-bg-panel px-4 flex items-center gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-sm text-gray-100 whitespace-nowrap">MQTT Explorer Alt</span>
        {appVersion && (
          <span className="text-[10px] text-gray-500 tabular-nums">v{appVersion}</span>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${status.color}`} />
        <span className="text-xs text-gray-400 truncate" title={connectionError}>
          {status.label}
          {connectionError ? ` — ${connectionError}` : ''}
        </span>
        {connectionLabel && (
          <>
            <span className="text-gray-600">·</span>
            <span className="text-xs text-gray-300 truncate">{connectionLabel}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onCheckUpdates && (
          <button
            type="button"
            onClick={onCheckUpdates}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
            title="Check for updates"
          >
            Updates
          </button>
        )}
        <button
          type="button"
          onClick={onOpenConnections}
          className="text-xs bg-bg-raised hover:bg-bg-border border border-bg-border px-3 py-1.5 rounded"
        >
          Connections
        </button>
        {isConnected ? (
          <button
            type="button"
            onClick={() => void onDisconnect()}
            className="text-xs bg-bg-raised hover:bg-red-900/40 border border-bg-border px-3 py-1.5 rounded font-medium"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenConnections}
            className="text-xs bg-accent hover:bg-accent/80 px-3 py-1.5 rounded font-medium"
          >
            Connect
          </button>
        )}
      </div>
    </header>
  )
}
