import { useMemo, useState, useCallback, CSSProperties } from 'react'
import { FixedSizeList } from 'react-window'
import type { TopicNode } from '../state/topicTree'
import { flattenTree } from '../state/topicTree'
import type { SubscribeRequest, QoS } from '../types/mqtt'

const ROW_HEIGHT = 26
const INDENT_PX = 16

interface Props {
  root: TopicNode
  treeVersion: number
  selectedTopic: string | null
  onSelectTopic: (topic: string) => void
  onSubscribe: (req: SubscribeRequest) => Promise<{ success: boolean; error?: string }>
}

export function TopicTree({ root, treeVersion, selectedTopic, onSelectTopic, onSubscribe }: Props): JSX.Element {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const [subFilterInput, setSubFilterInput] = useState('#')
  const [subQos, setSubQos] = useState<QoS>(0)
  const [subStatus, setSubStatus] = useState<string | null>(null)

  // treeVersion bağımlılığa dahil edilerek her yeni mesaj batch'inde yeniden hesaplanır
  const rows = useMemo(() => {
    return flattenTree(root, expandedPaths, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, expandedPaths, filter, treeVersion])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  async function handleSubscribeClick(): Promise<void> {
    const result = await onSubscribe({ topicFilter: subFilterInput, qos: subQos })
    setSubStatus(result.success ? `Subscribe edildi: ${subFilterInput}` : result.error ?? 'Hata')
    setTimeout(() => setSubStatus(null), 3000)
  }

  return (
    <div className="flex flex-col h-full border-r border-bg-border bg-bg-panel">
      <div className="p-2 border-b border-bg-border flex flex-col gap-2">
        <input
          className="bg-bg-raised border border-bg-border rounded px-2 py-1 text-sm"
          placeholder="Topic ara / filtrele…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex gap-1">
          <input
            className="bg-bg-raised border border-bg-border rounded px-2 py-1 text-xs mono flex-1"
            placeholder="Yeni subscribe filter (örn. powersarj/#)"
            value={subFilterInput}
            onChange={(e) => setSubFilterInput(e.target.value)}
          />
          <select
            className="bg-bg-raised border border-bg-border rounded text-xs"
            value={subQos}
            onChange={(e) => setSubQos(Number(e.target.value) as QoS)}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
          <button
            className="bg-accent hover:bg-accent/80 px-2 py-1 rounded text-xs whitespace-nowrap"
            onClick={handleSubscribeClick}
          >
            Sub
          </button>
        </div>
        {subStatus && <div className="text-xs text-gray-400">{subStatus}</div>}
      </div>

      <div className="flex-1 min-h-0">
        {rows.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 text-center">
            Henüz mesaj yok. Bağlanıp bir subscribe filter girin.
          </div>
        ) : (
          <FixedSizeList
            height={800}
            width="100%"
            itemCount={rows.length}
            itemSize={ROW_HEIGHT}
            style={{ height: '100%' }}
          >
            {({ index, style }: { index: number; style: CSSProperties }) => {
              const row = rows[index]
              const isSelected = row.node.fullPath === selectedTopic
              return (
                <div
                  style={{ ...style, paddingLeft: row.depth * INDENT_PX + 8 }}
                  className={`flex items-center gap-1.5 text-sm cursor-pointer hover:bg-bg-raised ${
                    isSelected ? 'bg-accent/20' : ''
                  }`}
                  onClick={() => onSelectTopic(row.node.fullPath)}
                >
                  {row.hasChildren ? (
                    <button
                      className="text-gray-500 w-3 text-xs shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(row.node.fullPath)
                      }}
                    >
                      {row.isExpanded ? '▾' : '▸'}
                    </button>
                  ) : (
                    <span className="w-3 shrink-0" />
                  )}
                  <span className="truncate flex-1">{row.node.segment}</span>
                  <span className="text-xs text-gray-500 bg-bg-raised rounded px-1.5 shrink-0">
                    {row.node.messageCount}
                  </span>
                </div>
              )
            }}
          </FixedSizeList>
        )}
      </div>
    </div>
  )
}
