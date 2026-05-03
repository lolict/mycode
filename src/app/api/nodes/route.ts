import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/nodes - 获取节点列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const nodeType = searchParams.get('nodeType')

    const healthCheck = searchParams.get('healthCheck') === 'true'
    const where: Record<string, unknown> = { status }
    if (nodeType) where.nodeType = nodeType

    // If healthCheck=true, perform lightweight health check on all active nodes
    if (healthCheck) {
      const activeNodes = await prisma.nodeRegistry.findMany({
        where: { status: 'active' },
        include: {
          contributor: { select: { id: true, name: true, email: true } },
          miniApps: { select: { id: true, name: true, status: true } }
        }
      })

      const results = await Promise.allSettled(
        activeNodes.map(async (node) => {
          const startTime = Date.now()
          let isHealthy = false
          let latency = 0
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)
            const response = await fetch(node.endpoint, {
              method: 'HEAD',
              signal: controller.signal,
              headers: node.authToken ? { 'Authorization': `Bearer ${node.authToken}` } : {}
            })
            clearTimeout(timeoutId)
            latency = Date.now() - startTime
            isHealthy = response.ok
          } catch {
            latency = Date.now() - startTime
            isHealthy = false
          }

          const newTotalRequests = node.totalRequests + 1
          const newSuccessRate = isHealthy
            ? ((node.successRate * node.totalRequests) + 100) / newTotalRequests
            : (node.successRate * node.totalRequests) / newTotalRequests
          const newAvgLatency = ((node.avgLatency * node.totalRequests) + latency) / newTotalRequests
          const newUptime = isHealthy
            ? Math.min((node.uptime * node.totalRequests + 1) / (node.totalRequests + 1), 1)
            : (node.uptime * node.totalRequests) / (node.totalRequests + 1)

          await prisma.nodeRegistry.update({
            where: { id: node.id },
            data: {
              status: isHealthy ? 'active' : 'offline',
              lastHeartbeat: new Date(),
              totalRequests: newTotalRequests,
              successRate: Math.max(0, Math.min(100, newSuccessRate)),
              avgLatency: newAvgLatency,
              uptime: newUptime,
            }
          })

          const { authToken, ...safeNode } = node
          return { ...safeNode, healthCheck: { healthy: isHealthy, latency } }
        })
      )

      const safeNodes = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
      return NextResponse.json({ nodes: safeNodes, total: safeNodes.length, healthChecked: true })
    }

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

// PATCH /api/nodes - Update node statistics
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { nodeId, successRate, avgLatency, totalRequests, uptime, status } = body

    if (!nodeId) {
      return NextResponse.json({ error: '缺少nodeId' }, { status: 400 })
    }

    const node = await prisma.nodeRegistry.findUnique({ where: { id: nodeId } })
    if (!node) {
      return NextResponse.json({ error: '节点不存在' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (successRate !== undefined) updateData.successRate = successRate
    if (avgLatency !== undefined) updateData.avgLatency = avgLatency
    if (totalRequests !== undefined) updateData.totalRequests = totalRequests
    if (uptime !== undefined) updateData.uptime = uptime
    if (status !== undefined) updateData.status = status

    const updated = await prisma.nodeRegistry.update({
      where: { id: nodeId },
      data: updateData
    })

    const { authToken, ...safeNode } = updated
    return NextResponse.json({ node: safeNode })
  } catch (error) {
    console.error('更新节点统计失败:', error)
    return NextResponse.json({ error: '更新节点统计失败' }, { status: 500 })
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
