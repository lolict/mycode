/**
 * 多巴胺系统 - Dopamine System
 *
 * 人体比喻：
 * - 做对了 → 多巴胺分泌 → 记住这个行为 → 下次更愿意做
 *
 * 对应代码：
 * - 行为发生（捐款、创建项目、互助）    = 做事
 * - 道德账本五维评分                    = 多巴胺分泌
 * - 写入数据库，用户能看到成长           = 记住
 * - 积分影响权限/排名/推荐              = 下次更愿意做
 *
 * 五维评分：
 * - 善良 30%  — 利他行为的纯度
 * - 恻隐 25%  — 对弱者的关怀深度
 * - 正义 20%  — 对公平的坚持程度
 * - 奉献 15%  — 付出的实际代价
 * - 严重度 10% — 反向指标，问题越严重扣分越多
 */

import { getNervousSystem } from '../nervous'

// ============================================
// 行为定义 — 什么行为会触发多巴胺
// ============================================

export interface MoralAction {
  /** 行为类型 */
  type: 'donate' | 'create_project' | 'comment' | 'share' | 'volunteer' | 'help' | 'verify'
  /** 行为描述 */
  description: string
  /** 行为主体（用户ID） */
  userId: string
  /** 行为对象（项目ID、被帮助者ID等） */
  targetId?: string
  /** 行为数据 */
  data: Record<string, any>
  /** 时间 */
  timestamp: number
}

// ============================================
// 五维评分结果
// ============================================

export interface FiveDimensionScore {
  /** 善良 30% — 利他行为的纯度 */
  kindness: number     // 0-100
  /** 恻隐 25% — 对弱者的关怀深度 */
  compassion: number   // 0-100
  /** 正义 20% — 对公平的坚持程度 */
  justice: number      // 0-100
  /** 奉献 15% — 付出的实际代价 */
  dedication: number   // 0-100
  /** 严重度 10% — 反向指标，越严重扣分越多 */
  severity: number     // 0-100，0=不严重，100=极其严重

  /** 加权总分 */
  total: number        // 0-100
  /** 各维度权重 */
  weights: {
    kindness: 0.30
    compassion: 0.25
    justice: 0.20
    dedication: 0.15
    severity: 0.10
  }
}

// ============================================
// 多巴胺记录 — 存入数据库的结构
// ============================================

export interface DopamineRecord {
  id: string
  action: MoralAction
  score: FiveDimensionScore
  /** 多巴胺值（= 总分 * 行为权重） */
  dopamineValue: number
  /** 是否已持久化到数据库 */
  persisted: boolean
  timestamp: number
}

// ============================================
// 行为评分规则 — 每种行为的默认评分模板
// ============================================

const ACTION_TEMPLATES: Record<string, {
  defaultScore: Partial<FiveDimensionScore>
  weight: number  // 行为权重，影响多巴胺分泌量
}> = {
  donate: {
    defaultScore: { kindness: 80, compassion: 85, justice: 60, dedication: 70, severity: 0 },
    weight: 1.5,  // 捐款是核心行为，多巴胺分泌多
  },
  create_project: {
    defaultScore: { kindness: 70, compassion: 75, justice: 65, dedication: 80, severity: 0 },
    weight: 1.3,
  },
  volunteer: {
    defaultScore: { kindness: 85, compassion: 80, justice: 55, dedication: 90, severity: 0 },
    weight: 1.4,  // 志愿服务奉献最高
  },
  help: {
    defaultScore: { kindness: 75, compassion: 90, justice: 50, dedication: 65, severity: 0 },
    weight: 1.2,
  },
  share: {
    defaultScore: { kindness: 60, compassion: 55, justice: 45, dedication: 30, severity: 0 },
    weight: 0.8,  // 分享成本最低
  },
  comment: {
    defaultScore: { kindness: 50, compassion: 45, justice: 55, dedication: 20, severity: 0 },
    weight: 0.5,  // 评论成本最低
  },
  verify: {
    defaultScore: { kindness: 55, compassion: 50, justice: 85, dedication: 40, severity: 0 },
    weight: 1.0,  // 验证体现正义
  },
}

// ============================================
// 多巴胺系统核心
// ============================================

class DopamineEngine {
  private records: DopamineRecord[] = []
  private maxRecords = 1000

  constructor() {
    // 接入神经系统，监听行为信号
    this.connectToNervousSystem()
  }

  /**
   * 接入神经系统 — 当任何模块发射"action:*"频道信号时，
   * 多巴胺系统自动响应
   */
  private connectToNervousSystem(): void {
    getNervousSystem().plugIn({
      id: 'dopamine-engine',
      name: '多巴胺引擎',
      type: 'organ',
      channels: ['action:donate', 'action:create', 'action:help', 'action:share', 'action:volunteer', 'action:comment', 'action:verify'],
      onSignal: (signal) => {
        const action: MoralAction = {
          type: signal.payload.type,
          description: signal.payload.description || '',
          userId: signal.payload.userId,
          targetId: signal.payload.targetId,
          data: signal.payload.data || {},
          timestamp: signal.timestamp,
        }
        this.release(action)
      },
      status: 'active',
    })
  }

