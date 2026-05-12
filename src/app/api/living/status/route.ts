import { NextResponse } from 'next/server'
import { getNervousSystem } from '@/core/v2/nervous'
import { getDigestiveSystem } from '@/core/v2/digestive'
import { getDopamineEngine } from '@/core/v2/dopamine'
import { db } from '@/lib/db'

/**
 * 活体系统状态 API
 *
 * 查看身体各系统的健康状况：
 * - 神经系统：有多少模块接入了"电线"
 * - 消化系统：最近排了多少"便"
 * - 多巴胺系统：善行记录统计
 */
export async function GET() {
  try {
    const nervous = getNervousSystem()
    const digestive = getDigestiveSystem()
    const dopamine = getDopamineEngine()

    // 内存中的状态
    const nervousStatus = nervous.getStatus()
    const digestiveStatus = digestive.getStatus()
    const dopamineStatus = dopamine.getStatus()

    // 数据库中的持久化统计
    const [errorLogCount, dopamineRecordCount, recentErrors, recentDopamine] = await Promise.all([
      db.errorLog.count(),
      db.dopamineRecord.count(),
      db.errorLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.dopamineRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      timestamp: Date.now(),
      nervous: {
        ...nervousStatus,
        description: '神经系统：信号传递，模块通信的电线',
      },
      digestive: {
        ...digestiveStatus,
        persistedCount: errorLogCount,
        recentPersistedErrors: recentErrors,
        description: '消化系统：吃进错误，排出无害物，吸收营养',
      },
      dopamine: {
        ...dopamineStatus,
        persistedCount: dopamineRecordCount,
        recentDopamine,
        description: '多巴胺系统：做对了就奖赏，正向循环',
      },
    })
  } catch (error) {
    console.error('获取活体系统状态失败:', error)
    return NextResponse.json(
      { error: '活体系统状态获取失败' },
      { status: 500 }
    )
  }
}
