import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateLevel, getLevelProgress } from '@/lib/moral-vocabulary'

// GET /api/moral-equity/balance?userId=xxx — 获取道德股权余额
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '缺少userId参数' }, { status: 400 })
    }

    let equity = await db.moralEquity.findUnique({ where: { userId } })

    if (!equity) {
      // 自动创建
      equity = await db.moralEquity.create({
        data: { userId, totalEquity: 0, level: 1, tier: '初善' }
      })
    }

    // 根据当前股权值重新计算等级
    const levelConfig = calculateLevel(equity.totalEquity)
    const progress = getLevelProgress(equity.totalEquity)

    // 如果等级有变化，更新数据库
    if (equity.level !== levelConfig.level || equity.tier !== levelConfig.tier) {
      equity = await db.moralEquity.update({
        where: { userId },
        data: { level: levelConfig.level, tier: levelConfig.tier }
      })
    }

    // 获取近期完成任务数
    const recentCompletions = await db.moralTaskCompletion.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    })

    // 今日完成数
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayCompletions = await db.moralTaskCompletion.count({
      where: {
        userId,
        createdAt: { gte: todayStart }
      }
    })

    return NextResponse.json({
      equity: {
        ...equity,
        levelName: levelConfig.name,
        levelIcon: levelConfig.icon,
        levelColor: levelConfig.color,
        benefits: levelConfig.benefits,
      },
      progress,
      nextLevelEquity: levelConfig.level < 5
        ? [0, 100, 500, 2000, 10000][levelConfig.level]
        : null,
      recentCompletions,
      todayCompletions,
    })
  } catch (error) {
    console.error('获取道德股权失败:', error)
    return NextResponse.json({ error: '获取道德股权失败' }, { status: 500 })
  }
}
