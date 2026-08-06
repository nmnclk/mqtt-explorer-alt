import { app, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { BrowserWindow } from 'electron'
import type { UpdateInfo } from '../src/types/update'

const RELEASE_PAGE = 'https://github.com/nmnclk/mqtt-explorer-alt/releases/latest'

let mainWindow: BrowserWindow | null = null

function notifyUpdate(info: UpdateInfo): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:available', info)
  }
}

export function initUpdater(win: BrowserWindow): void {
  mainWindow = win
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.disableDifferentialDownload = true

  autoUpdater.on('update-available', (meta) => {
    notifyUpdate({
      version: meta.version,
      releaseUrl: RELEASE_PAGE,
      releaseNotes: typeof meta.releaseNotes === 'string' ? meta.releaseNotes : undefined
    })
  })

  // İmzasız dağıtımda indirme başarısız olabilir; yine de sürüm kontrolü çalışır.
  autoUpdater.on('error', (err) => {
    console.warn('Update check failed:', err.message)
  })
}

export async function checkForUpdates(): Promise<UpdateInfo | null> {
  if (!app.isPackaged) return null

  try {
    const result = await autoUpdater.checkForUpdates()
    const update = result?.updateInfo
    if (update && update.version !== app.getVersion()) {
      const info: UpdateInfo = {
        version: update.version,
        releaseUrl: RELEASE_PAGE,
        releaseNotes: typeof update.releaseNotes === 'string' ? update.releaseNotes : undefined
      }
      return info
    }
  } catch {
    // GitHub API / electron-updater hatası — sessizce geç
  }

  return null
}

export function scheduleUpdateChecks(): void {
  if (!app.isPackaged) return

  const run = (): void => {
    void checkForUpdates().then((info) => {
      if (info) notifyUpdate(info)
    })
  }

  setTimeout(run, 12_000)
  setInterval(run, 6 * 60 * 60 * 1000)
}

export async function openReleasePage(url: string): Promise<void> {
  await shell.openExternal(url)
}
