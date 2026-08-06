import { useEffect, useState } from 'react'
import type {
  ConnectionConfig,
  ConnectionState,
  MqttProtocol,
  QoS,
  SavedConnectionProfile
} from '../types/mqtt'

const DEFAULT_PORTS: Record<MqttProtocol, number> = {
  mqtt: 1883,
  mqtts: 8883,
  ws: 8083,
  wss: 8084
}

const inputClass =
  'mt-1 w-full bg-bg-raised border border-bg-border rounded px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent disabled:opacity-50'
const labelClass = 'text-xs text-fg-muted'

function randomClientId(): string {
  return `explorer_${Math.random().toString(36).slice(2, 10)}`
}

function defaultFormState() {
  return {
    name: 'Yeni bağlantı',
    protocol: 'mqtt' as MqttProtocol,
    host: 'localhost',
    port: DEFAULT_PORTS.mqtt,
    path: '/mqtt',
    clientId: randomClientId(),
    username: '',
    password: '',
    subscribeFilter: '#',
    subscribeQos: 0 as QoS,
    rejectUnauthorized: true,
    caPath: undefined as string | undefined,
    certPath: undefined as string | undefined,
    keyPath: undefined as string | undefined
  }
}

interface Props {
  open: boolean
  connectionState: ConnectionState
  onClose: () => void
  onConnect: (config: ConnectionConfig) => Promise<{ success: boolean; error?: string }>
  onConnected?: (summary: string) => void
}

