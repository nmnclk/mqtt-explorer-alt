import { app, BrowserWindow, ipcMain, dialog, safeStorage } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { randomUUID } from 'crypto'
import { MqttManager } from './mqttManager'
import { checkForUpdates, initUpdater, openReleasePage, scheduleUpdateChecks } from './updater'
import type {
  ConnectionConfig,
  SavedConnectionProfile,
  PublishRequest,
  SubscribeRequest
} from '../src/types/mqtt'

const mqttManager = new MqttManager()

interface StoreSchema {
  profiles: Record<string, SavedConnectionProfile>
  // safeStorage ile şifrelenmiş parola (base64), ayrı tutulur
  secrets: Record<string, string>
}

const store = new Store<StoreSchema>({
  defaults: { profiles: {}, secrets: {} }
})

let mainWindow: BrowserWindow | null = null

function isWindowLive(win: BrowserWindow | null): win is BrowserWindow {
  return win !== null && !win.isDestroyed()
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  if (!isWindowLive(mainWindow)) return
  mainWindow.webContents.send(channel, ...args)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f1219',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  if (mainWindow) {
    initUpdater(mainWindow)
    scheduleUpdateChecks()
  }

  // --- MQTT event köprüsü: main içindeki manager event'lerini renderer'a ilet ---
  mqttManager.onStatus((evt) => {
    sendToRenderer('mqtt:status', evt)
  })
  mqttManager.onMessageBatch((batch) => {
    sendToRenderer('mqtt:message-batch', batch)
  })

  // --- IPC: bağlantı yönetimi ---
  ipcMain.handle('mqtt:connect', async (_e, config: ConnectionConfig) => {
    return mqttManager.connect(config)
  })

  ipcMain.handle('mqtt:disconnect', async () => {
    await mqttManager.disconnect()
  })

  ipcMain.handle('mqtt:subscribe', async (_e, req: SubscribeRequest) => {
    return mqttManager.subscribe(req)
  })

  ipcMain.handle('mqtt:publish', async (_e, req: PublishRequest) => {
    return mqttManager.publish(req)
  })

  ipcMain.handle('mqtt:pickFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Sertifika / Anahtar dosyaları', extensions: ['pem', 'crt', 'key', 'cer'] }]
    })
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true }
    }
    return { canceled: false, filePath: result.filePaths[0] }
  })

  // --- IPC: kayıtlı bağlantı profilleri ---
  ipcMain.handle('profiles:list', async (): Promise<SavedConnectionProfile[]> => {
    const profiles = store.get('profiles')
    return Object.values(profiles)
  })

  ipcMain.handle(
    'profiles:save',
    async (
      _e,
      profile: Omit<SavedConnectionProfile, 'id' | 'hasSavedPassword'>,
      password?: string
    ): Promise<SavedConnectionProfile> => {
      const id = randomUUID()
      const hasSavedPassword = Boolean(password) && safeStorage.isEncryptionAvailable()

      if (hasSavedPassword && password) {
        const encrypted = safeStorage.encryptString(password)
        const secrets = store.get('secrets')
        secrets[id] = encrypted.toString('base64')
        store.set('secrets', secrets)
      }

      const saved: SavedConnectionProfile = { ...profile, id, hasSavedPassword }
      const profiles = store.get('profiles')
      profiles[id] = saved
      store.set('profiles', profiles)
      return saved
    }
  )

  ipcMain.handle(
    'profiles:update',
    async (
      _e,
      id: string,
      profile: Omit<SavedConnectionProfile, 'id' | 'hasSavedPassword'>,
      password?: string
    ): Promise<SavedConnectionProfile> => {
      const profiles = store.get('profiles')
      const existing = profiles[id]
      if (!existing) throw new Error('Profile not found')

      let hasSavedPassword = existing.hasSavedPassword
      const secrets = store.get('secrets')

      if (password !== undefined) {
        if (password && safeStorage.isEncryptionAvailable()) {
          secrets[id] = safeStorage.encryptString(password).toString('base64')
          hasSavedPassword = true
        } else {
          delete secrets[id]
          hasSavedPassword = false
        }
        store.set('secrets', secrets)
      }

      const updated: SavedConnectionProfile = { ...profile, id, hasSavedPassword }
      profiles[id] = updated
      store.set('profiles', profiles)
      return updated
    }
  )

  ipcMain.handle('profiles:delete', async (_e, id: string) => {
    const profiles = store.get('profiles')
    delete profiles[id]
    store.set('profiles', profiles)
    const secrets = store.get('secrets')
    delete secrets[id]
    store.set('secrets', secrets)
  })

  ipcMain.handle('profiles:getPassword', async (_e, id: string): Promise<string | undefined> => {
    const secrets = store.get('secrets')
    const encoded = secrets[id]
    if (!encoded || !safeStorage.isEncryptionAvailable()) return undefined
    try {
      return safeStorage.decryptString(Buffer.from(encoded, 'base64'))
    } catch {
      return undefined
    }
  })

  ipcMain.handle('app:getVersion', async () => app.getVersion())
  ipcMain.handle('updates:check', async () => checkForUpdates())
  ipcMain.handle('updates:openRelease', async (_e, url: string) => openReleasePage(url))

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  void mqttManager.disconnect()
  if (process.platform !== 'darwin') app.quit()
})
