import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// POST /api/nodes/[nodeId]/healthcheck - Trigger health check for a specific node
export async function POST(
  request: Request,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { nodeId } = await params
    const node = await prisma.nodeRegistry.findUnique({ where: { id: nodeId } })

    if (!node) {
      return NextResponse.json({ error: '节点不存在' }, { status: 404 })
    }

    const startTime = Date.now()
    let isHealthy = false
    let latency = 0
    let errorMessage = ''

    try {
      // Attempt a lightweight fetch to the endpoint with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(node.endpoint, {
        method: 'HEAD',
        signal: controller.signal,
        headers: node.authToken ? { 'Authorization': `Bearer ${node.authToken}` } : {}
      })
      
      clearTimeout(timeoutId)
      latency = Date.now() - startTime
      isHealthy = response.ok
    } catch (err) {
      latency = Date.now() - startTime
      isHealthy = false
      errorMessage = err instanceof Error ? err.message : '连接失败'
    }

    // Update node stats
    const newTotalRequests = node.totalRequests + 1
    const newSuccessRate = isHealthy
      ? ((node.successRate * node.totalRequests) + 100) / newTotalRequests
      : (node.successRate * node.totalRequests) / newTotalRequests
    const newAvgLatency = ((node.avgLatency * node.totalRequests) + latency) / newTotalRequests
    const newUptime = isHealthy
      ? Math.min((node.uptime * node.totalRequests + 1) / (node.totalRequests + 1), 1)
      : (node.uptime * node.totalRequests) / (node.totalRequests + 1)

    const updated = await prisma.nodeRegistry.update({
      where: { id: nodeId },
      data: {
        status: isHealthy ? 'active' : 'offline',
        lastHeartbeat: new Date(),
        totalRequests: newTotalRequests,
        successRate: Math.max(0, Math.min(100, newSuccessRate)),
        avgLatency: newAvgLatency,
        uptime: newUptime,
      }
    })

    const { authToken, ...safeNode } = updated

    return NextResponse.json({
      healthy: isHealthy,
      latency,
      errorMessage: errorMessage || undefined,
      node: safeNode
    })
  } catch (error) {
    console.error('健康检查失败:', error)
    return NextResponse.json({ error: '健康检查失败' }, { status: 500 })
  }
}
