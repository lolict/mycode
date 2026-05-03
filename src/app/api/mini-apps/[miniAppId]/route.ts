import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/mini-apps/[miniAppId] - 获取小程序详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ miniAppId: string }> }
) {
  try {
    const { miniAppId } = await params
    const app = await prisma.miniApp.findUnique({
      where: { id: miniAppId },
      include: {
        developer: { select: { id: true, name: true, email: true } },
        geneLock: true,
        preferredNode: { select: { id: true, name: true, status: true, endpoint: true } },
      }
    })

    if (!app) {
      return NextResponse.json({ error: '小程序不存在' }, { status: 404 })
    }

    return NextResponse.json({ app })
  } catch (error) {
    console.error('获取小程序详情失败:', error)
    return NextResponse.json({ error: '获取小程序详情失败' }, { status: 500 })
  }
}

// PATCH /api/mini-apps/[miniAppId] - 更新小程序
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ miniAppId: string }> }
) {
  try {
    const { miniAppId } = await params
    const body = await request.json()
    const { status, version, installCount, runCount, rating } = body

    const app = await prisma.miniApp.update({
      where: { id: miniAppId },
      data: {
        ...(status && { status }),
        ...(version && { version }),
        ...(installCount !== undefined && { installCount }),
        ...(runCount !== undefined && { runCount }),
        ...(rating !== undefined && { rating }),
      }
    })

    return NextResponse.json({ app })
  } catch (error) {
    console.error('更新小程序失败:', error)
    return NextResponse.json({ error: '更新小程序失败' }, { status: 500 })
  }
}
