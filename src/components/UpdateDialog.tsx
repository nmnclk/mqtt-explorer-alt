import { useI18n } from '../i18n/I18nContext'
import type { UpdateInfo } from '../types/update'

interface Props {
  info: UpdateInfo
  currentVersion: string
  onDismiss: () => void
  onDownload: () => void
}

export function UpdateDialog({ info, currentVersion, onDismiss, onDownload }: Props): JSX.Element {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-bg-panel border border-bg-border rounded-lg shadow-xl w-full max-w-md p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-fg">{t.updateDialog.title}</h2>
          <p className="text-sm text-fg-muted mt-1">{t.updateDialog.version(info.version, currentVersion)}</p>
        </div>

        <p className="text-xs text-fg-subtle leading-relaxed">{t.updateDialog.instructions}</p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 rounded text-sm bg-bg-raised border border-bg-border hover:bg-bg-border transition-colors"
          >
            {t.updateDialog.later}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-3 py-1.5 rounded text-sm bg-accent hover:bg-accent-hover text-bg-base font-medium transition-colors"
          >
            {t.updateDialog.openDownload}
          </button>
        </div>
      </div>
    </div>
  )
}
