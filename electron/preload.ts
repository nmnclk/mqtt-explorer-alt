import { contextBridge, ipcRenderer } from 'electron'
import type {
  ConnectionConfig,
  ConnectResult,
  FilePickResult,
  IncomingMessage,
  MqttBridgeApi,
  PublishRequest,
  SavedConnectionProfile,
  StatusEvent,
  SubscribeRequest
} from '../src/types/mqtt'
import type { UpdateApi, UpdateInfo } from '../src/types/update'

const mqttAPI: MqttBridgeApi = {
  connect: (config: ConnectionConfig): Promise<ConnectResult> => ipcRenderer.invoke('mqtt:connect', config),
  disconnect: (): Promise<void> => ipcRenderer.invoke('mqtt:disconnect'),
  subscribe: (req: SubscribeRequest): Promise<ConnectResult> => ipcRenderer.invoke('mqtt:subscribe', req),
  publish: (req: PublishRequest): Promise<ConnectResult> => ipcRenderer.invoke('mqtt:publish', req),
  pickFile: (): Promise<FilePickResult> => ipcRenderer.invoke('mqtt:pickFile'),

  listProfiles: (): Promise<SavedConnectionProfile[]> => ipcRenderer.invoke('profiles:list'),
  saveProfile: (profile, password) => ipcRenderer.invoke('profiles:save', profile, password),
  updateProfile: (id, profile, password) => ipcRenderer.invoke('profiles:update', id, profile, password),
  deleteProfile: (id: string): Promise<void> => ipcRenderer.invoke('profiles:delete', id),
  getProfilePassword: (id: string): Promise<string | undefined> =>
    ipcRenderer.invoke('profiles:getPassword', id),

  onStatus: (cb: (evt: StatusEvent) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, evt: StatusEvent): void => cb(evt)
    ipcRenderer.on('mqtt:status', listener)
    return () => ipcRenderer.removeListener('mqtt:status', listener)
  },

  onMessageBatch: (cb: (messages: IncomingMessage[]) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, batch: IncomingMessage[]): void => cb(batch)
    ipcRenderer.on('mqtt:message-batch', listener)
    return () => ipcRenderer.removeListener('mqtt:message-batch', listener)
  }
}

const updateAPI: UpdateApi = {
  check: (): Promise<UpdateInfo | null> => ipcRenderer.invoke('updates:check'),
  openRelease: (url: string): Promise<void> => ipcRenderer.invoke('updates:openRelease', url),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  onUpdateAvailable: (cb: (info: UpdateInfo) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, info: UpdateInfo): void => cb(info)
    ipcRenderer.on('update:available', listener)
    return () => ipcRenderer.removeListener('update:available', listener)
  }
}

contextBridge.exposeInMainWorld('mqttAPI', mqttAPI)
contextBridge.exposeInMainWorld('updateAPI', updateAPI)
