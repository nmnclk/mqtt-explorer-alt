import { useEffect, useState } from 'react'
import type { PublishRequest, QoS } from '../types/mqtt'

interface Props {
  selectedTopic: string | null
  onPublish: (req: PublishRequest) => Promise<{ success: boolean; error?: string }>
}

export function PublishBar({ selectedTopic, onPublish }: Props): JSX.Element {
  const [topic, setTopic] = useState(selectedTopic ?? '')
  const [payload, setPayload] = useState('')
  const [qos, setQos] = useState<QoS>(0)
  const [retain, setRetain] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (selectedTopic) setTopic(selectedTopic)
  }, [selectedTopic])

  async function handlePublish(): Promise<void> {
    if (!topic.trim()) {
      setStatus('Topic gerekli')
      return
    }
    const result = await onPublish({ topic: topic.trim(), payload, retain, qos })
    setStatus(result.success ? 'Gönderildi ✓' : `Hata: ${result.error}`)
    setTimeout(() => setStatus(null), 3000)
  }

  return (
    <div className="border-t border-bg-border bg-bg-panel p-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm mono flex-1 text-fg placeholder:text-fg-subtle"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <select
          className="bg-bg-raised border border-bg-border rounded px-2 text-sm text-fg"
          value={qos}
          onChange={(e) => setQos(Number(e.target.value) as QoS)}
        >
          <option value={0}>QoS 0</option>
          <option value={1}>QoS 1</option>
          <option value={2}>QoS 2</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-fg-muted px-2">
          <input type="checkbox" checked={retain} onChange={(e) => setRetain(e.target.checked)} />
          Retain
        </label>
      </div>
      <textarea
        className="bg-bg-raised border border-bg-border rounded px-2 py-1.5 text-sm mono resize-y min-h-[60px] text-fg placeholder:text-fg-subtle"
        placeholder='Payload (düz metin veya JSON, örn. {"status":"ok"})'
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handlePublish}
          className="bg-accent hover:bg-accent-hover text-bg-base transition-colors px-4 py-1.5 rounded text-sm font-medium"
        >
          Publish
        </button>
        {status && <span className="text-xs text-fg-muted">{status}</span>}
      </div>
    </div>
  )
}
