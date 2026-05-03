import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// POST /api/mini-apps/[miniAppId]/install - 安装小程序
export async function POST(
  request: Request,
  { params }: { params: Promise<{ miniAppId: string }> }
) {
  try {
    const { miniAppId } = await params
    const body = await request.json()
    const { userId, position, isPinned } = body

    if (!userId) {
      return NextResponse.json({ error: '缺少userId' }, { status: 400 })
    }

    const app = await prisma.miniApp.findUnique({
      where: { id: miniAppId }
    })

    if (!app) {
      return NextResponse.json({ error: '小程序不存在' }, { status: 404 })
    }

    const existing = await prisma.miniAppInstall.findUnique({
      where: { userId_miniAppId: { userId, miniAppId } }
    })

    if (existing) {
      return NextResponse.json({ install: existing, message: '已安装' })
    }

    const install = await prisma.miniAppInstall.create({
      data: {
        userId,
        miniAppId,
        position: position ?? 0,
        isPinned: isPinned ?? false,
      }
    })

    await prisma.miniApp.update({
      where: { id: miniAppId },
      data: { installCount: { increment: 1 } }
    })

    return NextResponse.json({ install }, { status: 201 })
  } catch (error) {
    console.error('安装小程序失败:', error)
    return NextResponse.json({ error: '安装小程序失败' }, { status: 500 })
  }
}

// DELETE /api/mini-apps/[miniAppId]/install - 卸载小程序
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ miniAppId: string }> }
) {
  try {
    const { miniAppId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '缺少userId' }, { status: 400 })
    }

    const install = await prisma.miniAppInstall.findUnique({
      where: { userId_miniAppId: { userId, miniAppId } }
    })

    if (!install) {
      return NextResponse.json({ error: '未安装此小程序' }, { status: 404 })
    }

    await prisma.miniAppInstall.delete({
      where: { userId_miniAppId: { userId, miniAppId } }
    })

    await prisma.miniApp.update({
      where: { id: miniAppId },
      data: { installCount: { decrement: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('卸载小程序失败:', error)
    return NextResponse.json({ error: '卸载小程序失败' }, { status: 500 })
  }
}
