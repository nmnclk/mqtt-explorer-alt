import type { Messages } from '../types'

export const tr: Messages = {
  locale: {
    switchToEn: 'İngilizceye geç',
    switchToTr: 'Türkçeye geç'
  },
  theme: {
    switchToLight: 'Açık temaya geç',
    switchToDark: 'Koyu temaya geç'
  },
  connection: {
    statusIdle: 'Bağlı değil',
    statusConnecting: 'Bağlanıyor…',
    statusConnected: 'Bağlı',
    statusError: 'Hata',
    updates: 'Güncellemeler',
    checkUpdates: 'Güncellemeleri kontrol et',
    connections: 'Bağlantılar',
    disconnect: 'Bağlantıyı kes',
    connect: 'Bağlan'
  },
  connectionDialog: {
    newProfile: 'Yeni bağlantı',
    connections: 'Bağlantılar',
    newConnection: 'Yeni bağlantı',
    noProfiles: 'Kayıtlı profil yok',
    settingsTitle: 'Bağlantı ayarları',
    close: 'Kapat',
    profileName: 'Profil adı',
    protocol: 'Protokol',
    port: 'Port',
    host: 'Host',
    path: 'Path',
    username: 'Kullanıcı adı',
    password: 'Parola',
    showPassword: 'Göster',
    hidePassword: 'Gizle',
    clientId: 'Client ID',
    subscribeFilter: 'Subscribe filtresi',
    tls: 'TLS',
    allowSelfSigned: 'Self-signed sertifikaya izin ver',
    pick: 'seç',
    delete: 'Sil',
    save: 'Kaydet',
    connect: 'Bağlan',
    closeBtn: 'Kapat'
  },
  app: {
    totalMessages: 'Toplam mesaj',
    clearTree: 'Ağacı temizle',
    clearConfirm: 'Tüm topic ağacı ve mesaj geçmişi silinecek. Emin misiniz?',
    cancel: 'Vazgeç',
    clear: 'Temizle',
    noUpdateTitle: 'En güncel sürümü kullanıyorsunuz',
    ok: 'Tamam'
  },
  topicTree: {
    filterPlaceholder: 'Topic ara / filtrele…',
    expandAll: 'Aç',
    collapseAll: 'Kapat',
    expandAllTitle: 'Tüm dalları aç',
    collapseAllTitle: 'Tüm dalları kapat',
    showPayloadInTree: 'Verileri ağaçta göster',
    subscribePlaceholder: 'Yeni subscribe filter (örn. powersarj/#)',
    subscribe: 'Sub',
    subscribed: (filter) => `Subscribe edildi: ${filter}`,
    error: 'Hata',
    empty: 'Henüz mesaj yok. Bağlanıp bir subscribe filter girin.',
    expand: 'Aç',
    collapse: 'Kapat',
    doubleClickHint: 'çift tıkla: aç/kapat'
  },
  messagePanel: {
    selectTopic: 'Sol panelden bir topic seçin',
    autoscroll: 'Otomatik kaydır',
    noMessages: 'Bu topic için henüz mesaj yok.',
    retained: 'retained'
  },
  publishBar: {
    topicRequired: 'Topic gerekli',
    published: 'Gönderildi ✓',
    error: (msg) => `Hata: ${msg}`,
    topicPlaceholder: 'Topic',
    payloadPlaceholder: 'Payload (düz metin veya JSON, örn. {"status":"ok"})',
    retain: 'Retain',
    publish: 'Publish'
  },
  updateDialog: {
    title: 'Güncelleme mevcut',
    version: (latest, current) => `Yeni sürüm: v${latest} (sizde v${current})`,
    instructionsAuto:
      'Uygulama güncellemeyi indirip kapanacak, kurulumu tamamlayıp yeniden açılacak — Cursor veya VS Code gibi.',
    instructionsManual:
      'Bu kurulumda otomatik güncelleme kullanılamıyor. GitHub Releases\'ten son sürümü indirin.',
    later: 'Sonra',
    updateNow: 'Şimdi güncelle',
    restartNow: 'Yeniden başlat ve güncelle',
    downloading: 'Güncelleme indiriliyor…',
    downloadProgress: (percent) => `%${Math.round(percent)} indirildi`,
    readyToInstall: 'Güncelleme indirildi. Kurulumu tamamlamak için yeniden başlatın.',
    downloadFailed: 'İndirme başarısız. Manuel indirmeyi deneyin.',
    openDownload: 'Manuel indir'
  }
}
