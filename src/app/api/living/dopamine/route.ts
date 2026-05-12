import { NextRequest, NextResponse } from 'next/server'
import { getUserDopamineStats, getDopamineLeaderboard } from '@/core/v2/dopamine/persist'

/**
 * 多巴胺查询 API
 *
 * GET /api/living/dopamine?userId=xxx       — 查询用户多巴胺统计
 * GET /api/living/dopamine?leaderboard=true  — 查询排行榜
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const leaderboard = searchParams.get('leaderboard')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (leaderboard === 'true') {
      const board = await getDopamineLeaderboard(limit)
      return NextResponse.json({ leaderboard: board })
    }

    if (userId) {
      const stats = await getUserDopamineStats(userId)
      return NextResponse.json(stats)
    }

    return NextResponse.json(
      { error: '请提供 userId 或 leaderboard=true 参数' },
      { status: 400 }
    )
  } catch (error) {
    console.error('查询多巴胺数据失败:', error)
    return NextResponse.json(
      { error: '查询多巴胺数据失败' },
      { status: 500 }
    )
  }
}