export function ConnectionDialog({
  open,
  connectionState,
  onClose,
  onConnect,
  onConnected
}: Props): JSX.Element | null {
  const [form, setForm] = useState(defaultFormState)
  const [profiles, setProfiles] = useState<SavedConnectionProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectError, setConnectError] = useState<string | undefined>()
  const [showPassword, setShowPassword] = useState(false)

  const isTls = form.protocol === 'mqtts' || form.protocol === 'wss'
  const isWs = form.protocol === 'ws' || form.protocol === 'wss'
  const isConnected = connectionState === 'connected' || connectionState === 'connecting'

  useEffect(() => {
    if (open) {
      void window.mqttAPI.listProfiles().then(setProfiles)
      setConnectError(undefined)
    }
  }, [open])

  if (!open) return null

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleProtocolChange(next: MqttProtocol): void {
    setForm((prev) => ({ ...prev, protocol: next, port: DEFAULT_PORTS[next] }))
  }

  function handleNewConnection(): void {
    setSelectedId(null)
    setForm(defaultFormState())
    setConnectError(undefined)
  }

  async function loadProfile(profile: SavedConnectionProfile): Promise<void> {
    setSelectedId(profile.id)
    setForm({
      name: profile.name,
      protocol: profile.protocol,
      host: profile.host,
      port: profile.port,
      path: profile.path ?? '/mqtt',
      clientId: profile.clientId,
      username: profile.username ?? '',
      password: profile.hasSavedPassword ? (await window.mqttAPI.getProfilePassword(profile.id)) ?? '' : '',
      subscribeFilter: profile.subscribeFilter,
      subscribeQos: profile.subscribeQos ?? 0,
      rejectUnauthorized: profile.tls?.rejectUnauthorized ?? true,
      caPath: profile.tls?.caPath,
      certPath: profile.tls?.certPath,
      keyPath: profile.tls?.keyPath
    })
  }

  async function handlePickFile(field: 'caPath' | 'certPath' | 'keyPath'): Promise<void> {
    const result = await window.mqttAPI.pickFile()
    if (!result.canceled && result.filePath) patch(field, result.filePath)
  }

  function buildConfig(): ConnectionConfig {
    return {
      protocol: form.protocol,
      host: form.host,
      port: form.port,
      path: isWs ? form.path : undefined,
      clientId: form.clientId,
      username: form.username || undefined,
      password: form.password || undefined,
      tls: isTls
        ? {
            rejectUnauthorized: form.rejectUnauthorized,
            caPath: form.caPath,
            certPath: form.certPath,
            keyPath: form.keyPath
          }
        : undefined,
      subscribeFilter: form.subscribeFilter,
      subscribeQos: form.subscribeQos
    }
  }

  function profilePayload(): Omit<SavedConnectionProfile, 'id' | 'hasSavedPassword'> {
    return {
      name: form.name.trim() || 'Yeni bağlantı',
      protocol: form.protocol,
      host: form.host,
      port: form.port,
      path: isWs ? form.path : undefined,
      clientId: form.clientId,
      username: form.username || undefined,
      tls: isTls
        ? {
            rejectUnauthorized: form.rejectUnauthorized,
            caPath: form.caPath,
            certPath: form.certPath,
            keyPath: form.keyPath
          }
        : undefined,
      subscribeFilter: form.subscribeFilter,
      subscribeQos: form.subscribeQos
    }
  }

  async function handleSave(): Promise<void> {
    if (selectedId) {
      const updated = await window.mqttAPI.updateProfile(selectedId, profilePayload(), form.password || undefined)
      setProfiles((prev) => prev.map((p) => (p.id === selectedId ? updated : p)))
    } else {
      const saved = await window.mqttAPI.saveProfile(profilePayload(), form.password || undefined)
      setProfiles((prev) => [...prev, saved])
      setSelectedId(saved.id)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!selectedId) return
    await window.mqttAPI.deleteProfile(selectedId)
    setProfiles((prev) => prev.filter((p) => p.id !== selectedId))
    handleNewConnection()
  }

  async function handleConnect(): Promise<void> {
    setConnectError(undefined)
    const result = await onConnect(buildConfig())
    if (result.success) {
      onConnected?.(form.name.trim() || `${form.host}:${form.port}`)
      onClose()
    } else {
      setConnectError(result.error)
    }
  }

  const uriPreview = `${form.protocol}://${form.host || '…'}:${form.port}${isWs ? form.path : ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 p-4" onClick={onClose}>
      <div
        className="bg-bg-panel border border-bg-border rounded-lg shadow-2xl w-full max-w-4xl min-h-[500px] flex flex-col overflow-hidden text-fg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 min-h-0">
          <aside className="w-52 shrink-0 border-r border-bg-border bg-bg-base flex flex-col">
            <div className="flex items-center justify-between px-3 py-3 border-b border-bg-border">
              <span className="text-sm font-medium text-fg-muted">Bağlantılar</span>
              <button
                type="button"
                onClick={handleNewConnection}
                className="w-7 h-7 rounded bg-accent-muted hover:bg-accent/30 text-accent text-lg leading-none transition-colors"
                title="Yeni bağlantı"
              >
                +
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto py-1">
              {profiles.length === 0 && (
                <li className="px-3 py-2 text-xs text-fg-subtle">Kayıtlı profil yok</li>
              )}
              {profiles.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => void loadProfile(p)}
                    className={`w-full text-left px-3 py-2 text-sm truncate transition-colors ${
                      selectedId === p.id
                        ? 'bg-bg-raised text-fg border-l-2 border-accent'
                        : 'text-fg-muted hover:bg-bg-raised/60 hover:text-fg'
                    }`}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-5 py-4 border-b border-bg-border flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-fg">Bağlantı ayarları</h2>
                <p className="text-xs text-fg-subtle mono mt-1">{uriPreview}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-fg-subtle hover:text-fg text-lg leading-none px-1 transition-colors"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <label className="block">
                <span className={labelClass}>Profil adı</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => patch('name', e.target.value)}
                  disabled={isConnected}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>Protokol</span>
                  <select
                    className={inputClass}
                    value={form.protocol}
                    onChange={(e) => handleProtocolChange(e.target.value as MqttProtocol)}
                    disabled={isConnected}
                  >
                    <option value="mqtt">mqtt://</option>
                    <option value="mqtts">mqtts://</option>
                    <option value="ws">ws://</option>
                    <option value="wss">wss://</option>
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Port</span>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.port}
                    onChange={(e) => patch('port', Number(e.target.value))}
                    disabled={isConnected}
                  />
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>Host</span>
                <input
                  className={inputClass}
                  value={form.host}
                  onChange={(e) => patch('host', e.target.value)}
                  disabled={isConnected}
                  placeholder="broker.example.com"
                />
              </label>

              {isWs && (
                <label className="block">
                  <span className={labelClass}>Path</span>
                  <input
                    className={`${inputClass} mono`}
                    value={form.path}
                    onChange={(e) => patch('path', e.target.value)}
                    disabled={isConnected}
                  />
                </label>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>Kullanıcı adı</span>
                  <input
                    className={inputClass}
                    value={form.username}
                    onChange={(e) => patch('username', e.target.value)}
                    disabled={isConnected}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Parola</span>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`${inputClass} mt-0 pr-14`}
                      value={form.password}
                      onChange={(e) => patch('password', e.target.value)}
                      disabled={isConnected}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fg-subtle hover:text-fg transition-colors"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? 'Gizle' : 'Göster'}
                    </button>
                  </div>
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>Client ID</span>
                <input
                  className={`${inputClass} mono`}
                  value={form.clientId}
                  onChange={(e) => patch('clientId', e.target.value)}
                  disabled={isConnected}
                />
              </label>

              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <label className="block">
                  <span className={labelClass}>Subscribe filtresi</span>
                  <input
                    className={`${inputClass} mono`}
                    value={form.subscribeFilter}
                    onChange={(e) => patch('subscribeFilter', e.target.value)}
                    placeholder="#"
                  />
                </label>
                <label className="block w-20">
                  <span className={labelClass}>QoS</span>
                  <select
                    className={inputClass}
                    value={form.subscribeQos}
                    onChange={(e) => patch('subscribeQos', Number(e.target.value) as QoS)}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </label>
              </div>

              {isTls && (
                <div className="border border-bg-border rounded-lg p-4 space-y-3 bg-bg-raised/50">
                  <p className="text-xs font-medium text-fg-muted">TLS</p>
                  <label className="flex items-center gap-2 text-sm text-fg-muted">
                    <input
                      type="checkbox"
                      checked={!form.rejectUnauthorized}
                      onChange={(e) => patch('rejectUnauthorized', !e.target.checked)}
                      className="rounded border-bg-border"
                    />
                    Self-signed sertifikaya izin ver
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-xs bg-bg-panel border border-bg-border rounded px-3 py-1.5 hover:bg-bg-border"
                      onClick={() => handlePickFile('caPath')}
                    >
                      CA {form.caPath ? '✓' : 'seç'}
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-bg-panel border border-bg-border rounded px-3 py-1.5 hover:bg-bg-border"
                      onClick={() => handlePickFile('certPath')}
                    >
                      Cert {form.certPath ? '✓' : 'seç'}
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-bg-panel border border-bg-border rounded px-3 py-1.5 hover:bg-bg-border"
                      onClick={() => handlePickFile('keyPath')}
                    >
                      Key {form.keyPath ? '✓' : 'seç'}
                    </button>
                  </div>
                </div>
              )}

              {connectError && (
                <p className="text-sm text-state-error bg-state-error/10 border border-state-error/30 rounded px-3 py-2">
                  {connectError}
                </p>
              )}
            </div>

            <div className="px-5 py-3 border-t border-bg-border flex items-center gap-2 bg-bg-base">
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={!selectedId || isConnected}
                className="px-3 py-1.5 text-sm rounded border border-bg-border text-fg-muted hover:text-state-error hover:border-state-error/50 disabled:opacity-40 transition-colors"
              >
                Sil
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isConnected}
                className="px-4 py-1.5 text-sm rounded border border-bg-border bg-bg-raised hover:bg-bg-border disabled:opacity-40"
              >
                Kaydet
              </button>
              {!isConnected ? (
                <button
                  type="button"
                  onClick={() => void handleConnect()}
                  className="px-4 py-1.5 text-sm rounded bg-accent hover:bg-accent-hover text-bg-base font-medium transition-colors"
                >
                  Bağlan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm rounded bg-bg-raised border border-bg-border hover:bg-bg-border"
                >
                  Kapat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
