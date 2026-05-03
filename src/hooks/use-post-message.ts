'use client'

import { useEffect, useCallback, useRef } from 'react'

// Message types for parent-child communication
export type ParentMessageType = 
  | { type: 'GENE_LOCK_STATUS'; payload: { valid: boolean; details?: string } }
  | { type: 'USER_INFO'; payload: { id: string; name: string; moralScore: number } }
  | { type: 'NODE_INFO'; payload: { nodes: Array<{ id: string; name: string; endpoint: string; status: string }> } }
  | { type: 'CLOSE_APP'; payload?: undefined }
  | { type: 'ROUTING_INFO'; payload: { currentRoute: string; params: Record<string, string> } }

export type ChildMessageType = 
  | { type: 'APP_READY'; payload: { appId: string; version: string } }
  | { type: 'APP_ERROR'; payload: { message: string; code?: string } }
  | { type: 'REQUEST_CLOSE'; payload?: undefined }
  | { type: 'REQUEST_GENE_LOCK'; payload?: undefined }
  | { type: 'REQUEST_NODE_INFO'; payload?: undefined }
  | { type: 'REQUEST_ROUTE'; payload: { route: string } }

export function usePostMessageBridge(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  options?: {
    onChildMessage?: (msg: ChildMessageType) => void
    geneLockStatus?: { valid: boolean; details?: string }
    userInfo?: { id: string; name: string; moralScore: number }
    nodeInfo?: { nodes: Array<{ id: string; name: string; endpoint: string; status: string }> }
  }
) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const handleMessage = useCallback((event: MessageEvent) => {
    const msg = event.data as ChildMessageType
    if (!msg || !msg.type) return
    
    // Handle known child message types
    const knownTypes = ['APP_READY', 'APP_ERROR', 'REQUEST_CLOSE', 'REQUEST_GENE_LOCK', 'REQUEST_NODE_INFO', 'REQUEST_ROUTE']
    if (!knownTypes.includes(msg.type)) return

    // Auto-respond to certain requests
    if (msg.type === 'REQUEST_GENE_LOCK' && optionsRef.current?.geneLockStatus) {
      const iframe = iframeRef.current
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'GENE_LOCK_STATUS', payload: optionsRef.current.geneLockStatus },
          '*'
        )
      }
    }

    if (msg.type === 'REQUEST_NODE_INFO' && optionsRef.current?.nodeInfo) {
      const iframe = iframeRef.current
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'NODE_INFO', payload: optionsRef.current.nodeInfo },
          '*'
        )
      }
    }

    if (msg.type === 'REQUEST_CLOSE') {
      // Parent handles close
    }

    optionsRef.current?.onChildMessage?.(msg)
  }, [iframeRef])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const sendToChild = useCallback((msg: ParentMessageType) => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    const targetOrigin = '*' // In production, restrict to specific origins
    iframe.contentWindow.postMessage(msg, targetOrigin)
  }, [iframeRef])

  const sendGeneLockStatus = useCallback(() => {
    if (optionsRef.current?.geneLockStatus) {
      sendToChild({ type: 'GENE_LOCK_STATUS', payload: optionsRef.current.geneLockStatus })
    }
  }, [sendToChild])

  const sendUserInfo = useCallback(() => {
    if (optionsRef.current?.userInfo) {
      sendToChild({ type: 'USER_INFO', payload: optionsRef.current.userInfo })
    }
  }, [sendToChild])

  const sendNodeInfo = useCallback(() => {
    if (optionsRef.current?.nodeInfo) {
      sendToChild({ type: 'NODE_INFO', payload: optionsRef.current.nodeInfo })
    }
  }, [sendToChild])

  const sendCloseApp = useCallback(() => {
    sendToChild({ type: 'CLOSE_APP' })
  }, [sendToChild])

  return { sendToChild, sendGeneLockStatus, sendUserInfo, sendNodeInfo, sendCloseApp }
}
