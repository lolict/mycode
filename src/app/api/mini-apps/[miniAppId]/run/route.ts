import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// POST /api/mini-apps/[miniAppId]/run - 记录运行
export async function POST(
  request: Request,
  { params }: { params: Promise<{ miniAppId: string }> }
) {
  try {
    const { miniAppId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: '缺少userId' }, { status: 400 })
    }

    const app = await prisma.miniApp.update({
      where: { id: miniAppId },
      data: { runCount: { increment: 1 } }
    })

    try {
      await prisma.miniAppInstall.update({
        where: { userId_miniAppId: { userId, miniAppId } },
        data: { lastRunAt: new Date(), runCount: { increment: 1 } }
      })
    } catch {
      // 可能没有安装记录，忽略
    }

    return NextResponse.json({ app })
  } catch (error) {
    console.error('记录运行失败:', error)
    return NextResponse.json({ error: '记录运行失败' }, { status: 500 })
  }
}
