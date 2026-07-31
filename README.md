# MQTT Explorer Alt

A modern MQTT client for Apple Silicon Macs (M1/M2/M3/M4).

> 🇹🇷 [Türkçe dokümantasyon](README.tr.md)

## Why this project?

[MQTT Explorer](https://github.com/thomasnordquist/MQTT-Explorer) remains one of the best MQTT tools ever made — topic tree, live message stream, and an intuitive UI. The repository is **still active** (commits continue, v0.4 beta is in development), but the last **stable release** — [v0.3.5](https://github.com/thomasnordquist/MQTT-Explorer/releases/tag/v0.3.5) — dates back to **July 2019**. The downloadable macOS build relies on an outdated Electron stack and **does not run properly on Apple Silicon**.

MQTT Explorer Alt brings back the core experience with **Electron 33 + native arm64**. It is **not** a fork or continuation of the official project — it is an independent, open-source alternative.

## Features

- `mqtt://`, `mqtts://`, `ws://`, `wss://` protocol support
- Topic tree with live message view
- Publish / Subscribe
- TLS certificate support
- Saved connection profiles
- Native Apple Silicon (arm64) build

## Download

Grab the latest `.dmg` from **[Releases](https://github.com/nmnclk/mqtt-explorer-alt/releases)**.

### Install

1. Open the `.dmg` file
2. Drag **MQTT Explorer Alt** into **Applications**
3. Launch the app

### macOS security warning — "Open Anyway"

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

## Development

```bash
git clone https://github.com/nmnclk/mqtt-explorer-alt.git
cd mqtt-explorer-alt
npm install
npm run dev          # development mode
npm run build:dmg    # build macOS DMG
npm run install:mac  # build and install to Applications
```

## Stack

- [Electron](https://www.electronjs.org/) 33 + [electron-vite](https://electron-vite.org/)
- [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- [mqtt.js](https://github.com/mqttjs/MQTT.js)

## Credits

Inspired by [thomasnordquist/MQTT-Explorer](https://github.com/thomasnordquist/MQTT-Explorer). Thank you to the original authors. MQTT Explorer Alt is not affiliated with the official project.

## License

MIT — see [LICENSE](LICENSE).
