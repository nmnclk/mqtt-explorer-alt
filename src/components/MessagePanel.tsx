import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import type { IncomingMessage } from '../types/mqtt'

interface Props {
  topic: string | null
  messages: IncomingMessage[]
}

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
    let className = 'text-syntax-string'
    if (/:\s*$/.test(token)) className = 'text-syntax-key'
    else if (/^"(.*)"$/.test(token)) className = 'text-syntax-string'
    else if (/^(true|false)$/.test(token)) className = 'text-syntax-bool'
    else if (token === 'null') className = 'text-syntax-null'
    else if (/^-?\d/.test(token)) className = 'text-syntax-number'

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

function formatTime(ts: number, locale: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString(locale, { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

export function MessagePanel({ topic, messages }: Props): JSX.Element {
  const { t, numberLocale } = useI18n()
  const [autoscroll, setAutoscroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoscroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [messages, autoscroll])

  if (!topic) {
    return (
      <div className="flex-1 flex items-center justify-center text-fg-subtle text-sm">
        {t.messagePanel.selectTopic}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-base">
      <div className="border-b border-bg-border px-3 py-2 flex items-center justify-between">
        <span className="mono text-sm text-fg truncate">{topic}</span>
        <label className="flex items-center gap-1.5 text-xs text-fg-muted shrink-0 ml-2">
          <input type="checkbox" checked={autoscroll} onChange={(e) => setAutoscroll(e.target.checked)} />
          {t.messagePanel.autoscroll}
        </label>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="text-xs text-fg-subtle">{t.messagePanel.noMessages}</div>
        ) : (
          messages.map((msg, i) => {
            const { pretty, isJson } = tryPrettyJson(msg.payload)
            return (
              <div key={`${msg.timestamp}-${i}`} className="bg-bg-panel border border-bg-border rounded p-2">
                <div className="flex items-center gap-2 mb-1 text-xs text-fg-subtle">
                  <span className="mono">{formatTime(msg.timestamp, numberLocale)}</span>
                  <span>QoS {msg.qos}</span>
                  {msg.retain && (
                    <span className="bg-warn-bg text-warn-fg px-1.5 rounded text-[10px] uppercase tracking-wide">
                      {t.messagePanel.retained}
                    </span>
                  )}
                </div>
                <pre className="mono text-xs whitespace-pre-wrap break-all text-fg">
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
