import type { IncomingMessage } from '../types/mqtt'

export interface TopicNode {
  segment: string
  fullPath: string
  children: Map<string, TopicNode>
  messageCount: number // bu node + tüm çocuklarına gelen toplam mesaj sayısı
  ownMessageCount: number // sadece bu tam path'e gelen mesaj sayısı
  lastMessage?: IncomingMessage
}

export function createRoot(): TopicNode {
  return {
    segment: '',
    fullPath: '',
    children: new Map(),
    messageCount: 0,
    ownMessageCount: 0
  }
}

/** Mutasyonla bir mesajı ağaca ekler. Root node referansı aynı kalır (React state güncellemesi
 * çağıran tarafta yeni bir root kopyası ile tetiklenmelidir - bkz useMqttBridge). */
export function addMessageToTree(root: TopicNode, message: IncomingMessage): void {
  const segments = message.topic.split('/').filter((s) => s.length > 0)
  let node = root
  let path = ''
  node.messageCount += 1

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    path = path ? `${path}/${seg}` : seg
    let child = node.children.get(seg)
    if (!child) {
      child = {
        segment: seg,
        fullPath: path,
        children: new Map(),
        messageCount: 0,
        ownMessageCount: 0
      }
      node.children.set(seg, child)
    }
    child.messageCount += 1
    node = child
  }
  node.ownMessageCount += 1
  node.lastMessage = message
}

export interface FlatRow {
  node: TopicNode
  depth: number
  isExpanded: boolean
  hasChildren: boolean
}

export function collectBranchPaths(root: TopicNode): string[] {
  const paths: string[] = []

  function walk(node: TopicNode): void {
    for (const child of node.children.values()) {
      if (child.children.size > 0) {
        paths.push(child.fullPath)
        walk(child)
      }
    }
  }

  walk(root)
  return paths
}

/** Ağacı, react-window ile virtualized render edilebilecek düz bir satır listesine çevirir.
 * Sadece expandedPaths içinde olan node'ların çocukları listeye dahil edilir. */
export function flattenTree(
  root: TopicNode,
  expandedPaths: Set<string>,
  filter: string
): FlatRow[] {
  const rows: FlatRow[] = []
  const lowerFilter = filter.trim().toLowerCase()

  function matches(node: TopicNode): boolean {
    if (!lowerFilter) return true
    if (node.fullPath.toLowerCase().includes(lowerFilter)) return true
    for (const child of node.children.values()) {
      if (matches(child)) return true
    }
    return false
  }

  function walk(node: TopicNode, depth: number): void {
    const sortedChildren = [...node.children.values()].sort((a, b) =>
      a.segment.localeCompare(b.segment)
    )
    for (const child of sortedChildren) {
      if (lowerFilter && !matches(child)) continue
      const hasChildren = child.children.size > 0
      const isExpanded = expandedPaths.has(child.fullPath) || Boolean(lowerFilter)
      rows.push({ node: child, depth, isExpanded, hasChildren })
      if (hasChildren && isExpanded) {
        walk(child, depth + 1)
      }
    }
  }

  walk(root, 0)
  return rows
}
