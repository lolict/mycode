/**
 * 多巴胺系统持久化层 — 善行记录存入数据库
 *
 * 做了好事 → 多巴胺分泌 → 记入道德账本 → 永久保存
 * 不再只是内存中闪一下就没的数字，而是真正留痕。
 */

import { db } from '@/lib/db'
import type { DopamineRecord, FiveDimensionScore } from './index'

/**
 * 将多巴胺记录持久化到数据库
 * 善行值得被记住
 */
export async function persistDopamine(record: DopamineRecord): Promise<void> {
  try {
    await db.dopamineRecord.create({
      data: {
        id: record.id,
        userId: record.action.userId,
        actionType: record.action.type,
        actionDesc: record.action.description,
        targetId: record.action.targetId,
        kindness: record.score.kindness,
        compassion: record.score.compassion,
        justice: record.score.justice,
        dedication: record.score.dedication,
        severity: record.score.severity,
        totalScore: record.score.total,
        dopamineValue: record.dopamineValue,
        actionData: JSON.stringify(record.action.data),
      },
    })

    record.persisted = true
  } catch (persistError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[多巴胺系统] 持久化失败:', persistError)
    }
  }
}

/**
 * 查询用户的多巴胺记录
 */
export async function queryUserDopamine(userId: string, options?: {
  actionType?: string
  limit?: number
}) {
  const where: any = { userId }
  if (options?.actionType) where.actionType = options.actionType

  return db.dopamineRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
  })
}

/**
 * 获取用户多巴胺统计
 */
export async function getUserDopamineStats(userId: string) {
  const records = await db.dopamineRecord.findMany({
    where: { userId },
  })

  const totalDopamine = records.reduce((sum, r) => sum + r.dopamineValue, 0)
  const totalActions = records.length

  const byType: Record<string, number> = {}
  for (const r of records) {
    byType[r.actionType] = (byType[r.actionType] || 0) + r.dopamineValue
  }

  // 计算平均五维评分
  let avgScore: FiveDimensionScore | null = null
  if (records.length > 0) {
    const sum = { kindness: 0, compassion: 0, justice: 0, dedication: 0, severity: 0, total: 0 }
    for (const r of records) {
      sum.kindness += r.kindness
      sum.compassion += r.compassion
      sum.justice += r.justice
      sum.dedication += r.dedication
      sum.severity += r.severity
      sum.total += r.totalScore
    }
    const n = records.length
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
    userId,
    totalDopamine,
    totalActions,
    byType,
    avgScore,
  }
}

/**
 * 获取多巴胺排行榜
 */
export async function getDopamineLeaderboard(limit = 10) {
  // SQLite 不支持 GROUP BY + 聚合的复杂查询，用 findMany + 手动聚合
  const records = await db.dopamineRecord.findMany()

  const userMap = new Map<string, { totalDopamine: number; totalScore: number; count: number }>()
  for (const r of records) {
    const existing = userMap.get(r.userId) || { totalDopamine: 0, totalScore: 0, count: 0 }
    existing.totalDopamine += r.dopamineValue
    existing.totalScore += r.totalScore
    existing.count++
    userMap.set(r.userId, existing)
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
