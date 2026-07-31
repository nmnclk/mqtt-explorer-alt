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

// nodeIntegration: false, contextIsolation: true -> renderer'a sadece bu yüzey açılır.
const api: MqttBridgeApi = {
  connect: (config: ConnectionConfig): Promise<ConnectResult> => ipcRenderer.invoke('mqtt:connect', config),
  disconnect: (): Promise<void> => ipcRenderer.invoke('mqtt:disconnect'),
  subscribe: (req: SubscribeRequest): Promise<ConnectResult> => ipcRenderer.invoke('mqtt:subscribe', req),
  publish: (req: PublishRequest): Promise<ConnectResult> => ipcRenderer.invoke('mqtt:publish', req),
  pickFile: (): Promise<FilePickResult> => ipcRenderer.invoke('mqtt:pickFile'),

  listProfiles: (): Promise<SavedConnectionProfile[]> => ipcRenderer.invoke('profiles:list'),
  saveProfile: (profile, password) => ipcRenderer.invoke('profiles:save', profile, password),
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

contextBridge.exposeInMainWorld('mqttAPI', api)
