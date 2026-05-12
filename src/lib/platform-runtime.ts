/**
 * 平台运行时 (Platform Runtime)
 *
 * 圆聚助残公益众筹平台的"生命启动器"
 *
 * 按正确顺序初始化所有活体系统：
 * 1. 神经系统 (Nervous System) — 信号通信基础
 * 2. 消化系统 (Digestive System) — 错误消化
 * 3. 多巴胺引擎 (Dopamine Engine) — 善行激励
 * 4. 插板-神经联动 (PlugBoard Neural Bridge) — 插板与神经连通
 * 5. 道德股权运行时 (Moral Equity Runtime) — 道德任务驱动
 *
 * 初始化完成后，整个平台如同生命体一般运转：
 * - 用户完成道德任务 → 五德评分更新 → 多巴胺分泌 → 神经信号广播
 * - 神经信号到达插板系统 → 驱动插头值更新 → 激活神经节点
 * - 神经节点激活 → 可能触发更多插板操作 → 形成正反馈循环
 */

import { getNervousSystem } from '@/core/v2/nervous'
import { getDopamineEngine } from '@/core/v2/dopamine'
import { getPlugBoardNeuralBridge } from '@/lib/plugboard-neural-bridge'
import { getMoralEquityRuntime } from '@/lib/moral-equity-runtime'

let platformInitialized = false

export function initializePlatform(): {
  success: boolean
  systems: string[]
  status: Record<string, unknown>
} {
  if (platformInitialized) {
    return {
      success: true,
      systems: ['already_initialized'],
      status: getPlatformStatus(),
    }
  }

  const systems: string[] = []

  try {
    // 1. 神经系统 — 一切通信的基础
    const nervous = getNervousSystem()
    systems.push('nervous-system ✓')

    // 2. 多巴胺引擎 — 自动接入神经系统
    const dopamine = getDopamineEngine()
    systems.push('dopamine-engine ✓')

    // 3. 插板-神经联动 — 将插板接入神经系统
    const bridge = getPlugBoardNeuralBridge()
    bridge.init()
    systems.push('plugboard-neural-bridge ✓')

    // 4. 道德股权运行时 — 将道德系统接入神经系统
    const moralRuntime = getMoralEquityRuntime()
    moralRuntime.init()
    systems.push('moral-equity-runtime ✓')

    platformInitialized = true

    // 广播平台启动完成信号
    nervous.emit({
      channel: 'platform:ready',
      from: 'platform-runtime',
      payload: {
        version: '2.0.0',
        systems: systems.length,
        timestamp: Date.now(),
      },
      priority: 10,
    })

    return {
      success: true,
      systems,
      status: getPlatformStatus(),
    }
  } catch (error) {
    return {
      success: false,
      systems,
      status: { error: String(error) },
    }
  }
}

export function getPlatformStatus(): Record<string, unknown> {
  const nervous = getNervousSystem()
  const dopamine = getDopamineEngine()
  const bridge = getPlugBoardNeuralBridge()
  const moralRuntime = getMoralEquityRuntime()

  return {
    initialized: platformInitialized,
    nervous: nervous.getStatus(),
    dopamine: dopamine.getStatus(),
    plugboard: bridge.getStatus(),
    moralEquity: moralRuntime.getStatus(),
    summary: {
      neuralPlugs: nervous.getStatus().totalPlugs,
      dopamineRecords: dopamine.getStatus().totalRecords,
      moralUsers: moralRuntime.getStatus().totalUsers,
      moralTasks: moralRuntime.getStatus().totalTasksCompleted,
    },
  }
}

export function isPlatformInitialized(): boolean {
  return platformInitialized
}
