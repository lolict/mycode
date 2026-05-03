import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/nodes/[nodeId] - Get single node details with full stats
export async function GET(
  request: Request,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { nodeId } = await params
    const node = await prisma.nodeRegistry.findUnique({
      where: { id: nodeId },
      include: {
        contributor: { select: { id: true, name: true, email: true } },
        miniApps: { select: { id: true, name: true, status: true, installCount: true, runCount: true } }
      }
    })

    if (!node) {
      return NextResponse.json({ error: '节点不存在' }, { status: 404 })
    }

    // Remove authToken from response
    const { authToken, ...safeNode } = node

    return NextResponse.json({ node: safeNode })
  } catch (error) {
    console.error('获取节点详情失败:', error)
    return NextResponse.json({ error: '获取节点详情失败' }, { status: 500 })
  }
}

// PATCH /api/nodes/[nodeId] - Update node stats
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { nodeId } = await params
    const body = await request.json()
    const { successRate, avgLatency, totalRequests, uptime, status } = body

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

// DELETE /api/nodes/[nodeId] - Remove a node (set status to offline)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { nodeId } = await params
    const node = await prisma.nodeRegistry.findUnique({ where: { id: nodeId } })
    if (!node) {
      return NextResponse.json({ error: '节点不存在' }, { status: 404 })
    }

    const updated = await prisma.nodeRegistry.update({
      where: { id: nodeId },
      data: { status: 'offline' }
    })

    const { authToken, ...safeNode } = updated

    return NextResponse.json({ node: safeNode, message: '节点已下线' })
  } catch (error) {
    console.error('删除节点失败:', error)
    return NextResponse.json({ error: '删除节点失败' }, { status: 500 })
  }
}
