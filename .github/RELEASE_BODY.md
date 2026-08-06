## What's new in v1.0.7

- **One-click auto-update** — download, restart, and install in-app (Cursor-style)
- CI now publishes `latest*.yml` + ZIP metadata required by `electron-updater`
- Manual download remains as fallback when auto-install is unavailable

## v1.0.7 yenilikleri

- **Tek tıkla otomatik güncelleme** — uygulama içinden indir, yeniden başlat, kur (Cursor tarzı)
- CI artık `electron-updater` için gerekli `latest*.yml` ve ZIP dosyalarını yayınlıyor
- Otomatik kurulum mümkün değilse manuel indirme yedek olarak kalır

---

## What's new in v1.0.6

- **English / Turkish** — language toggle (EN/TR) in the top bar; preference is saved
- **Show data in tree** — optional last payload preview per topic in the tree

## v1.0.6 yenilikleri

- **İngilizce / Türkçe** — üst barda dil değiştirme (EN/TR); tercih kaydedilir
- **Verileri ağaçta göster** — topic ağacında son payload önizlemesi

---

## What's new in v1.0.5

- **Fix update checker** — detects new GitHub releases without requiring `latest-mac.yml` metadata

## v1.0.5 yenilikleri

- **Güncelleme kontrolü düzeltmesi** — GitHub Releases API ile sürüm karşılaştırması (`latest-mac.yml` gerekmez)

---

## What's new in v1.0.4

- **Signal theme** — custom dark/light color palette with theme toggle (☀/☾)
- **Topic tree** — improved layout, larger expand/collapse targets, expand/collapse all buttons
- **Performance** — smoother tree rendering, hover flicker fix, throttled tree updates
- **UI polish** — Turkish labels, connection dialog aligned with app theme, IBM Plex fonts

## v1.0.4 yenilikleri

- **Signal teması** — özel koyu/açık renk paleti ve tema değiştirme (☀/☾)
- **Topic ağacı** — geliştirilmiş görünüm, kolay aç/kapat, tümünü aç/kapat butonları
- **Performans** — daha akıcı ağaç render'ı, hover titremesi düzeltmesi, toplu güncelleme
- **Arayüz** — Türkçe etiketler, bağlantı penceresi tema uyumu, IBM Plex fontları

---


The app is not notarized yet. After installing from the DMG, run once in Terminal:

```bash
xattr -cr "/Applications/MQTT Explorer Alt.app"
```

Then open from Applications. Alternatively: **System Settings → Privacy & Security → Open Anyway**.

## Downloads

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `MQTT-Explorer-Alt-<version>-mac-arm64.dmg` |
| macOS (Intel) | `MQTT-Explorer-Alt-<version>-mac-x64.dmg` |
| Windows (64-bit) | `MQTT-Explorer-Alt-<version>-win-x64.exe` |
| Windows (ARM) | `MQTT-Explorer-Alt-<version>-win-arm64.exe` |
| Linux (64-bit) | `MQTT-Explorer-Alt-<version>-linux-x64.AppImage` |
| Linux (ARM64) | `MQTT-Explorer-Alt-<version>-linux-arm64.AppImage` |

### Install

**macOS:** Open `.dmg` → drag to Applications. If blocked: **System Settings → Privacy & Security → Open Anyway**, or `xattr -cr "/Applications/MQTT Explorer Alt.app"`.

**Windows:** Run `.exe` installer. If SmartScreen warns, click **More info → Run anyway** (unsigned build).

**Linux:** `chmod +x MQTT-Explorer-Alt-*-linux-x64.AppImage && ./MQTT-Explorer-Alt-*-linux-x64.AppImage`

---

### macOS — "hasar görmüş" veya engellenme uyarısı

Uygulama henüz notarize edilmedi. DMG'den kurduktan sonra Terminal'de bir kez:

```bash
xattr -cr "/Applications/MQTT Explorer Alt.app"
```

Ardından Applications'dan açın. Alternatif: **Sistem Ayarları → Gizlilik ve Güvenlik → Yine de Aç**.

## İndirme

| Platform | Dosya |
|----------|-------|
| macOS (Apple Silicon) | `MQTT-Explorer-Alt-<version>-mac-arm64.dmg` |
| macOS (Intel) | `MQTT-Explorer-Alt-<version>-mac-x64.dmg` |
| Windows (64-bit) | `MQTT-Explorer-Alt-<version>-win-x64.exe` |
| Windows (ARM) | `MQTT-Explorer-Alt-<version>-win-arm64.exe` |
| Linux (64-bit) | `MQTT-Explorer-Alt-<version>-linux-x64.AppImage` |
| Linux (ARM64) | `MQTT-Explorer-Alt-<version>-linux-arm64.AppImage` |

### Kurulum

**macOS:** `.dmg` aç → Applications'a sürükle. Engellenirse: **Sistem Ayarları → Gizlilik ve Güvenlik → Yine de Aç**, veya `xattr -cr "/Applications/MQTT Explorer Alt.app"`.

**Windows:** `.exe` kurulum dosyasını çalıştır. SmartScreen uyarısı çıkarsa **Ek bilgi → Yine de çalıştır**.

**Linux:** `chmod +x MQTT-Explorer-Alt-*-linux-x64.AppImage && ./MQTT-Explorer-Alt-*-linux-x64.AppImage`
