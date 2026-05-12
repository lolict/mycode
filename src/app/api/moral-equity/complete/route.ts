import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateLevel, getLevelProgress } from '@/lib/moral-vocabulary'
import { DIFFICULTY_CONFIGS } from '@/lib/moral-task-registry'

// POST /api/moral-equity/complete — 完成道德任务
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { taskCode, userId, proof, note } = body

    if (!taskCode || !userId) {
      return NextResponse.json({ error: '缺少taskCode或userId' }, { status: 400 })
    }

    // 查找任务
    const task = await db.moralTask.findUnique({ where: { code: taskCode } })
    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    if (!task.isActive) {
      return NextResponse.json({ error: '任务已停用' }, { status: 400 })
    }

    // 检查重复完成（日常/周常任务检查周期内是否已完成）
    const existingCompletion = await checkDuplicateCompletion(task, userId)
    if (existingCompletion) {
      return NextResponse.json({
        error: '本周期内已完成此任务',
        existingCompletion,
      }, { status: 409 })
    }

    // 计算道德值（基础值 × 难度倍率）
    const difficultyConfig = DIFFICULTY_CONFIGS.find(d => d.id === task.difficulty)
    const multiplier = difficultyConfig?.multiplier || 1.0
    let moralValueEarned = Math.round(task.moralValue * multiplier)

    // 计算五维评分
    const fiveDimScore = calculateTaskFiveDimensions(task, proof)

    // 创建完成记录
    const completion = await db.moralTaskCompletion.create({
      data: {
        taskId: task.id,
        userId,
        moralValueEarned,
        fiveDimScore: JSON.stringify(fiveDimScore),
        proof: proof ? JSON.stringify(proof) : null,
        note: note || null,
        status: 'confirmed',
      }
    })

    // 更新道德股权
    let equity = await db.moralEquity.findUnique({ where: { userId } })
    if (!equity) {
      equity = await db.moralEquity.create({
        data: { userId, totalEquity: moralValueEarned, totalTasks: 1, lastActiveAt: new Date() }
      })
    } else {
      // 更新连续天数
      const lastActive = equity.lastActiveAt
      let streakDays = equity.streakDays || 0
      if (lastActive) {
        const lastDate = new Date(lastActive)
        const today = new Date()
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000))
        if (diffDays === 1) {
          streakDays += 1
        } else if (diffDays > 1) {
          streakDays = 1
        }
        // diffDays === 0 说明今天已活跃过，不重置
      } else {
        streakDays = 1
      }

      // 连击加成
      const streakBonus = Math.min(0.5, streakDays * 0.01)
      moralValueEarned = Math.round(moralValueEarned * (1 + streakBonus))

      equity = await db.moralEquity.update({
        where: { userId },
        data: {
          totalEquity: { increment: moralValueEarned },
          totalTasks: { increment: 1 },
          streakDays,
          lastActiveAt: new Date(),
        }
      })
    }

    // 重新计算等级
    const levelConfig = calculateLevel(equity.totalEquity)
    const progress = getLevelProgress(equity.totalEquity)
    const leveledUp = equity.level !== levelConfig.level

    if (leveledUp) {
      equity = await db.moralEquity.update({
        where: { userId },
        data: { level: levelConfig.level, tier: levelConfig.tier }
      })
    }

    // 联动多巴胺系统
    let dopamineResult = null
    try {
      const dopamineRecord = await db.dopamineRecord.create({
        data: {
          userId,
          actionType: 'help',
          actionDesc: `完成任务: ${task.name}`,
          kindness: fiveDimScore.kindness,
          compassion: fiveDimScore.compassion,
          justice: fiveDimScore.justice,
          dedication: fiveDimScore.dedication,
          severity: fiveDimScore.severity,
          totalScore: fiveDimScore.total,
          dopamineValue: moralValueEarned * 0.1,
          actionData: JSON.stringify({
            source: 'moral_equity',
            taskCode: task.code,
            taskName: task.name,
            moralValueEarned,
          }),
        }
      })
      dopamineResult = {
        triggered: true,
        dopamineValue: dopamineRecord.dopamineValue,
        recordId: dopamineRecord.id,
      }
    } catch (e) {
      console.warn('[道德股权→多巴胺] 联动失败:', e)
    }

    return NextResponse.json({
      completion: {
        id: completion.id,
        taskCode: task.code,
        taskName: task.name,
        moralValueEarned,
        fiveDimScore,
        streakDays: equity.streakDays,
      },
      equity: {
        totalEquity: equity.totalEquity,
        level: equity.level,
        tier: equity.tier,
        totalTasks: equity.totalTasks,
        streakDays: equity.streakDays,
        levelName: levelConfig.name,
        levelIcon: levelConfig.icon,
        progress,
      },
      leveledUp,
      newLevel: leveledUp ? levelConfig : null,
      dopamine: dopamineResult,
    }, { status: 201 })
  } catch (error) {
    console.error('完成任务失败:', error)
    return NextResponse.json({ error: '完成任务失败' }, { status: 500 })
  }
}

