import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { useI18n } from '../i18n/I18nContext'
import type { TopicNode, FlatRow } from '../state/topicTree'
import { flattenTree, collectBranchPaths } from '../state/topicTree'
import type { SubscribeRequest, QoS } from '../types/mqtt'
import { formatPayloadPreview } from '../utils/payloadPreview'

const ROW_HEIGHT = 34
const ROW_HEIGHT_WITH_DATA = 50
const INDENT_PX = 20
const SHOW_PAYLOAD_STORAGE_KEY = 'mqtt-explorer-show-payload-in-tree'

interface Props {
  root: TopicNode
  treeVersion: number
  selectedTopic: string | null
  onSelectTopic: (topic: string) => void
  onSubscribe: (req: SubscribeRequest) => Promise<{ success: boolean; error?: string }>
}

interface TreeLabels {
  expand: string
  collapse: string
  doubleClickHint: string
}

interface RowData {
  rows: FlatRow[]
  selectedTopic: string | null
  showPayloadInTree: boolean
  labels: TreeLabels
  onSelectTopic: (path: string) => void
  onToggle: (path: string) => void
}

function readShowPayloadPreference(): boolean {
  return localStorage.getItem(SHOW_PAYLOAD_STORAGE_KEY) === 'true'
}

function ChevronIcon({ expanded }: { expanded: boolean }): JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`w-3.5 h-3.5 ${expanded ? 'rotate-90' : ''}`}
      fill="currentColor"
      aria-hidden
    >
      <path d="M6 4l5 4-5 4V4z" />
    </svg>
  )
}

const TreeRow = memo(function TreeRow({
  row,
  isSelected,
  showPayloadInTree,
  labels,
  onSelect,
  onToggle
}: {
  row: FlatRow
  isSelected: boolean
  showPayloadInTree: boolean
  labels: TreeLabels
  onSelect: (path: string) => void
  onToggle: (path: string) => void
}): JSX.Element {
  const { node, depth, hasChildren, isExpanded } = row
  const payloadPreview = node.lastMessage ? formatPayloadPreview(node.lastMessage.payload) : null
  const showPayload = showPayloadInTree && payloadPreview !== null

  const title = showPayload
    ? `${node.fullPath}\n${payloadPreview}`
    : hasChildren
      ? `${node.fullPath} — ${labels.doubleClickHint}`
      : node.fullPath

  return (
    <div
      className={`flex flex-col justify-center h-full pr-2 border-l-2 ${
        isSelected
          ? 'border-accent bg-accent-muted/80 text-fg'
          : 'border-transparent text-fg-muted [@media(hover:hover)]:hover:bg-bg-raised [@media(hover:hover)]:hover:text-fg'
      }`}
      style={{
        paddingLeft: depth * INDENT_PX + 6,
        boxShadow: 'inset 0 -1px 0 rgb(var(--border) / 0.25)'
      }}
      onClick={() => onSelect(node.fullPath)}
      onDoubleClick={() => {
        if (hasChildren) onToggle(node.fullPath)
      }}
      title={title}
    >
      <div className="flex items-center min-w-0">
        {hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? labels.collapse : labels.expand}
            aria-expanded={isExpanded}
            className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-md ${
              isExpanded
                ? 'text-accent [@media(hover:hover)]:hover:bg-accent/15'
                : 'text-fg-subtle [@media(hover:hover)]:hover:text-fg [@media(hover:hover)]:hover:bg-bg-border/40'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.fullPath)
            }}
          >
            <ChevronIcon expanded={isExpanded} />
          </button>
        ) : (
          <span className="w-7 h-7 shrink-0 flex items-center justify-center">
            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-accent' : 'bg-fg-subtle/45'}`} />
          </span>
        )}

        <span className={`truncate flex-1 min-w-0 ml-0.5 ${hasChildren ? 'font-medium' : 'font-normal'}`}>
          {node.segment}
        </span>

        <span
          className={`text-[11px] tabular-nums rounded px-1.5 py-0.5 shrink-0 ml-2 ${
            isSelected ? 'bg-accent/20 text-accent' : 'bg-bg-raised text-fg-subtle'
          }`}
        >
          {node.messageCount}
        </span>
      </div>

      {showPayload && (
        <div
          className="mono text-[10px] text-fg-subtle truncate mt-0.5 pr-1"
          style={{ paddingLeft: 28 }}
        >
          {payloadPreview}
        </div>
      )}
    </div>
  )
})

const VirtualRow = memo(function VirtualRow({
  index,
  style,
  data
}: ListChildComponentProps<RowData>): JSX.Element {
  const row = data.rows[index]
  const rowHeight = data.showPayloadInTree ? ROW_HEIGHT_WITH_DATA : ROW_HEIGHT

  return (
    <div style={{ ...style, height: rowHeight, overflow: 'hidden' }}>
      <TreeRow
        row={row}
        isSelected={row.node.fullPath === data.selectedTopic}
        showPayloadInTree={data.showPayloadInTree}
        labels={data.labels}
        onSelect={data.onSelectTopic}
        onToggle={data.onToggle}
      />
    </div>
  )
})

