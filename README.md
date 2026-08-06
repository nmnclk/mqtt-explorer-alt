# MQTT Explorer Alt

A modern cross-platform MQTT client for macOS, Windows, and Linux.

> 🇹🇷 [Türkçe dokümantasyon](README.tr.md)

## Why this project?

[MQTT Explorer](https://github.com/thomasnordquist/MQTT-Explorer) remains one of the best MQTT tools ever made — topic tree, live message stream, and an intuitive UI. The repository is **still active** (commits continue, v0.4 beta is in development), but the last **stable release** — [v0.3.5](https://github.com/thomasnordquist/MQTT-Explorer/releases/tag/v0.3.5) — dates back to **July 2019**. The downloadable macOS build relies on an outdated Electron stack and **does not run properly on Apple Silicon**.

MQTT Explorer Alt brings back the core experience with **Electron 33** on **macOS (Apple Silicon + Intel)**, **Windows**, and **Linux**. It is **not** a fork or continuation of the official project — it is an independent, open-source alternative.

## Features

- `mqtt://`, `mqtts://`, `ws://`, `wss://` protocol support
- Topic tree with live message view
- Publish / Subscribe
- TLS certificate support
- Saved connection profiles
- Native builds for macOS (arm64 + x64), Windows (x64 + arm64), Linux (x64 + arm64)

## Download

Grab the latest build for your platform from **[Releases](https://github.com/nmnclk/mqtt-explorer-alt/releases)**.

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `*-mac-arm64.dmg` |
| macOS (Intel) | `*-mac-x64.dmg` |
| Windows (64-bit) | `*-win-x64.exe` |
| Windows (ARM) | `*-win-arm64.exe` |
| Linux (64-bit) | `*-linux-x64.AppImage` |
| Linux (ARM64) | `*-linux-arm64.AppImage` |

### macOS

1. Open the `.dmg` file
2. Drag **MQTT Explorer Alt** into **Applications**
3. Launch the app

#### Security warning — "Open Anyway"

This app is not yet notarized by Apple (free distribution). macOS may block it on first launch. The app is not malware.

**Fix:**

1. Try opening the app once (it will be blocked)
2. Go to **System Settings → Privacy & Security**
3. Click **"Open MQTT Explorer Alt Anyway"** or **"Open Anyway"** at the bottom

Or run in Terminal:

```bash
xattr -cr "/Applications/MQTT Explorer Alt.app"
```

> With an Apple Developer Program membership ($99/year), proper signing and notarization would remove this step.

### Windows

1. Download and run the `.exe` installer
2. If Windows SmartScreen blocks the app, click **More info → Run anyway** (unsigned build)

### Linux

```bash
chmod +x MQTT\ Explorer\ Alt-*-linux-x64.AppImage
./MQTT\ Explorer\ Alt-*-linux-x64.AppImage
```

## Updates

The packaged app checks [GitHub Releases](https://github.com/nmnclk/mqtt-explorer-alt/releases) on startup and every 6 hours. When a new version is available, a dialog appears with a link to the download page.

You can also click **Updates** in the top bar to check manually.

> Automatic in-app installation requires code signing. Until then, download the new build and replace the app manually.

## Development

```bash
git clone https://github.com/nmnclk/mqtt-explorer-alt.git
cd mqtt-explorer-alt
npm install
npm run dev          # development mode
npm run build:dmg    # macOS DMG
npm run build:win    # Windows installer
npm run build:linux  # Linux AppImage
npm run build:all    # all platforms (on current host)
npm run install:mac  # build and install to Applications (macOS)
```

## Stack

- [Electron](https://www.electronjs.org/) 33 + [electron-vite](https://electron-vite.org/)
- [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- [mqtt.js](https://github.com/mqttjs/MQTT.js)

## Credits

Inspired by [thomasnordquist/MQTT-Explorer](https://github.com/thomasnordquist/MQTT-Explorer). Thank you to the original authors. MQTT Explorer Alt is not affiliated with the official project.

## License

MIT — see [LICENSE](LICENSE).
