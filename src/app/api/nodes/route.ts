import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/nodes - 获取节点列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const nodeType = searchParams.get('nodeType')

    const where: Record<string, unknown> = { status }
    if (nodeType) where.nodeType = nodeType

    const nodes = await prisma.nodeRegistry.findMany({
      where,
      include: {
        contributor: { select: { id: true, name: true, email: true } },
        miniApps: { select: { id: true, name: true, status: true } }
      },
      orderBy: { uptime: 'desc' }
    })

    // 不返回authToken
    const safeNodes = nodes.map(({ authToken, ...node }) => node)

    return NextResponse.json({
      nodes: safeNodes,
      total: safeNodes.length
    })
  } catch (error) {
    console.error('获取节点列表失败:', error)
    return NextResponse.json({ error: '获取节点列表失败' }, { status: 500 })
  }
}

// POST /api/nodes - 注册新的分布式节点
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name, description, nodeType,
      endpoint, protocol, authToken,
      contributorId, contributorName,
      capabilities, region, maxConcurrent,
      requiresGeneLock
    } = body

    if (!name || !endpoint || !contributorId) {
      return NextResponse.json({ error: '缺少必要字段：name, endpoint, contributorId' }, { status: 400 })
    }

    // 检查贡献者是否有基因锁
    if (requiresGeneLock !== false) {
      const geneLock = await prisma.geneLockRecord.findFirst({
        where: { holderType: 'user', holderId: contributorId, status: 'active' }
      })
      if (!geneLock) {
        return NextResponse.json({
          error: '贡献者未激活基因锁，无法注册节点。请先完成四大共同体认同。',
          needsGeneLock: true
        }, { status: 403 })
      }
    }

    const node = await prisma.nodeRegistry.create({
      data: {
        name,
        description,
        nodeType: nodeType || 'server',
        endpoint,
        protocol: protocol || 'https',
        authToken,
        contributorId,
        contributorName,
        capabilities: capabilities ? JSON.stringify(capabilities) : null,
        region,
        maxConcurrent: maxConcurrent || 100,
        status: 'pending', // 待验证
        requiresGeneLock: requiresGeneLock !== false,
      }
    })

    return NextResponse.json({ node }, { status: 201 })
  } catch (error) {
    console.error('注册节点失败:', error)
    return NextResponse.json({ error: '注册节点失败' }, { status: 500 })
  }
}

// PUT /api/nodes - 节点心跳
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { nodeId } = body

    if (!nodeId) {
      return NextResponse.json({ error: '缺少nodeId' }, { status: 400 })
    }

    const node = await prisma.nodeRegistry.update({
      where: { id: nodeId },
      data: { lastHeartbeat: new Date(), status: 'active' }
    })

    return NextResponse.json({ node })
  } catch (error) {
    console.error('节点心跳失败:', error)
    return NextResponse.json({ error: '节点心跳失败' }, { status: 500 })
  }
}
