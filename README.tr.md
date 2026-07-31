# MQTT Explorer Alt

Apple Silicon (M1/M2/M3/M4) Mac'lerde çalışan, modern bir MQTT istemcisi.

> 🇬🇧 [English documentation](README.md)

## Neden bu proje?

[MQTT Explorer](https://github.com/thomasnordquist/MQTT-Explorer) yılların favori MQTT aracı — topic ağacı, canlı mesaj akışı ve sezgisel arayüzüyle hâlâ en iyi deneyimlerden biri. Repo **hâlâ aktif** (commit'ler devam ediyor, 0.4 beta sürümü geliştiriliyor); fakat son **kararlı (stable) release** [v0.3.5](https://github.com/thomasnordquist/MQTT-Explorer/releases/tag/v0.3.5) **Temmuz 2019**'dan beri yayınlanmadı. İndirilebilir macOS build'i eski Electron mimarisine dayanıyor ve **Apple Silicon çipli Mac'lerde düzgün çalışmıyor**.

Bu proje, MQTT Explorer'ın sunduğu temel deneyimi **Electron 33 + arm64** ile yeniden hayata geçirir. Resmi MQTT Explorer projesinin bir fork'u veya devamı değildir; bağımsız, açık kaynak bir alternatiftir.

## Özellikler

- `mqtt://`, `mqtts://`, `ws://`, `wss://` protokol desteği
- Topic ağacı ve canlı mesaj görüntüleme
- Publish / Subscribe
- TLS sertifika desteği
- Bağlantı profillerini kaydetme
- Native Apple Silicon (arm64) desteği

## İndir

**[Releases](https://github.com/nmnclk/mqtt-explorer-alt/releases)** sayfasından en son `.dmg` dosyasını indirin.

### Kurulum

1. `.dmg` dosyasını açın
2. **MQTT Explorer Alt** uygulamasını **Applications** klasörüne sürükleyin
3. Uygulamayı başlatın

### macOS güvenlik uyarısı — "Yine de Aç"

Uygulama henüz Apple tarafından notarize edilmemiştir (ücretsiz dağıtım). İlk açılışta macOS engelleyebilir. Bu normaldir; uygulama kötü amaçlı yazılım değildir.

**Çözüm:**

1. Uygulamayı bir kez açmayı deneyin (engellenecektir)
2. **Sistem Ayarları → Gizlilik ve Güvenlik**'e gidin
3. Altta **"MQTT Explorer Alt yine de aç"** veya **"Yine de Aç"** butonuna tıklayın

Alternatif olarak Terminal'de:

```bash
xattr -cr "/Applications/MQTT Explorer Alt.app"
```

> Apple Developer Program ($99/yıl) ile imzalama ve notarizasyon eklendiğinde bu adım gerekmez.

## Geliştirme

```bash
git clone https://github.com/nmnclk/mqtt-explorer-alt.git
cd mqtt-explorer-alt
npm install
npm run dev          # geliştirme modu
npm run build:dmg    # macOS DMG oluştur
npm run install:mac  # derle ve Applications'a kur
```

## Teknoloji

- [Electron](https://www.electronjs.org/) 33 + [electron-vite](https://electron-vite.org/)
- [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- [mqtt.js](https://github.com/mqttjs/MQTT.js)

## Orijinal projeye saygı

Bu uygulama [thomasnordquist/MQTT-Explorer](https://github.com/thomasnordquist/MQTT-Explorer) projesinden ilham almıştır. Orijinal projenin tüm emeğine teşekkürler. MQTT Explorer Alt, resmi proje ile ilişkili değildir.

## Lisans

MIT — ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.
