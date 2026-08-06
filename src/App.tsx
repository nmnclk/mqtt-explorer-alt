import { useEffect, useState } from 'react'
import { ConnectionBar } from './components/ConnectionBar'
import { ConnectionDialog } from './components/ConnectionDialog'
import { UpdateDialog } from './components/UpdateDialog'
import { TopicTree } from './components/TopicTree'
import { MessagePanel } from './components/MessagePanel'
import { PublishBar } from './components/PublishBar'
import { useMqttBridge } from './hooks/useMqttBridge'
import type { UpdateInfo } from './types/update'

export default function App(): JSX.Element {
  const bridge = useMqttBridge()
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [connectionLabel, setConnectionLabel] = useState<string | undefined>()
  const [appVersion, setAppVersion] = useState('dev')
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [noUpdateNotice, setNoUpdateNotice] = useState(false)

  const selectedMessages = selectedTopic ? bridge.messagesByTopic.get(selectedTopic) ?? [] : []

  useEffect(() => {
    if (bridge.connectionState === 'idle') {
      setConnectionDialogOpen(true)
    }
  }, [])

  useEffect(() => {
    void window.updateAPI.getAppVersion().then(setAppVersion)

    const unsub = window.updateAPI.onUpdateAvailable((info) => {
      setUpdateInfo(info)
    })

    return unsub
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
    } else {
      setNoUpdateNotice(true)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-bg-base text-gray-200">
      <ConnectionBar
        connectionState={bridge.connectionState}
        connectionError={bridge.connectionError}
        connectionLabel={connectionLabel}
        appVersion={appVersion}
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
          onDismiss={() => setUpdateInfo(null)}
          onDownload={() => void window.updateAPI.openRelease(updateInfo.releaseUrl)}
        />
      )}

      {noUpdateNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-bg-panel border border-bg-border rounded-lg shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              You&apos;re on the latest version
              {appVersion !== 'dev' ? ` (v${appVersion})` : ''}.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setNoUpdateNotice(false)}
                className="px-3 py-1.5 rounded text-sm bg-accent hover:bg-accent/80 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-1.5 border-b border-bg-border bg-bg-panel/60 text-xs text-gray-400">
        <span>Toplam mesaj: {bridge.totalMessageCount.toLocaleString('tr-TR')}</span>
        <button
          className="hover:text-state-error"
          onClick={() => setClearConfirmOpen(true)}
        >
          Ağacı temizle
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-panel border border-bg-border rounded p-4 w-80 flex flex-col gap-3">
            <p className="text-sm">Tüm topic ağacı ve mesaj geçmişi silinecek. Emin misiniz?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded text-sm bg-bg-raised border border-bg-border"
                onClick={() => setClearConfirmOpen(false)}
              >
                Vazgeç
              </button>
              <button
                className="px-3 py-1.5 rounded text-sm bg-state-error/80 hover:bg-state-error"
                onClick={handleClearAll}
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
