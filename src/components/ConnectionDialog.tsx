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

function randomClientId(): string {
  return `explorer_${Math.random().toString(36).slice(2, 10)}`
}

function defaultFormState() {
  return {
    name: 'new connection',
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
  const [advancedOpen, setAdvancedOpen] = useState(false)
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
    setAdvancedOpen(false)
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
    setAdvancedOpen(Boolean(profile.tls))
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
      name: form.name.trim() || 'new connection',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-[#f5f5f0] text-gray-900 rounded-lg shadow-2xl w-full max-w-4xl min-h-[520px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 min-h-0">
          {/* Sol: bağlantı listesi */}
          <div className="w-56 shrink-0 border-r border-gray-300 bg-[#ecece6] flex flex-col">
            <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-300">
              <button
                type="button"
                onClick={handleNewConnection}
                className="w-8 h-8 rounded-full bg-[#f5c518] hover:bg-[#e0b010] text-gray-900 font-bold text-lg leading-none shadow"
                title="Yeni bağlantı"
              >
                +
              </button>
              <span className="text-sm font-semibold text-gray-700">Connections</span>
            </div>
            <ul className="flex-1 overflow-y-auto py-1">
              {profiles.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => void loadProfile(p)}
                    className={`w-full text-left px-4 py-2.5 text-sm truncate ${
                      selectedId === p.id
                        ? 'bg-white/80 font-medium text-gray-900'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sağ: form */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f0]">
            <div className="px-6 py-4 border-b border-gray-300">
              <h2 className="text-xl font-semibold text-gray-800">MQTT Connection</h2>
              <p className="text-sm text-gray-500 mono mt-0.5">{uriPreview}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</span>
                <input
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  value={form.name}
                  onChange={(e) => patch('name', e.target.value)}
                  disabled={isConnected}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Protocol</span>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
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
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Port</span>
                  <input
                    type="number"
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    value={form.port}
                    onChange={(e) => patch('port', Number(e.target.value))}
                    disabled={isConnected}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Host</span>
                <input
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  value={form.host}
                  onChange={(e) => patch('host', e.target.value)}
                  disabled={isConnected}
                  placeholder="broker.example.com"
                />
              </label>

              {isWs && (
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Path</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white mono"
                    value={form.path}
                    onChange={(e) => patch('path', e.target.value)}
                    disabled={isConnected}
                  />
                </label>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Username</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    value={form.username}
                    onChange={(e) => patch('username', e.target.value)}
                    disabled={isConnected}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</span>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-16 text-sm bg-white"
                      value={form.password}
                      onChange={(e) => patch('password', e.target.value)}
                      disabled={isConnected}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? 'hide' : 'show'}
                    </button>
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client ID</span>
                <input
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white mono"
                  value={form.clientId}
                  onChange={(e) => patch('clientId', e.target.value)}
                  disabled={isConnected}
                />
              </label>

              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subscribe filter</span>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white mono"
                    value={form.subscribeFilter}
                    onChange={(e) => patch('subscribeFilter', e.target.value)}
                    placeholder="#"
                  />
                </label>
                <label className="block w-24">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">QoS</span>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white"
                    value={form.subscribeQos}
                    onChange={(e) => patch('subscribeQos', Number(e.target.value) as QoS)}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </label>
              </div>

              {advancedOpen && isTls && (
                <div className="border border-gray-300 rounded p-4 space-y-3 bg-white">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!form.rejectUnauthorized}
                      onChange={(e) => patch('rejectUnauthorized', !e.target.checked)}
                    />
                    Self-signed sertifikaya izin ver
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-xs border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
                      onClick={() => handlePickFile('caPath')}
                    >
                      CA {form.caPath ? '✓' : '…'}
                    </button>
                    <button
                      type="button"
                      className="text-xs border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
                      onClick={() => handlePickFile('certPath')}
                    >
                      Cert {form.certPath ? '✓' : '…'}
                    </button>
                    <button
                      type="button"
                      className="text-xs border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
                      onClick={() => handlePickFile('keyPath')}
                    >
                      Key {form.keyPath ? '✓' : '…'}
                    </button>
                  </div>
                </div>
              )}

              {connectError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {connectError}
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-300 flex items-center gap-2 bg-[#ecece6]">
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={!selectedId || isConnected}
                className="px-4 py-2 text-sm rounded border border-gray-400 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                DELETE
              </button>
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                disabled={!isTls}
                className="px-4 py-2 text-sm rounded border border-gray-400 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                ADVANCED
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isConnected}
                className="px-5 py-2 text-sm rounded bg-[#f5c518] hover:bg-[#e0b010] font-semibold text-gray-900 disabled:opacity-40"
              >
                SAVE
              </button>
              {!isConnected ? (
                <button
                  type="button"
                  onClick={() => void handleConnect()}
                  className="px-5 py-2 text-sm rounded bg-[#1a7a7a] hover:bg-[#156565] text-white font-semibold"
                >
                  CONNECT
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-sm rounded bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                >
                  CLOSE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
