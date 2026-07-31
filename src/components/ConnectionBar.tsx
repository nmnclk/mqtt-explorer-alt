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

interface Props {
  connectionState: ConnectionState
  connectionError?: string
  onConnect: (config: ConnectionConfig) => Promise<{ success: boolean; error?: string }>
  onDisconnect: () => Promise<void>
}

export function ConnectionBar({ connectionState, connectionError, onConnect, onDisconnect }: Props): JSX.Element {
  const [protocol, setProtocol] = useState<MqttProtocol>('mqtt')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState<number>(DEFAULT_PORTS.mqtt)
  const [path, setPath] = useState('/mqtt')
  const [clientId, setClientId] = useState(randomClientId())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [subscribeFilter, setSubscribeFilter] = useState('#')
  const [subscribeQos, setSubscribeQos] = useState<QoS>(0)

  const [tlsExpanded, setTlsExpanded] = useState(false)
  const [rejectUnauthorized, setRejectUnauthorized] = useState(true)
  const [caPath, setCaPath] = useState<string | undefined>(undefined)
  const [certPath, setCertPath] = useState<string | undefined>(undefined)
  const [keyPath, setKeyPath] = useState<string | undefined>(undefined)

  const [profiles, setProfiles] = useState<SavedConnectionProfile[]>([])
  const [savePanelOpen, setSavePanelOpen] = useState(false)
  const [profileName, setProfileName] = useState('')

  const isTls = protocol === 'mqtts' || protocol === 'wss'
  const isWs = protocol === 'ws' || protocol === 'wss'

  useEffect(() => {
    window.mqttAPI.listProfiles().then(setProfiles)
  }, [])

  function handleProtocolChange(next: MqttProtocol): void {
    setProtocol(next)
    setPort(DEFAULT_PORTS[next])
  }

  async function handlePickFile(setter: (p: string) => void): Promise<void> {
    const result = await window.mqttAPI.pickFile()
    if (!result.canceled && result.filePath) setter(result.filePath)
  }

  function buildConfig(): ConnectionConfig {
    return {
      protocol,
      host,
      port,
      path: isWs ? path : undefined,
      clientId,
      username: username || undefined,
      password: password || undefined,
      tls: isTls ? { rejectUnauthorized, caPath, certPath, keyPath } : undefined,
      subscribeFilter,
      subscribeQos
    }
  }

  async function handleConnect(): Promise<void> {
    await onConnect(buildConfig())
  }

  async function handleSaveProfile(): Promise<void> {
    if (!profileName.trim()) return
    const saved = await window.mqttAPI.saveProfile(
      {
        name: profileName.trim(),
        protocol,
        host,
        port,
        path: isWs ? path : undefined,
        clientId,
        username: username || undefined,
        tls: isTls ? { rejectUnauthorized, caPath, certPath, keyPath } : undefined,
        subscribeFilter,
        subscribeQos
      },
      password || undefined
    )
    setProfiles((prev) => [...prev, saved])
    setSavePanelOpen(false)
    setProfileName('')
  }

  async function handleLoadProfile(id: string): Promise<void> {
    const profile = profiles.find((p) => p.id === id)
    if (!profile) return
    setProtocol(profile.protocol)
    setHost(profile.host)
    setPort(profile.port)
    setPath(profile.path ?? '/mqtt')
    setClientId(profile.clientId)
    setUsername(profile.username ?? '')
    setSubscribeFilter(profile.subscribeFilter)
    setSubscribeQos(profile.subscribeQos ?? 0)
    if (profile.tls) {
      setTlsExpanded(true)
      setRejectUnauthorized(profile.tls.rejectUnauthorized)
      setCaPath(profile.tls.caPath)
      setCertPath(profile.tls.certPath)
      setKeyPath(profile.tls.keyPath)
    }
    if (profile.hasSavedPassword) {
      const pw = await window.mqttAPI.getProfilePassword(profile.id)
      if (pw) setPassword(pw)
    }
  }

  async function handleDeleteProfile(id: string): Promise<void> {
    await window.mqttAPI.deleteProfile(id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  const statusMeta: Record<ConnectionState, { label: string; color: string }> = {
    idle: { label: 'Bağlı değil', color: 'bg-state-idle' },
    disconnected: { label: 'Bağlı değil', color: 'bg-state-idle' },
    connecting: { label: 'Bağlanıyor…', color: 'bg-state-connecting animate-pulse' },
    connected: { label: 'Bağlı', color: 'bg-state-connected' },
    error: { label: 'Hata', color: 'bg-state-error' }
  }
  const status = statusMeta[connectionState]
  const isConnected = connectionState === 'connected' || connectionState === 'connecting'

  return (
    <div className="border-b border-bg-border bg-bg-panel px-4 py-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Protokol</label>
          <select
            className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm"
            value={protocol}
            onChange={(e) => handleProtocolChange(e.target.value as MqttProtocol)}
            disabled={isConnected}
          >
            <option value="mqtt">mqtt (TCP)</option>
            <option value="mqtts">mqtts (TCP/TLS)</option>
            <option value="ws">ws</option>
            <option value="wss">wss</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs text-gray-400">Host</label>
          <input
            className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            disabled={isConnected}
            placeholder="broker.example.com"
          />
        </div>

        <div className="flex flex-col gap-1 w-24">
          <label className="text-xs text-gray-400">Port</label>
          <input
            type="number"
            className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            disabled={isConnected}
          />
        </div>

        {isWs && (
          <div className="flex flex-col gap-1 w-32">
            <label className="text-xs text-gray-400">Path</label>
            <input
              className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              disabled={isConnected}
              placeholder="/mqtt"
            />
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-xs text-gray-400">Client ID</label>
          <input
            className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm mono"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={isConnected}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-xs text-gray-400">Username</label>
          <input
            className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isConnected}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-xs text-gray-400">Password</label>
          <input
            type="password"
            className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isConnected}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px] flex-1">
          <label className="text-xs text-gray-400">Subscribe filter</label>
          <div className="flex gap-1">
            <input
              className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm mono flex-1"
              value={subscribeFilter}
              onChange={(e) => setSubscribeFilter(e.target.value)}
              placeholder="#"
            />
            <select
              className="bg-bg-raised border border-bg-border rounded px-1 text-sm"
              value={subscribeQos}
              onChange={(e) => setSubscribeQos(Number(e.target.value) as QoS)}
            >
              <option value={0}>QoS 0</option>
              <option value={1}>QoS 1</option>
              <option value={2}>QoS 2</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="bg-accent hover:bg-accent/80 transition-colors px-4 py-1.5 rounded text-sm font-medium"
            >
              Bağlan
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="bg-bg-raised hover:bg-red-900/40 border border-bg-border transition-colors px-4 py-1.5 rounded text-sm font-medium"
            >
              Bağlantıyı kes
            </button>
          )}
          <button
            onClick={() => setSavePanelOpen((v) => !v)}
            className="bg-bg-raised hover:bg-bg-border border border-bg-border transition-colors px-3 py-1.5 rounded text-sm"
            title="Profili kaydet"
          >
            Kaydet
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
          <span className="text-xs text-gray-400" title={connectionError}>
            {status.label}
            {connectionError ? ` — ${connectionError}` : ''}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setTlsExpanded((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-200"
          disabled={!isTls}
        >
          {isTls ? (tlsExpanded ? '▾ TLS ayarları' : '▸ TLS ayarları') : 'TLS ayarları (mqtts/wss seçin)'}
        </button>

        {profiles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Kayıtlı:</span>
            {profiles.map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-1 bg-bg-raised border border-bg-border rounded px-2 py-0.5 text-xs"
              >
                <button className="hover:text-accent" onClick={() => handleLoadProfile(p.id)}>
                  {p.name}
                </button>
                <button
                  className="text-gray-500 hover:text-state-error"
                  onClick={() => handleDeleteProfile(p.id)}
                  title="Sil"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {isTls && tlsExpanded && (
        <div className="flex flex-wrap items-center gap-4 bg-bg-raised border border-bg-border rounded p-3">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!rejectUnauthorized}
              onChange={(e) => setRejectUnauthorized(!e.target.checked)}
            />
            Sertifikayı doğrulama (self-signed broker)
          </label>
          <button
            className="text-xs bg-bg-panel border border-bg-border rounded px-2 py-1 hover:bg-bg-border"
            onClick={() => handlePickFile(setCaPath)}
          >
            CA dosyası {caPath ? '✓' : 'seç'}
          </button>
          <button
            className="text-xs bg-bg-panel border border-bg-border rounded px-2 py-1 hover:bg-bg-border"
            onClick={() => handlePickFile(setCertPath)}
          >
            Cert dosyası {certPath ? '✓' : 'seç'}
          </button>
          <button
            className="text-xs bg-bg-panel border border-bg-border rounded px-2 py-1 hover:bg-bg-border"
            onClick={() => handlePickFile(setKeyPath)}
          >
            Key dosyası {keyPath ? '✓' : 'seç'}
          </button>
        </div>
      )}

      {savePanelOpen && (
        <div className="flex items-center gap-2 bg-bg-raised border border-bg-border rounded p-2">
          <input
            className="bg-bg-panel border border-bg-border rounded px-2 py-1 text-sm flex-1"
            placeholder="Profil adı"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <button
            className="bg-accent hover:bg-accent/80 px-3 py-1 rounded text-sm"
            onClick={handleSaveProfile}
          >
            Profili kaydet
          </button>
        </div>
      )}
    </div>
  )
}