  /**
   * 释放多巴胺 — 核心方法
   *
   * 做了好事 → 计算五维评分 → 分泌多巴胺 → 记录下来 → 通知其他模块
   */
  release(action: MoralAction): DopamineRecord {
    const score = this.calculateScore(action)
    const template = ACTION_TEMPLATES[action.type]
    const weight = template?.weight || 1.0
    const dopamineValue = Math.round(score.total * weight)

    const record: DopamineRecord = {
      id: `dop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      action,
      score,
      dopamineValue,
      persisted: false,
      timestamp: Date.now(),
    }

    this.records.push(record)
    if (this.records.length > this.maxRecords) {
      this.records.shift()
    }

    // 通知其他模块：多巴胺已分泌
    getNervousSystem().emit({
      channel: 'dopamine:released',
      from: 'dopamine-engine',
      payload: {
        userId: action.userId,
        dopamineValue,
        score,
        actionType: action.type,
      },
      priority: 5,
    })

    return record
  }

  /**
   * 五维评分计算
   *
   * 从行为模板开始，根据实际数据调整每个维度
   */
  calculateScore(action: MoralAction): FiveDimensionScore {
    const template = ACTION_TEMPLATES[action.type]
    const base = template?.defaultScore || { kindness: 50, compassion: 50, justice: 50, dedication: 50, severity: 0 }

    // 根据实际数据调整评分
    let kindness = base.kindness || 50
    let compassion = base.compassion || 50
    let justice = base.justice || 50
    let dedication = base.dedication || 50
    let severity = base.severity || 0

    // 捐款金额影响奉献维度
    if (action.type === 'donate' && action.data.amount) {
      const amount = Number(action.data.amount)
      if (amount >= 1000) dedication = Math.min(100, dedication + 20)
      else if (amount >= 500) dedication = Math.min(100, dedication + 10)
      else if (amount >= 100) dedication = Math.min(100, dedication + 5)
    }

    // 是否匿名影响善良维度（匿名更纯粹）
    if (action.data.anonymous) {
      kindness = Math.min(100, kindness + 10)
    }

    // 重复行为降低新鲜感但增加坚持性
    const sameActions = this.records.filter(
      r => r.action.userId === action.userId && r.action.type === action.type
    )
    if (sameActions.length > 0) {
      justice = Math.min(100, justice + 5) // 坚持做 = 更正义
    }

    // 项目紧急度影响恻隐维度
    if (action.data.urgency === 'critical') {
      compassion = Math.min(100, compassion + 15)
    } else if (action.data.urgency === 'high') {
      compassion = Math.min(100, compassion + 8)
    }

    // 加权总分
    const total = Math.round(
      kindness * 0.30 +
      compassion * 0.25 +
      justice * 0.20 +
      dedication * 0.15 +
      (100 - severity) * 0.10  // 严重度是反向的
    )

    return {
      kindness,
      compassion,
      justice,
      dedication,
      severity,
      total: Math.min(100, Math.max(0, total)),
      weights: { kindness: 0.30, compassion: 0.25, justice: 0.20, dedication: 0.15, severity: 0.10 },
    }
  }

  /**
   * 获取用户的多巴胺累计
   */
  getUserTotalDopamine(userId: string): {
    total: number
    byType: Record<string, number>
    avgScore: FiveDimensionScore | null
    history: DopamineRecord[]
  } {
    const userRecords = this.records.filter(r => r.action.userId === userId)

    const total = userRecords.reduce((sum, r) => sum + r.dopamineValue, 0)

    const byType: Record<string, number> = {}
    for (const r of userRecords) {
      byType[r.action.type] = (byType[r.action.type] || 0) + r.dopamineValue
    }

    // 计算平均五维评分
    let avgScore: FiveDimensionScore | null = null
    if (userRecords.length > 0) {
      const sum = { kindness: 0, compassion: 0, justice: 0, dedication: 0, severity: 0, total: 0 }
      for (const r of userRecords) {
        sum.kindness += r.score.kindness
        sum.compassion += r.score.compassion
        sum.justice += r.score.justice
        sum.dedication += r.score.dedication
        sum.severity += r.score.severity
        sum.total += r.score.total
      }
      const n = userRecords.length
      avgScore = {
        kindness: Math.round(sum.kindness / n),
        compassion: Math.round(sum.compassion / n),
        justice: Math.round(sum.justice / n),
        dedication: Math.round(sum.dedication / n),
        severity: Math.round(sum.severity / n),
        total: Math.round(sum.total / n),
        weights: { kindness: 0.30, compassion: 0.25, justice: 0.20, dedication: 0.15, severity: 0.10 },
      }
    }

    return {
      total,
      byType,
      avgScore,
      history: userRecords.slice(-50),
    }
  }

  /**
   * 获取排行榜
   */
  getLeaderboard(limit = 10): Array<{
    userId: string
    totalDopamine: number
    avgTotalScore: number
    actionCount: number
  }> {
    const userMap = new Map<string, { totalDopamine: number; totalScore: number; count: number }>()

    for (const r of this.records) {
      const existing = userMap.get(r.action.userId) || { totalDopamine: 0, totalScore: 0, count: 0 }
      existing.totalDopamine += r.dopamineValue
      existing.totalScore += r.score.total
      existing.count++
      userMap.set(r.action.userId, existing)
    }

    return Array.from(userMap.entries())
      .map(([userId, data]) => ({
        userId,
        totalDopamine: data.totalDopamine,
        avgTotalScore: Math.round(data.totalScore / data.count),
        actionCount: data.count,
      }))
      .sort((a, b) => b.totalDopamine - a.totalDopamine)
      .slice(0, limit)
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      totalRecords: this.records.length,
      totalDopamine: this.records.reduce((sum, r) => sum + r.dopamineValue, 0),
      uniqueUsers: new Set(this.records.map(r => r.action.userId)).size,
      actionTypeDistribution: this.records.reduce((dist, r) => {
        dist[r.action.type] = (dist[r.action.type] || 0) + 1
        return dist
      }, {} as Record<string, number>),
    }
  }
}

// ============================================
// 全局单例
// ============================================

let instance: DopamineEngine | null = null

export function getDopamineEngine(): DopamineEngine {
  if (!instance) {
    instance = new DopamineEngine()
  }
  return instance
}

export { DopamineEngine }