export function TopicTree({ root, treeVersion, selectedTopic, onSelectTopic, onSubscribe }: Props): JSX.Element {
  const { t } = useI18n()
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const [subFilterInput, setSubFilterInput] = useState('#')
  const [subQos, setSubQos] = useState<QoS>(0)
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const [showPayloadInTree, setShowPayloadInTree] = useState(readShowPayloadPreference)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const [listHeight, setListHeight] = useState(400)

  const rowHeight = showPayloadInTree ? ROW_HEIGHT_WITH_DATA : ROW_HEIGHT
  const tt = t.topicTree

  const treeLabels = useMemo<TreeLabels>(
    () => ({
      expand: tt.expand,
      collapse: tt.collapse,
      doubleClickHint: tt.doubleClickHint
    }),
    [tt.expand, tt.collapse, tt.doubleClickHint]
  )

  const rows = useMemo(() => {
    return flattenTree(root, expandedPaths, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, expandedPaths, filter, treeVersion])

  const branchCount = useMemo(() => {
    return collectBranchPaths(root).length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, treeVersion])

  useEffect(() => {
    localStorage.setItem(SHOW_PAYLOAD_STORAGE_KEY, String(showPayloadInTree))
  }, [showPayloadInTree])

  useEffect(() => {
    const el = listContainerRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      const next = Math.max(Math.floor(entry.contentRect.height), rowHeight)
      setListHeight((prev) => (prev === next ? prev : next))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [rowHeight])

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedPaths(new Set(collectBranchPaths(root)))
  }, [root, treeVersion])

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set())
  }, [])

  const itemData = useMemo<RowData>(
    () => ({
      rows,
      selectedTopic,
      showPayloadInTree,
      labels: treeLabels,
      onSelectTopic,
      onToggle: toggleExpand
    }),
    [rows, selectedTopic, showPayloadInTree, treeLabels, onSelectTopic, toggleExpand]
  )

  async function handleSubscribeClick(): Promise<void> {
    const result = await onSubscribe({ topicFilter: subFilterInput, qos: subQos })
    setSubStatus(result.success ? tt.subscribed(subFilterInput) : result.error ?? tt.error)
    setTimeout(() => setSubStatus(null), 3000)
  }

  return (
    <div className="flex flex-col h-full border-r border-bg-border bg-bg-panel">
      <div className="p-2 border-b border-bg-border flex flex-col gap-2">
        <div className="flex gap-1.5">
          <input
            className="bg-bg-raised border border-bg-border rounded px-2 py-1 text-sm text-fg placeholder:text-fg-subtle flex-1 min-w-0"
            placeholder={tt.filterPlaceholder}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {rows.length > 0 && branchCount > 0 && (
            <div className="flex shrink-0 rounded border border-bg-border overflow-hidden">
              <button
                type="button"
                onClick={expandAll}
                className="px-2 py-1 text-[11px] text-fg-muted hover:text-fg hover:bg-bg-raised"
                title={tt.expandAllTitle}
              >
                {tt.expandAll}
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2 py-1 text-[11px] text-fg-muted hover:text-fg hover:bg-bg-raised border-l border-bg-border"
                title={tt.collapseAllTitle}
              >
                {tt.collapseAll}
              </button>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-xs text-fg-muted cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={showPayloadInTree}
            onChange={(e) => setShowPayloadInTree(e.target.checked)}
            className="rounded border-bg-border"
          />
          {tt.showPayloadInTree}
        </label>

        <div className="flex gap-1">
          <input
            className="bg-bg-raised border border-bg-border rounded px-2 py-1 text-xs mono flex-1 text-fg placeholder:text-fg-subtle"
            placeholder={tt.subscribePlaceholder}
            value={subFilterInput}
            onChange={(e) => setSubFilterInput(e.target.value)}
          />
          <select
            className="bg-bg-raised border border-bg-border rounded text-xs text-fg"
            value={subQos}
            onChange={(e) => setSubQos(Number(e.target.value) as QoS)}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
          <button
            className="bg-accent hover:bg-accent-hover text-bg-base px-2 py-1 rounded text-xs whitespace-nowrap"
            onClick={handleSubscribeClick}
          >
            {tt.subscribe}
          </button>
        </div>
        {subStatus && <div className="text-xs text-fg-muted">{subStatus}</div>}
      </div>

      <div ref={listContainerRef} className="flex-1 min-h-0">
        {rows.length === 0 ? (
          <div className="p-4 text-xs text-fg-subtle text-center">{tt.empty}</div>
        ) : (
          <FixedSizeList
            key={showPayloadInTree ? 'with-data' : 'compact'}
            height={listHeight}
            width="100%"
            itemCount={rows.length}
            itemSize={rowHeight}
            itemData={itemData}
            overscanCount={8}
          >
            {VirtualRow}
          </FixedSizeList>
        )}
      </div>
    </div>
  )
}