// 检查周期内是否已完成
async function checkDuplicateCompletion(task: any, userId: string) {
  const now = new Date()
  let since: Date

  switch (task.frequency || task.category) {
    case 'daily': {
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      since = todayStart
      break
    }
    case 'weekly': {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      since = weekStart
      break
    }
    case 'monthly': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      since = monthStart
      break
    }
    case 'one-time': {
      // 一次性任务，检查是否曾经完成过
      since = new Date(0) // 从epoch开始
      break
    }
    default:
      return null
  }

  const existing = await db.moralTaskCompletion.findFirst({
    where: {
      taskId: task.id,
      userId,
      status: 'confirmed',
      createdAt: { gte: since }
    }
  })

  return existing
}

// 计算任务完成时的五维评分
function calculateTaskFiveDimensions(task: any, proof: any) {
  // 基于任务分类和难度的五维倾向
  const categoryProfiles: Record<string, { kindness: number; compassion: number; justice: number; dedication: number; severity: number }> = {
    daily:     { kindness: 55, compassion: 50, justice: 45, dedication: 40, severity: 20 },
    weekly:    { kindness: 65, compassion: 70, justice: 50, dedication: 75, severity: 30 },
    monthly:   { kindness: 75, compassion: 65, justice: 70, dedication: 80, severity: 40 },
    'one-time': { kindness: 60, compassion: 55, justice: 50, dedication: 60, severity: 25 },
    special:   { kindness: 70, compassion: 80, justice: 65, dedication: 85, severity: 60 },
  }

  // 基于任务code的特殊倾向
  const taskProfiles: Record<string, typeof categoryProfiles.daily> = {
    daily_checkin:     { kindness: 40, compassion: 30, justice: 30, dedication: 25, severity: 10 },
    daily_share:       { kindness: 55, compassion: 45, justice: 35, dedication: 30, severity: 15 },
    daily_comment:     { kindness: 50, compassion: 40, justice: 40, dedication: 25, severity: 10 },
    daily_learn:       { kindness: 45, compassion: 55, justice: 35, dedication: 35, severity: 20 },
    daily_verify:      { kindness: 40, compassion: 35, justice: 85, dedication: 40, severity: 30 },
    daily_help:        { kindness: 70, compassion: 80, justice: 45, dedication: 65, severity: 50 },
    weekly_donate:     { kindness: 85, compassion: 70, justice: 55, dedication: 80, severity: 45 },
    weekly_volunteer:  { kindness: 75, compassion: 75, justice: 50, dedication: 90, severity: 40 },
    weekly_visit:      { kindness: 70, compassion: 90, justice: 45, dedication: 75, severity: 55 },
    weekly_teach:      { kindness: 75, compassion: 70, justice: 65, dedication: 85, severity: 35 },
    monthly_create_project: { kindness: 80, compassion: 75, justice: 70, dedication: 90, severity: 50 },
    monthly_supervise:      { kindness: 50, compassion: 45, justice: 95, dedication: 65, severity: 55 },
    monthly_innovation:     { kindness: 80, compassion: 75, justice: 60, dedication: 85, severity: 40 },
    emergency_response:     { kindness: 75, compassion: 90, justice: 60, dedication: 95, severity: 90 },
    accessibility_audit:    { kindness: 55, compassion: 65, justice: 90, dedication: 70, severity: 50 },
    mentor_program:         { kindness: 85, compassion: 75, justice: 60, dedication: 80, severity: 35 },
  }

  const profile = taskProfiles[task.code] || categoryProfiles[task.category] || categoryProfiles.daily

  // 难度加成
  const diffBonus: Record<string, number> = { easy: 0, medium: 5, hard: 10, legendary: 20 }
  const bonus = diffBonus[task.difficulty] || 0

  const kindness = Math.min(100, profile.kindness + bonus)
  const compassion = Math.min(100, profile.compassion + bonus)
  const justice = Math.min(100, profile.justice + bonus)
  const dedication = Math.min(100, profile.dedication + bonus)
  const severity = Math.min(100, profile.severity + Math.floor(bonus / 2))

  const total = Math.round(
    kindness * 0.30 +
    compassion * 0.25 +
    justice * 0.20 +
    dedication * 0.15 +
    severity * 0.10
  )

  return { kindness, compassion, justice, dedication, severity, total }
}
