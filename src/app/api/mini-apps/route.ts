import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/mini-apps - 获取小程序列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'active'
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = { status }
    if (category) where.category = category

    const apps = await prisma.miniApp.findMany({
      where,
      include: {
        developer: { select: { id: true, name: true, email: true } },
        geneLock: true,
        preferredNode: { select: { id: true, name: true, status: true, endpoint: true } },
        installs: userId ? { where: { userId } } : false,
      },
      orderBy: { installCount: 'desc' }
    })

    // 如果指定了userId，附加安装信息
    let installedIds: string[] = []
    if (userId) {
      const installs = await prisma.miniAppInstall.findMany({
        where: { userId },
        select: { miniAppId: true }
      })
      installedIds = installs.map(i => i.miniAppId)
    }

    return NextResponse.json({
      apps,
      installedIds,
      total: apps.length
    })
  } catch (error) {
    console.error('获取小程序列表失败:', error)
    return NextResponse.json({ error: '获取小程序列表失败' }, { status: 500 })
  }
}

// POST /api/mini-apps - 注册新的嵌套式小程序
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name, description, icon, coverImage,
      developerId, developerName,
      entryType, entryUrl, entryRoute,
      category, tags,
      requiresGeneLock, minMoralScore, requiredCommunityTags,
      preferredNodeId
    } = body

    if (!name || !description || !developerId) {
      return NextResponse.json({ error: '缺少必要字段：name, description, developerId' }, { status: 400 })
    }

    // 检查开发者是否有基因锁
    if (requiresGeneLock) {
      const geneLock = await prisma.geneLockRecord.findFirst({
        where: { holderType: 'user', holderId: developerId, status: 'active' }
      })
      if (!geneLock) {
        return NextResponse.json({
          error: '开发者未激活基因锁，无法注册小程序。请先完成四大共同体认同和心性天平考核。',
          needsGeneLock: true
        }, { status: 403 })
      }
    }

    // 为小程序创建基因锁
    const geneLock = await prisma.geneLockRecord.create({
      data: {
        holderType: 'app',
        holderId: 'pending', // 创建后更新
        destinyCommunity: true,
        disabledAbleCommunity: true,
        loveCommunity: true,
        laborCommunity: true,
        heartScaleScore: minMoralScore || 0,
        loyaltyScore: 60,
        kindnessProof: `小程序【${name}】自动创建的基因锁`,
        status: 'active',
        agreedToTerms: true,
      }
    })

    // 创建小程序
    const app = await prisma.miniApp.create({
      data: {
        name,
        description,
        icon: icon || '📱',
        coverImage,
        developerId,
        developerName,
        entryType: entryType || 'route',
        entryUrl,
        entryRoute,
        category: category || 'tool',
        tags: tags ? JSON.stringify(tags) : null,
        geneLockId: geneLock.id,
        requiresGeneLock: requiresGeneLock !== false,
        minMoralScore: minMoralScore || 0,
        requiredCommunityTags: requiredCommunityTags ? JSON.stringify(requiredCommunityTags) : null,
        preferredNodeId,
        status: 'pending', // 待审核
      }
    })

    // 更新基因锁的holderId
    await prisma.geneLockRecord.update({
      where: { id: geneLock.id },
      data: { holderId: app.id }
    })

    return NextResponse.json({ app, geneLockId: geneLock.id }, { status: 201 })
  } catch (error) {
    console.error('注册小程序失败:', error)
    return NextResponse.json({ error: '注册小程序失败' }, { status: 500 })
  }
}
