// Ortak tipler: hem electron (main/preload) hem src (renderer) tarafından import edilir.
// TypeScript strict mode - `any` kullanılmaz.

export type MqttProtocol = 'mqtt' | 'mqtts' | 'ws' | 'wss'

export type QoS = 0 | 1 | 2

export interface TlsOptions {
  rejectUnauthorized: boolean
  caPath?: string
  certPath?: string
  keyPath?: string
}

export interface ConnectionConfig {
  protocol: MqttProtocol
  host: string
  port: number
  path?: string // sadece ws/wss için anlamlı
  clientId: string
  username?: string
  password?: string
  tls?: TlsOptions
  subscribeFilter: string
  subscribeQos?: QoS
}

// electron-store'da saklanan profil (parola HARİÇ - parola safeStorage ile ayrı saklanır)
export interface SavedConnectionProfile {
  id: string
  name: string
  protocol: MqttProtocol
  host: string
  port: number
  path?: string
  clientId: string
  username?: string
  tls?: TlsOptions
  subscribeFilter: string
  subscribeQos?: QoS
  hasSavedPassword: boolean
}

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface StatusEvent {
  state: ConnectionState
  error?: string
}

export interface IncomingMessage {
  topic: string
  payload: string
  retain: boolean
  qos: QoS
  timestamp: number
}

export interface PublishRequest {
  topic: string
  payload: string
  retain: boolean
  qos: QoS
}

export interface SubscribeRequest {
  topicFilter: string
  qos: QoS
}

export interface ConnectResult {
  success: boolean
  error?: string
}

export interface FilePickResult {
  canceled: boolean
  filePath?: string
}

// window.mqttAPI - preload tarafından expose edilen yüzey
export interface MqttBridgeApi {
  connect: (config: ConnectionConfig) => Promise<ConnectResult>
  disconnect: () => Promise<void>
  subscribe: (req: SubscribeRequest) => Promise<ConnectResult>
  publish: (req: PublishRequest) => Promise<ConnectResult>
  pickFile: () => Promise<FilePickResult>

  listProfiles: () => Promise<SavedConnectionProfile[]>
  saveProfile: (
    profile: Omit<SavedConnectionProfile, 'id' | 'hasSavedPassword'>,
    password?: string
  ) => Promise<SavedConnectionProfile>
  deleteProfile: (id: string) => Promise<void>
  getProfilePassword: (id: string) => Promise<string | undefined>

  onStatus: (cb: (evt: StatusEvent) => void) => () => void
  onMessageBatch: (cb: (messages: IncomingMessage[]) => void) => () => void
}

declare global {
  interface Window {
    mqttAPI: MqttBridgeApi
  }
}
