export interface UpdateInfo {
  version: string
  releaseUrl: string
  releaseNotes?: string
}

export interface UpdateApi {
  check: () => Promise<UpdateInfo | null>
  openRelease: (url: string) => Promise<void>
  getAppVersion: () => Promise<string>
  onUpdateAvailable: (cb: (info: UpdateInfo) => void) => () => void
}

declare global {
  interface Window {
    updateAPI: UpdateApi
  }
}
