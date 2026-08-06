import { app, shell } from 'electron'
import type { BrowserWindow } from 'electron'
import type { UpdateInfo } from '../src/types/update'

const GITHUB_LATEST_API = 'https://api.github.com/repos/nmnclk/mqtt-explorer-alt/releases/latest'
const RELEASE_PAGE = 'https://github.com/nmnclk/mqtt-explorer-alt/releases/latest'

let mainWindow: BrowserWindow | null = null

interface GitHubRelease {
  tag_name?: string
  html_url?: string
  body?: string
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

async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(GITHUB_LATEST_API, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MQTT-Explorer-Alt'
      }
    })
    if (!response.ok) return null
    return (await response.json()) as GitHubRelease
  } catch (err) {
    console.warn('Update check failed:', err)
    return null
  }
}

function notifyUpdate(info: UpdateInfo): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:available', info)
  }
}

export function initUpdater(win: BrowserWindow): void {
  mainWindow = win
}

export async function checkForUpdates(): Promise<UpdateInfo | null> {
  const release = await fetchLatestRelease()
  if (!release?.tag_name) return null

  const latestVersion = release.tag_name.replace(/^v/i, '')
  const currentVersion = app.getVersion()

  if (!isNewerVersion(latestVersion, currentVersion)) return null

  return {
    version: latestVersion,
    releaseUrl: release.html_url ?? RELEASE_PAGE,
    releaseNotes: release.body
  }
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
