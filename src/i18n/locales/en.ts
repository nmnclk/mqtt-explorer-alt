import type { Messages } from '../types'

export const en: Messages = {
  locale: {
    switchToEn: 'Switch to English',
    switchToTr: 'Switch to Turkish'
  },
  theme: {
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme'
  },
  connection: {
    statusIdle: 'Disconnected',
    statusConnecting: 'Connecting…',
    statusConnected: 'Connected',
    statusError: 'Error',
    updates: 'Updates',
    checkUpdates: 'Check for updates',
    connections: 'Connections',
    disconnect: 'Disconnect',
    connect: 'Connect'
  },
  connectionDialog: {
    newProfile: 'New connection',
    connections: 'Connections',
    newConnection: 'New connection',
    noProfiles: 'No saved profiles',
    settingsTitle: 'Connection settings',
    close: 'Close',
    profileName: 'Profile name',
    protocol: 'Protocol',
    port: 'Port',
    host: 'Host',
    path: 'Path',
    username: 'Username',
    password: 'Password',
    showPassword: 'Show',
    hidePassword: 'Hide',
    clientId: 'Client ID',
    subscribeFilter: 'Subscribe filter',
    tls: 'TLS',
    allowSelfSigned: 'Allow self-signed certificate',
    pick: 'pick',
    delete: 'Delete',
    save: 'Save',
    connect: 'Connect',
    closeBtn: 'Close'
  },
  app: {
    totalMessages: 'Total messages',
    clearTree: 'Clear tree',
    clearConfirm: 'The entire topic tree and message history will be deleted. Are you sure?',
    cancel: 'Cancel',
    clear: 'Clear',
    noUpdateTitle: 'You are on the latest version',
    ok: 'OK'
  },
  topicTree: {
    filterPlaceholder: 'Search / filter topics…',
    expandAll: 'Expand',
    collapseAll: 'Collapse',
    expandAllTitle: 'Expand all branches',
    collapseAllTitle: 'Collapse all branches',
    showPayloadInTree: 'Show data in tree',
    subscribePlaceholder: 'New subscribe filter (e.g. home/#)',
    subscribe: 'Sub',
    subscribed: (filter) => `Subscribed: ${filter}`,
    error: 'Error',
    empty: 'No messages yet. Connect and enter a subscribe filter.',
    expand: 'Expand',
    collapse: 'Collapse',
    doubleClickHint: 'double-click: expand/collapse'
  },
  messagePanel: {
    selectTopic: 'Select a topic from the left panel',
    autoscroll: 'Autoscroll',
    noMessages: 'No messages for this topic yet.',
    retained: 'retained'
  },
  publishBar: {
    topicRequired: 'Topic is required',
    published: 'Sent ✓',
    error: (msg) => `Error: ${msg}`,
    topicPlaceholder: 'Topic',
    payloadPlaceholder: 'Payload (plain text or JSON, e.g. {"status":"ok"})',
    retain: 'Retain',
    publish: 'Publish'
  },
  updateDialog: {
    title: 'Update available',
    version: (latest, current) => `New version: v${latest} (you have v${current})`,
    instructions:
      'Download the latest build from GitHub Releases and install it over your current version. The app is not code-signed yet; use the same "Open Anyway" steps after updating.',
    later: 'Later',
    openDownload: 'Open download page'
  }
}
