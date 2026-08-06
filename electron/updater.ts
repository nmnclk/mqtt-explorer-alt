import { app, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { BrowserWindow } from 'electron'
import type { UpdateInfo, UpdateProgress } from '../src/types/update'

const GITHUB_LATEST_API = 'https://api.github.com/repos/nmnclk/mqtt-explorer-alt/releases/latest'
const RELEASE_PAGE = 'https://github.com/nmnclk/mqtt-explorer-alt/releases/latest'

let mainWindow: BrowserWindow | null = null

function sendToRenderer(channel: string, ...args: unknown[]): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args)
  }
}

function notifyUpdate(info: UpdateInfo): void {
  sendToRenderer('update:available', info)
}

function parseVersion(version: string): number[] {
  return version
    .replace(/^v/i, '')
    .split('.')
    .map((part) => parseInt(part, 10) || 0)
}

function isNewerVersion(latest: string, current: string): boolean {
  const a = parseVersion(latest)
  const b = parseVersion(current)
  const len = Math.max(a.length, b.length)

  for (let i = 0; i < len; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0)
    if (diff !== 0) return diff > 0
  }
  return false
}

async function fallbackGitHubCheck(): Promise<UpdateInfo | null> {
  try {
    const response = await fetch(GITHUB_LATEST_API, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MQTT-Explorer-Alt'
      }
    })
    if (!response.ok) return null

    const release = (await response.json()) as {
      tag_name?: string
      html_url?: string
      body?: string
    }
    if (!release.tag_name) return null

    const latestVersion = release.tag_name.replace(/^v/i, '')
    if (!isNewerVersion(latestVersion, app.getVersion())) return null

    return {
      version: latestVersion,
      releaseUrl: release.html_url ?? RELEASE_PAGE,
      releaseNotes: release.body,
      autoInstallSupported: false
    }
  } catch {
    return null
  }
}

export function initUpdater(win: BrowserWindow): void {
  mainWindow = win
  if (!app.isPackaged) return

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.disableDifferentialDownload = true

  autoUpdater.on('update-available', (meta) => {
    notifyUpdate({
      version: meta.version,
      releaseUrl: RELEASE_PAGE,
      releaseNotes: typeof meta.releaseNotes === 'string' ? meta.releaseNotes : undefined,
      autoInstallSupported: true
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    const payload: UpdateProgress = {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    }
    sendToRenderer('update:download-progress', payload)
  })

  autoUpdater.on('update-downloaded', () => {
    sendToRenderer('update:downloaded')
  })

  autoUpdater.on('error', (err) => {
    console.warn('Auto-update error:', err.message)
    sendToRenderer('update:error', err.message)
  })
}

export async function checkForUpdates(): Promise<UpdateInfo | null> {
  if (!app.isPackaged) return null

  try {
    const result = await autoUpdater.checkForUpdates()
    const update = result?.updateInfo
    if (update && isNewerVersion(update.version, app.getVersion())) {
      return {
        version: update.version,
        releaseUrl: RELEASE_PAGE,
        releaseNotes: typeof update.releaseNotes === 'string' ? update.releaseNotes : undefined,
        autoInstallSupported: true
      }
    }
    return null
  } catch (err) {
    console.warn('electron-updater check failed, using GitHub fallback:', err)
    return fallbackGitHubCheck()
  }
}

export async function downloadUpdate(): Promise<{ success: boolean; error?: string }> {
  if (!app.isPackaged) {
    return { success: false, error: 'Not packaged' }
  }

  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true)
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
