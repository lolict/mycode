/**
 * 圆聚助残平台 - 活体架构 v2
 *
 * 三大系统像人体一样协同工作：
 *
 * 🧠 神经系统 (Nervous)     — 信号传递，所有模块的通信电线
 * 🫁 消化系统 (Digestive)    — 吃进错误，排出无害物，吸收营养
 * 💖 多巴胺系统 (Dopamine)   — 做对了就奖赏，正向循环
 *
 * 使用方式：
 * 1. 在应用启动时调用 initLivingSystem()
 * 2. 任何模块通过神经系统接入通信
 * 3. API路由通过消化系统处理错误
 * 4. 用户行为通过多巴胺系统获得评分
 */

export { getNervousSystem, NervousCenter } from './nervous'
export type { NeuralPlug, NeuralSignal, SignalHandler } from './nervous'

export { getDigestiveSystem, DigestiveSystem, ErrorGrade } from './digestive'
export type { DigestedError, DigestiveMiddleware, DigestContext } from './digestive'

export { getDopamineEngine, DopamineEngine } from './dopamine'
export type { MoralAction, FiveDimensionScore, DopamineRecord } from './dopamine'

import { getNervousSystem } from './nervous'
import { getDigestiveSystem } from './digestive'
import { getDopamineEngine } from './dopamine'

/**
 * 初始化活体系统
 * 在应用启动时调用一次
 */
export function initLivingSystem() {
  const nervous = getNervousSystem()
  const digestive = getDigestiveSystem()
  const dopamine = getDopamineEngine()

  // 消化系统接入神经系统
  nervous.plugIn({
    id: 'digestive-system',
    name: '消化排泄系统',
    type: 'organ',
    channels: ['error:raw', 'error:handled'],
    onSignal: (signal) => {
      if (signal.channel === 'error:raw') {
        const digested = digestive.digest(signal.payload.error, signal.payload.context)
        // 通知多巴胺系统：消化失败 = 扣分
        if (digested.grade === 'critical') {
          nervous.emit({
            channel: 'dopamine:penalty',
            from: 'digestive-system',
            payload: {
              userId: signal.payload.context.userId,
              reason: '操作失败',
              severity: digested.grade,
            },
            priority: 3,
          })
        }
      }
    },
    status: 'active',
  })

  return { nervous, digestive, dopamine }
}

/**
 * 获取活体系统状态总览
 */
export function getLivingSystemStatus() {
  return {
    nervous: getNervousSystem().getStatus(),
    digestive: getDigestiveSystem().getStatus(),
    dopamine: getDopamineEngine().getStatus(),
    timestamp: Date.now(),
  }
}
