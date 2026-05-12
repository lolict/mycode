import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDexiModule } from '@/lib/dexi-registry'

// GET /api/dexi/modules/[code] - 获取单个模块详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const moduleDef = getDexiModule(code)

    if (!moduleDef) {
      return NextResponse.json({ error: '模块不存在' }, { status: 404 })
    }

    // 从数据库获取记录统计
    let recordCount = 0
    let recentRecords: any[] = []
    try {
      recordCount = await db.dexiRecord.count({
        where: { moduleCode: code }
      })
      recentRecords = await db.dexiRecord.findMany({
        where: { moduleCode: code },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    } catch {
      // 数据库可能还没同步
    }

    return NextResponse.json({
      module: moduleDef,
      recordCount,
      recentRecords,
    })
  } catch (error) {
    console.error('获取模块详情失败:', error)
    return NextResponse.json({ error: '获取模块详情失败' }, { status: 500 })
  }
}
