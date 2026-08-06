export interface UpdateInfo {
  version: string
  releaseUrl: string
  releaseNotes?: string
  autoInstallSupported: boolean
}

export interface UpdateProgress {
  percent: number
  transferred: number
  total: number
}

export type UpdatePhase = 'available' | 'downloading' | 'ready' | 'error'

export interface UpdateApi {
  check: () => Promise<UpdateInfo | null>
  download: () => Promise<{ success: boolean; error?: string }>
  install: () => Promise<void>
  openRelease: (url: string) => Promise<void>
  getAppVersion: () => Promise<string>
  onUpdateAvailable: (cb: (info: UpdateInfo) => void) => () => void
  onDownloadProgress: (cb: (progress: UpdateProgress) => void) => () => void
  onUpdateDownloaded: (cb: () => void) => () => void
  onUpdateError: (cb: (message: string) => void) => () => void
}

declare global {
  interface Window {
    updateAPI: UpdateApi
  }
}
