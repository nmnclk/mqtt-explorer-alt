import { useI18n } from '../i18n/I18nContext'
import type { UpdateInfo, UpdatePhase, UpdateProgress } from '../types/update'

interface Props {
  info: UpdateInfo
  currentVersion: string
  phase: UpdatePhase
  progress: UpdateProgress | null
  errorMessage?: string
  onDismiss: () => void
  onStartDownload: () => void
  onInstall: () => void
  onManualDownload: () => void
}

export function UpdateDialog({
  info,
  currentVersion,
  phase,
  progress,
  errorMessage,
  onDismiss,
  onStartDownload,
  onInstall,
  onManualDownload
}: Props): JSX.Element {
  const { t } = useI18n()
  const ud = t.updateDialog
  const canAuto = info.autoInstallSupported
  const isBusy = phase === 'downloading'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-bg-panel border border-bg-border rounded-lg shadow-xl w-full max-w-md p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-fg">{ud.title}</h2>
          <p className="text-sm text-fg-muted mt-1">{ud.version(info.version, currentVersion)}</p>
        </div>

        {phase === 'ready' ? (
          <p className="text-sm text-state-connected">{ud.readyToInstall}</p>
        ) : phase === 'error' ? (
          <p className="text-sm text-state-error">{errorMessage ?? ud.downloadFailed}</p>
        ) : phase === 'downloading' ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-fg-muted">{ud.downloading}</p>
            <div className="h-2 rounded-full bg-bg-raised overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-200"
                style={{ width: `${Math.min(progress?.percent ?? 0, 100)}%` }}
              />
            </div>
            <p className="text-xs text-fg-subtle tabular-nums">
              {ud.downloadProgress(progress?.percent ?? 0)}
            </p>
          </div>
        ) : (
          <p className="text-xs text-fg-subtle leading-relaxed">
            {canAuto ? ud.instructionsAuto : ud.instructionsManual}
          </p>
        )}

        <div className="flex justify-end gap-2 flex-wrap">
          {!isBusy && phase !== 'ready' && (
            <button
              type="button"
              onClick={onDismiss}
              className="px-3 py-1.5 rounded text-sm bg-bg-raised border border-bg-border hover:bg-bg-border transition-colors"
            >
              {ud.later}
            </button>
          )}

          {phase === 'ready' && canAuto && (
            <button
              type="button"
              onClick={onInstall}
              className="px-3 py-1.5 rounded text-sm bg-accent hover:bg-accent-hover text-bg-base font-medium transition-colors"
            >
              {ud.restartNow}
            </button>
          )}

          {phase === 'available' && canAuto && (
            <button
              type="button"
              onClick={onStartDownload}
              className="px-3 py-1.5 rounded text-sm bg-accent hover:bg-accent-hover text-bg-base font-medium transition-colors"
            >
              {ud.updateNow}
            </button>
          )}

          {(phase === 'error' || !canAuto || phase === 'available') && !isBusy && phase !== 'ready' && (
            <button
              type="button"
              onClick={onManualDownload}
              className="px-3 py-1.5 rounded text-sm bg-bg-raised border border-bg-border hover:bg-bg-border transition-colors"
            >
              {ud.openDownload}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
