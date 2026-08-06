import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ConnectionConfig,
  ConnectionState,
  IncomingMessage,
  PublishRequest,
  SubscribeRequest
} from '../types/mqtt'
import { addMessageToTree, createRoot, TopicNode } from '../state/topicTree'

const MAX_MESSAGES_PER_TOPIC = 500

export interface UseMqttBridgeResult {
  connectionState: ConnectionState
  connectionError?: string
  totalMessageCount: number
  treeRoot: TopicNode
  treeVersion: number // her batch'te artar, render'ı tetiklemek için
  messagesByTopic: Map<string, IncomingMessage[]>
  connect: (config: ConnectionConfig) => Promise<{ success: boolean; error?: string }>
  disconnect: () => Promise<void>
  subscribe: (req: SubscribeRequest) => Promise<{ success: boolean; error?: string }>
  publish: (req: PublishRequest) => Promise<{ success: boolean; error?: string }>
  clearAll: () => void
}

export function useMqttBridge(): UseMqttBridgeResult {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [connectionError, setConnectionError] = useState<string | undefined>(undefined)
  const [treeVersion, setTreeVersion] = useState(0)
  const [totalMessageCount, setTotalMessageCount] = useState(0)

  const treeRootRef = useRef<TopicNode>(createRoot())
  const messagesByTopicRef = useRef<Map<string, IncomingMessage[]>>(new Map())
  const treeFlushRef = useRef<number | null>(null)

  useEffect(() => {
    const offStatus = window.mqttAPI.onStatus((evt) => {
      setConnectionState(evt.state)
      setConnectionError(evt.error)
    })

    const offMessages = window.mqttAPI.onMessageBatch((batch) => {
      const root = treeRootRef.current
      const messagesByTopic = messagesByTopicRef.current

      for (const msg of batch) {
        addMessageToTree(root, msg)

        const existing = messagesByTopic.get(msg.topic)
        if (existing) {
          existing.unshift(msg)
          if (existing.length > MAX_MESSAGES_PER_TOPIC) existing.length = MAX_MESSAGES_PER_TOPIC
        } else {
          messagesByTopic.set(msg.topic, [msg])
        }
      }

      setTotalMessageCount((c) => c + batch.length)

      if (treeFlushRef.current !== null) return

      treeFlushRef.current = window.setTimeout(() => {
        treeFlushRef.current = null
        setTreeVersion((v) => v + 1)
      }, 120)
    })

    return () => {
      offStatus()
      offMessages()
      if (treeFlushRef.current !== null) {
        window.clearTimeout(treeFlushRef.current)
      }
    }
  }, [])

  const connect = useCallback(async (config: ConnectionConfig) => {
    setConnectionError(undefined)
    return window.mqttAPI.connect(config)
  }, [])

  const disconnect = useCallback(async () => {
    await window.mqttAPI.disconnect()
  }, [])

  const subscribe = useCallback(async (req: SubscribeRequest) => {
    return window.mqttAPI.subscribe(req)
  }, [])

  const publish = useCallback(async (req: PublishRequest) => {
    return window.mqttAPI.publish(req)
  }, [])

  const clearAll = useCallback(() => {
    treeRootRef.current = createRoot()
    messagesByTopicRef.current = new Map()
    setTreeVersion((v) => v + 1)
    setTotalMessageCount(0)
  }, [])

  return useMemo(
    () => ({
      connectionState,
      connectionError,
      totalMessageCount,
      treeRoot: treeRootRef.current,
      treeVersion,
      messagesByTopic: messagesByTopicRef.current,
      connect,
      disconnect,
      subscribe,
      publish,
      clearAll
    }),
    [connectionState, connectionError, totalMessageCount, treeVersion, connect, disconnect, subscribe, publish, clearAll]
  )
}
