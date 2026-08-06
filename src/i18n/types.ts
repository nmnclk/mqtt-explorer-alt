export type Locale = 'tr' | 'en'

export const LOCALE_STORAGE_KEY = 'mqtt-explorer-locale'

export interface Messages {
  locale: {
    switchToEn: string
    switchToTr: string
  }
  theme: {
    switchToLight: string
    switchToDark: string
  }
  connection: {
    statusIdle: string
    statusConnecting: string
    statusConnected: string
    statusError: string
    updates: string
    checkUpdates: string
    connections: string
    disconnect: string
    connect: string
  }
  connectionDialog: {
    newProfile: string
    connections: string
    newConnection: string
    noProfiles: string
    settingsTitle: string
    close: string
    profileName: string
    protocol: string
    port: string
    host: string
    path: string
    username: string
    password: string
    showPassword: string
    hidePassword: string
    clientId: string
    subscribeFilter: string
    tls: string
    allowSelfSigned: string
    pick: string
    delete: string
    save: string
    connect: string
    closeBtn: string
  }
  app: {
    totalMessages: string
    clearTree: string
    clearConfirm: string
    cancel: string
    clear: string
    noUpdateTitle: string
    ok: string
  }
  topicTree: {
    filterPlaceholder: string
    expandAll: string
    collapseAll: string
    expandAllTitle: string
    collapseAllTitle: string
    showPayloadInTree: string
    subscribePlaceholder: string
    subscribe: string
    subscribed: (filter: string) => string
    error: string
    empty: string
    expand: string
    collapse: string
    doubleClickHint: string
  }
  messagePanel: {
    selectTopic: string
    autoscroll: string
    noMessages: string
    retained: string
  }
  publishBar: {
    topicRequired: string
    published: string
    error: (msg: string) => string
    topicPlaceholder: string
    payloadPlaceholder: string
    retain: string
    publish: string
  }
  updateDialog: {
    title: string
    version: (latest: string, current: string) => string
    instructionsAuto: string
    instructionsManual: string
    later: string
    updateNow: string
    restartNow: string
    downloading: string
    downloadProgress: (percent: number) => string
    readyToInstall: string
    downloadFailed: string
    openDownload: string
  }
}
