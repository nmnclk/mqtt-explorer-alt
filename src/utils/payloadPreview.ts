/** Ağaç satırında gösterilecek tek satırlık payload önizlemesi */
export function formatPayloadPreview(payload: string, maxLen = 72): string {
  const oneLine = payload.replace(/\s+/g, ' ').trim()
  if (!oneLine) return '∅'
  if (oneLine.length <= maxLen) return oneLine
  return `${oneLine.slice(0, maxLen)}…`
}
