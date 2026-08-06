import { useEffect, useState } from 'react'
import { ConnectionBar } from './components/ConnectionBar'
import { ConnectionDialog } from './components/ConnectionDialog'
import { UpdateDialog } from './components/UpdateDialog'
import { TopicTree } from './components/TopicTree'
import { MessagePanel } from './components/MessagePanel'
import { PublishBar } from './components/PublishBar'
import { useMqttBridge } from './hooks/useMqttBridge'
import { useTheme } from './hooks/useTheme'
import { useI18n } from './i18n/I18nContext'
import type { UpdateInfo, UpdatePhase, UpdateProgress } from './types/update'

export default function App(): JSX.Element {
  const bridge = useMqttBridge()
  const { theme, toggleTheme } = useTheme()
  const { t, toggleLocale, numberLocale } = useI18n()
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [connectionLabel, setConnectionLabel] = useState<string | undefined>()
  const [appVersion, setAppVersion] = useState('dev')
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [updatePhase, setUpdatePhase] = useState<UpdatePhase>('available')
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress | null>(null)
  const [updateError, setUpdateError] = useState<string | undefined>()
  const [noUpdateNotice, setNoUpdateNotice] = useState(false)

  const selectedMessages = selectedTopic ? bridge.messagesByTopic.get(selectedTopic) ?? [] : []

  useEffect(() => {
    if (bridge.connectionState === 'idle') {
      setConnectionDialogOpen(true)
    }
  }, [])

  useEffect(() => {
    void window.updateAPI.getAppVersion().then(setAppVersion)

    const unsubAvailable = window.updateAPI.onUpdateAvailable((info) => {
      setUpdateInfo(info)
      setUpdatePhase('available')
      setUpdateProgress(null)
      setUpdateError(undefined)
    })
    const unsubProgress = window.updateAPI.onDownloadProgress((progress) => {
      setUpdatePhase('downloading')
      setUpdateProgress(progress)
    })
    const unsubDownloaded = window.updateAPI.onUpdateDownloaded(() => {
      setUpdatePhase('ready')
    })
    const unsubError = window.updateAPI.onUpdateError((message) => {
      setUpdatePhase('error')
      setUpdateError(message)
    })

    return () => {
      unsubAvailable()
      unsubProgress()
      unsubDownloaded()
      unsubError()
    }
  }, [])

  function handleClearAll(): void {
    bridge.clearAll()
    setSelectedTopic(null)
    setClearConfirmOpen(false)
  }

  async function handleCheckUpdates(): Promise<void> {
    const info = await window.updateAPI.check()
    if (info) {
      setUpdateInfo(info)
      setUpdatePhase('available')
      setUpdateProgress(null)
      setUpdateError(undefined)
    } else {
      setNoUpdateNotice(true)
    }
  }

  async function handleStartDownload(): Promise<void> {
    if (!updateInfo) return
    setUpdatePhase('downloading')
    setUpdateProgress({ percent: 0, transferred: 0, total: 0 })
    setUpdateError(undefined)

    const result = await window.updateAPI.download()
    if (!result.success) {
      setUpdatePhase('error')
      setUpdateError(result.error)
    }
  }

  function handleDismissUpdate(): void {
    setUpdateInfo(null)
    setUpdatePhase('available')
    setUpdateProgress(null)
    setUpdateError(undefined)
  }

  return (
    <div className="h-screen flex flex-col bg-bg-base text-fg">
      <ConnectionBar
        connectionState={bridge.connectionState}
        connectionError={bridge.connectionError}
        connectionLabel={connectionLabel}
        appVersion={appVersion}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleLocale={toggleLocale}
        onOpenConnections={() => setConnectionDialogOpen(true)}
        onDisconnect={bridge.disconnect}
        onCheckUpdates={handleCheckUpdates}
      />

      <ConnectionDialog
        open={connectionDialogOpen}
        connectionState={bridge.connectionState}
        onClose={() => setConnectionDialogOpen(false)}
        onConnect={bridge.connect}
        onConnected={setConnectionLabel}
      />

      {updateInfo && (
        <UpdateDialog
          info={updateInfo}
          currentVersion={appVersion}
          phase={updatePhase}
          progress={updateProgress}
          errorMessage={updateError}
          onDismiss={handleDismissUpdate}
          onStartDownload={() => void handleStartDownload()}
          onInstall={() => void window.updateAPI.install()}
          onManualDownload={() => void window.updateAPI.openRelease(updateInfo.releaseUrl)}
        />
      )}

      {noUpdateNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay/50 p-4">
          <div className="bg-bg-panel border border-bg-border rounded-lg shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
            <p className="text-sm text-fg-muted">
              {t.app.noUpdateTitle}
              {appVersion !== 'dev' ? ` (v${appVersion})` : ''}.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setNoUpdateNotice(false)}
                className="px-3 py-1.5 rounded text-sm bg-accent hover:bg-accent-hover text-bg-base font-medium"
              >
                {t.app.ok}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-1.5 border-b border-bg-border bg-bg-panel/60 text-xs text-fg-muted">
        <span>
          {t.app.totalMessages}: {bridge.totalMessageCount.toLocaleString(numberLocale)}
        </span>
        <button
          className="hover:text-state-error transition-colors"
          onClick={() => setClearConfirmOpen(true)}
        >
          {t.app.clearTree}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <TopicTree
            root={bridge.treeRoot}
            treeVersion={bridge.treeVersion}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onSubscribe={bridge.subscribe}
          />
        </div>

        <div className="w-80 shrink-0 flex flex-col min-h-0">
          <MessagePanel topic={selectedTopic} messages={selectedMessages} />
          <PublishBar selectedTopic={selectedTopic} onPublish={bridge.publish} />
        </div>
      </div>

      {clearConfirmOpen && (
        <div className="fixed inset-0 bg-overlay/50 flex items-center justify-center z-50">
          <div className="bg-bg-panel border border-bg-border rounded p-4 w-80 flex flex-col gap-3">
            <p className="text-sm">{t.app.clearConfirm}</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded text-sm bg-bg-raised border border-bg-border hover:bg-bg-border transition-colors"
                onClick={() => setClearConfirmOpen(false)}
              >
                {t.app.cancel}
              </button>
              <button
                className="px-3 py-1.5 rounded text-sm bg-state-error/80 hover:bg-state-error transition-colors"
                onClick={handleClearAll}
              >
                {t.app.clear}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
