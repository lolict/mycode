/**
 * React Hooks — 让三大系统可以在组件中直接使用
 */
'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { getNervousSystem, type NeuralPlug, type NeuralSignal } from './nervous'
import { getDigestiveSystem, type DigestContext } from './digestive'
import { getDopamineEngine, type MoralAction, type FiveDimensionScore } from './dopamine'

// ============================================
// useNeuralPlug — 组件接入神经系统
// ============================================

/**
 * 让组件接入神经系统，像插头一样插上就能通信
 *
 * 用法：
 * const { emit, broadcast } = useNeuralPlug({
 *   id: 'project-detail',
 *   name: '项目详情页',
 *   type: 'app',
 *   channels: ['project:updated', 'donation:received'],
 *   onSignal: (signal) => { console.log('收到信号', signal) },
 * })
 */
export function useNeuralPlug(plugConfig: Omit<NeuralPlug, 'status'>) {
  const plugRef = useRef<NeuralPlug>({
    ...plugConfig,
    status: 'active',
  })
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const nervous = getNervousSystem()
    plugRef.current = {
      ...plugConfig,
      status: 'active',
    }
    const unplug = nervous.plugIn(plugRef.current)
    setConnected(true)

    return () => {
      unplug()
      setConnected(false)
    }
  }, [plugConfig.id, plugConfig.channels, plugConfig.name, plugConfig.onSignal]) // 只在ID变化时重新接入

  const emit = useCallback((
    channel: string,
    payload: any,
    options?: { to?: string; priority?: number }
  ) => {
    getNervousSystem().emit({
      channel,
      from: plugConfig.id,
      payload,
      priority: options?.priority || 5,
      ...(options?.to ? { to: options.to } : {}),
    })
  }, [plugConfig.id])

  const broadcast = useCallback((channel: string, payload: any) => {
    getNervousSystem().broadcast({
      channel,
      from: plugConfig.id,
      payload,
      priority: 1,
    })
  }, [plugConfig.id])

  return { emit, broadcast, connected }
}

// ============================================
// useDigest — 组件内安全执行（自动消化错误）
// ============================================

/**
 * 安全执行异步操作，错误自动被消化系统处理
 *
 * 用法：
 * const { safeExec, loading, error } = useDigest('项目创建')
 * const result = await safeExec(() => fetch('/api/projects', { method: 'POST', ... }))
 */
export function useDigest(operationName: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const safeExec = useCallback(async <T>(
    fn: () => Promise<T>,
    context?: Partial<DigestContext>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await fn()
      setLoading(false)
      return result
    } catch (err) {
      const digestive = getDigestiveSystem()
      const digested = digestive.digest(err, {
        source: `hook:${operationName}`,
        operation: operationName,
        ...context,
      })
      setError(digested.message)
      setLoading(false)
      return null
    }
  }, [operationName])

  const clearError = useCallback(() => setError(null), [])

  return { safeExec, loading, error, clearError }
}

// ============================================
// useDopamine — 组件内触发多巴胺评分
// ============================================

/**
 * 触发多巴胺评分，用于用户做善事时
 *
 * 用法：
 * const { release, userScore } = useDopamine(userId)
 * release({ type: 'donate', description: '捐款100元', data: { amount: 100 } })
 */
export function useDopamine(userId?: string) {
  const [lastScore, setLastScore] = useState<FiveDimensionScore | null>(null)
  const [totalDopamine, setTotalDopamine] = useState(0)

  const release = useCallback((action: Omit<MoralAction, 'userId' | 'timestamp'>) => {
    const engine = getDopamineEngine()
    const record = engine.release({
      ...action,
      userId: userId || 'anonymous',
      timestamp: Date.now(),
    })
    setLastScore(record.score)

    // 更新总分
    const userTotal = engine.getUserTotalDopamine(userId || 'anonymous')
    setTotalDopamine(userTotal.total)

    return record
  }, [userId])

  const refreshScore = useCallback(() => {
    if (!userId) return
    const engine = getDopamineEngine()
    const userTotal = engine.getUserTotalDopamine(userId)
    setTotalDopamine(userTotal.total)
    if (userTotal.avgScore) setLastScore(userTotal.avgScore)
  }, [userId])

  return { release, lastScore, totalDopamine, refreshScore }
}

// ============================================
// useLivingSystem — 一次性获取全部系统
// ============================================

export function useLivingSystem(componentId: string, componentName: string) {
  const neural = useNeuralPlug({
    id: componentId,
    name: componentName,
    type: 'app',
    channels: ['system:plug-in', 'system:unplug', 'dopamine:released'],
    onSignal: () => {},
  })

  const digest = useDigest(componentName)

  return {
    neural,
    digest,
    dopamine: getDopamineEngine(),
    digestive: getDigestiveSystem(),
  }
}
