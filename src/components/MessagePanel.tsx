import { useEffect, useRef, useState } from 'react'
import type { IncomingMessage } from '../types/mqtt'

interface Props {
  topic: string | null
  messages: IncomingMessage[]
}

/** JSON.stringify çıktısını basit regex tabanlı token'lara ayırıp renklendirir.
 * Ağır bir tokenizer/parser kullanmadan key/string/number/boolean/null renklerini ayırt eder. */
function highlightJson(jsonText: string): JSX.Element {
  const tokenRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*([eE][+-]?\d+)?)/g
  const parts: JSX.Element[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = tokenRegex.exec(jsonText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{jsonText.slice(lastIndex, match.index)}</span>)
    }
    const token = match[0]
    let className = 'text-emerald-400' // string değer
    if (/:\s*$/.test(token)) className = 'text-sky-400' // key
    else if (/^"(.*)"$/.test(token)) className = 'text-emerald-400'
    else if (/^(true|false)$/.test(token)) className = 'text-amber-400'
    else if (token === 'null') className = 'text-gray-500'
    else if (/^-?\d/.test(token)) className = 'text-purple-400'

    parts.push(
      <span key={key++} className={className}>
        {token}
      </span>
    )
    lastIndex = match.index + token.length
  }
  if (lastIndex < jsonText.length) {
    parts.push(<span key={key++}>{jsonText.slice(lastIndex)}</span>)
  }
  return <>{parts}</>
}

function tryPrettyJson(payload: string): { pretty: string; isJson: boolean } {
  try {
    const parsed: unknown = JSON.parse(payload)
    return { pretty: JSON.stringify(parsed, null, 2), isJson: true }
  } catch {
    return { pretty: payload, isJson: false }
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('tr-TR', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

export function MessagePanel({ topic, messages }: Props): JSX.Element {
  const [autoscroll, setAutoscroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoscroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [messages, autoscroll])

  if (!topic) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Sol panelden bir topic seçin
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-base">
      <div className="border-b border-bg-border px-3 py-2 flex items-center justify-between">
        <span className="mono text-sm text-gray-200 truncate">{topic}</span>
        <label className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 ml-2">
          <input type="checkbox" checked={autoscroll} onChange={(e) => setAutoscroll(e.target.checked)} />
          Autoscroll
        </label>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="text-xs text-gray-500">Bu topic için henüz mesaj yok.</div>
        ) : (
          messages.map((msg, i) => {
            const { pretty, isJson } = tryPrettyJson(msg.payload)
            return (
              <div key={`${msg.timestamp}-${i}`} className="bg-bg-panel border border-bg-border rounded p-2">
                <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                  <span className="mono">{formatTime(msg.timestamp)}</span>
                  <span>QoS {msg.qos}</span>
                  {msg.retain && (
                    <span className="bg-amber-900/40 text-amber-300 px-1.5 rounded">retained</span>
                  )}
                </div>
                <pre className="mono text-xs whitespace-pre-wrap break-all">
                  {isJson ? highlightJson(pretty) : pretty}
                </pre>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
