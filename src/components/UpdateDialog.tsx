import type { UpdateInfo } from '../types/update'

interface Props {
  info: UpdateInfo
  currentVersion: string
  onDismiss: () => void
  onDownload: () => void
}

export function UpdateDialog({ info, currentVersion, onDismiss, onDownload }: Props): JSX.Element {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-bg-panel border border-bg-border rounded-lg shadow-xl w-full max-w-md p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-fg">Güncelleme mevcut</h2>
          <p className="text-sm text-fg-muted mt-1">
            Yeni sürüm: <span className="text-accent font-medium">v{info.version}</span>
            {' '}(sizde v{currentVersion})
          </p>
        </div>

        <p className="text-xs text-fg-subtle leading-relaxed">
          GitHub Releases&apos;ten en son sürümü indirip mevcut kurulumun üzerine yükleyin.
          Uygulama henüz kod imzalı değil; güncellemeden sonra aynı &quot;Yine de Aç&quot; adımlarını uygulayın.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 rounded text-sm bg-bg-raised border border-bg-border hover:bg-bg-border transition-colors"
          >
            Sonra
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-3 py-1.5 rounded text-sm bg-accent hover:bg-accent-hover text-bg-base font-medium transition-colors"
          >
            İndirme sayfasını aç
          </button>
        </div>
      </div>
    </div>
  )
}
