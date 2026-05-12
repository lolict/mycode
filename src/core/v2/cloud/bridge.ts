/**
 * 云端神经桥 — 让神经系统信号可以穿越网络
 *
 * 本地神经系统只能在本页面内通信（EventBus），
 * 但加上云端桥之后，信号可以跨设备传播：
 *
 * 1. 本地信号 → 写入 GitHub/WebDAV → 其他设备读取 → 注入本地神经系统
 * 2. 就像电线从一个房子拉到另一个房子
 *
 * 使用方式：
 * 1. 配置好云端同步
 * 2. 调用 bridgeCloudToNervous()
 * 3. 之后所有通过神经系统广播的信号都会自动同步到云端
 */

import { getNervousSystem, type NeuralSignal } from '../nervous'
import { getCloudSync } from '../cloud'

// 云端信号频道前缀 — 区分普通数据和神经信号
const SIGNAL_PREFIX = 'signals/'

// 最近处理的信号ID — 防止重复处理
const processedSignalIds = new Set<string>()
const MAX_PROCESSED = 500

/**
 * 桥接云端到神经系统
 *
 * 把云端读到的信号注入本地神经系统，
 * 让其他设备的操作能影响本页面
 */
export function bridgeCloudToNervous(): () => void {
  const cloud = getCloudSync()
  const nervous = getNervousSystem()

  // 定期从云端拉取信号
  const intervalId = setInterval(async () => {
    try {
      const result = await cloud.read(`${SIGNAL_PREFIX}recent`)
      if (!result.success || !result.data) return

      const signals: NeuralSignal[] = Array.isArray(result.data) ? result.data : []

      for (const signal of signals) {
        // 跳过已处理的信号
        if (processedSignalIds.has(signal.id)) continue

        // 跳过自己发出的信号
        if (signal.from === 'local') continue

        // 注入本地神经系统
        nervous.emit({
          channel: signal.channel,
          from: signal.from,
          payload: signal.payload,
          priority: signal.priority,
          to: signal.to,
        })

        // 记录已处理
        processedSignalIds.add(signal.id)
        if (processedSignalIds.size > MAX_PROCESSED) {
          // 清理最旧的记录
          const iterator = processedSignalIds.values()
          iterator.next()
          processedSignalIds.delete(iterator.next().value)
        }
      }
    } catch {
      // 拉取失败不影响本地运行
    }
  }, 15000) // 每15秒拉取一次

  // 把本地信号推送到云端
  const cloudPlug = nervous.plugIn({
    id: 'cloud-bridge',
    name: '云端神经桥',
    type: 'bridge',
    channels: [
      'action:donate', 'action:create', 'action:help',
      'action:share', 'action:volunteer', 'action:comment',
      'action:verify', 'dopamine:released', 'dopamine:penalty',
      'project:updated', 'system:plug-in', 'system:unplug',
    ],
    onSignal: async (signal) => {
      // 收到本地信号，推送到云端
      try {
        // 先读取现有信号列表
        const existing = await cloud.read(`${SIGNAL_PREFIX}recent`)
        const signals: NeuralSignal[] = existing.success && existing.data
          ? (Array.isArray(existing.data) ? existing.data : [])
          : []

        // 添加新信号
        const updated = [...signals, signal].slice(-50) // 只保留最近50条

        // 写回云端
        await cloud.write(`${SIGNAL_PREFIX}recent`, updated)
      } catch {
        // 推送失败不影响本地运行
      }
    },
    status: 'active',
  })

  // 返回清理函数
  return () => {
    clearInterval(intervalId)
    cloudPlug()
  }
}

/**
 * 获取云端信号状态
 */
export function getCloudBridgeStatus() {
  return {
    processedSignals: processedSignalIds.size,
    bridgeActive: true,
  }
}
