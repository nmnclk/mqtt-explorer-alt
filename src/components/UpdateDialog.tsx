import type { UpdateInfo } from '../types/update'

interface Props {
  info: UpdateInfo
  currentVersion: string
  onDismiss: () => void
  onDownload: () => void
}

export function UpdateDialog({ info, currentVersion, onDismiss, onDownload }: Props): JSX.Element {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-bg-panel border border-bg-border rounded-lg shadow-xl w-full max-w-md p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-100">Update available</h2>
          <p className="text-sm text-gray-400 mt-1">
            A new version is available: <span className="text-accent font-medium">v{info.version}</span>
            {' '}(you have v{currentVersion})
          </p>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Download the latest build from GitHub Releases and install it over your current version.
          The app is not code-signed yet, so use the same &quot;Open Anyway&quot; steps after updating.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 rounded text-sm bg-bg-raised border border-bg-border hover:bg-bg-border"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-3 py-1.5 rounded text-sm bg-accent hover:bg-accent/80 font-medium"
          >
            Open download page
          </button>
        </div>
      </div>
    </div>
  )
}
