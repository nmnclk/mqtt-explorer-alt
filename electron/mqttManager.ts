import mqtt, { MqttClient, IClientOptions } from 'mqtt'
import { readFileSync } from 'fs'
import type {
  ConnectionConfig,
  IncomingMessage,
  StatusEvent,
  PublishRequest,
  SubscribeRequest,
  ConnectResult,
  QoS
} from '../src/types/mqtt'

const BATCH_WINDOW_MS = 120

type StatusListener = (evt: StatusEvent) => void
type MessageBatchListener = (messages: IncomingMessage[]) => void

/**
 * MqttManager: main process içinde tek bir mqtt.js bağlantısını yönetir.
 * Node.js ortamında çalıştığı için mqtt:// ve mqtts:// (ham TCP/TLS) protokollerini
 * hiçbir bridge/proxy olmadan doğrudan açabilir. ws://, wss:// de desteklenir.
 *
 * Yüksek mesaj hacminde renderer'ı boğmamak için gelen mesajlar BATCH_WINDOW_MS'lik
 * pencerelerde biriktirilir ve tek seferde gönderilir.
 */
export class MqttManager {
  private client: MqttClient | null = null
  private statusListeners: Set<StatusListener> = new Set()
  private messageListeners: Set<MessageBatchListener> = new Set()

  private pendingMessages: IncomingMessage[] = []
  private flushTimer: ReturnType<typeof setInterval> | null = null

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  onMessageBatch(listener: MessageBatchListener): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  private emitStatus(evt: StatusEvent): void {
    for (const l of this.statusListeners) l(evt)
  }

  private startBatchFlusher(): void {
    if (this.flushTimer) return
    this.flushTimer = setInterval(() => {
      if (this.pendingMessages.length === 0) return
      const batch = this.pendingMessages
      this.pendingMessages = []
      for (const l of this.messageListeners) l(batch)
    }, BATCH_WINDOW_MS)
  }

  private stopBatchFlusher(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.pendingMessages = []
  }

  private buildUrl(config: ConnectionConfig): string {
    const { protocol, host, port, path } = config
    if (protocol === 'ws' || protocol === 'wss') {
      const p = path && path.startsWith('/') ? path : `/${path ?? 'mqtt'}`
      return `${protocol}://${host}:${port}${p}`
    }
    return `${protocol}://${host}:${port}`
  }

  private buildOptions(config: ConnectionConfig): IClientOptions {
    const options: IClientOptions = {
      clientId: config.clientId,
      username: config.username || undefined,
      password: config.password || undefined,
      reconnectPeriod: 3000,
      connectTimeout: 15000,
      clean: true
    }

    if ((config.protocol === 'mqtts' || config.protocol === 'wss') && config.tls) {
      options.rejectUnauthorized = config.tls.rejectUnauthorized
      try {
        if (config.tls.caPath) options.ca = readFileSync(config.tls.caPath)
        if (config.tls.certPath) options.cert = readFileSync(config.tls.certPath)
        if (config.tls.keyPath) options.key = readFileSync(config.tls.keyPath)
      } catch (e) {
        // Sertifika dosyası okunamazsa bağlantı denemesi yine de devam eder,
        // mqtt.js kendi hata mesajını verecektir.
        console.error('TLS sertifika dosyası okunamadı:', e)
      }
    }

    return options
  }

  async connect(config: ConnectionConfig): Promise<ConnectResult> {
    await this.disconnect()

    const url = this.buildUrl(config)
    const options = this.buildOptions(config)

    this.emitStatus({ state: 'connecting' })
    this.startBatchFlusher()

    return new Promise((resolve) => {
      let settled = false
      const client = mqtt.connect(url, options)
      this.client = client

      client.on('connect', () => {
        this.emitStatus({ state: 'connected' })
        if (config.subscribeFilter) {
          client.subscribe(config.subscribeFilter, { qos: (config.subscribeQos ?? 0) as QoS }, (err) => {
            if (err) console.error('Otomatik subscribe hatası:', err)
          })
        }
        if (!settled) {
          settled = true
          resolve({ success: true })
        }
      })

      client.on('reconnect', () => {
        this.emitStatus({ state: 'connecting' })
      })

      client.on('close', () => {
        this.emitStatus({ state: 'disconnected' })
      })

      client.on('error', (err) => {
        this.emitStatus({ state: 'error', error: err.message })
        if (!settled) {
          settled = true
          resolve({ success: false, error: err.message })
        }
      })

      client.on('message', (topic, payloadBuf, packet) => {
        this.pendingMessages.push({
          topic,
          payload: payloadBuf.toString('utf8'),
          retain: packet.retain,
          qos: packet.qos as QoS,
          timestamp: Date.now()
        })
      })

      // Bağlantı çok uzun sürerse timeout güvenliği (mqtt.js connectTimeout zaten var,
      // ama Promise'in asla settle olmama ihtimaline karşı ekstra güvenlik)
      setTimeout(() => {
        if (!settled) {
          settled = true
          resolve({ success: true }) // bağlantı arka planda denemeye devam ediyor, UI status event'lerinden takip eder
        }
      }, 16000)
    })
  }

  async disconnect(): Promise<void> {
    this.stopBatchFlusher()
    if (this.client) {
      await new Promise<void>((resolve) => {
        this.client?.end(true, {}, () => resolve())
      })
      this.client = null
    }
    this.emitStatus({ state: 'disconnected' })
  }

  async subscribe(req: SubscribeRequest): Promise<ConnectResult> {
    if (!this.client) return { success: false, error: 'Bağlantı yok' }
    return new Promise((resolve) => {
      this.client?.subscribe(req.topicFilter, { qos: req.qos }, (err) => {
        if (err) resolve({ success: false, error: err.message })
        else resolve({ success: true })
      })
    })
  }

  async publish(req: PublishRequest): Promise<ConnectResult> {
    if (!this.client) return { success: false, error: 'Bağlantı yok' }
    return new Promise((resolve) => {
      this.client?.publish(req.topic, req.payload, { qos: req.qos, retain: req.retain }, (err) => {
        if (err) resolve({ success: false, error: err.message })
        else resolve({ success: true })
      })
    })
  }
}
