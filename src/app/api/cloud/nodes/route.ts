import { NextRequest, NextResponse } from 'next/server'
import { getVolunteerNodeManager, type VolunteerNode } from '@/core/v2/cloud/volunteer'

/**
 * 志愿者节点 API (增强版 — 持久化到数据库)
 *
 * POST /api/cloud/nodes — 注册新节点
 * GET  /api/cloud/nodes — 获取所有节点
 * GET  /api/cloud/nodes?best=true — 获取最优节点
 * DELETE /api/cloud/nodes?id=xxx — 移除节点
 * POST /api/cloud/nodes?action=check — 健康检查所有节点
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const best = searchParams.get('best')

  const manager = getVolunteerNodeManager()

  if (best === 'true') {
    const bestNode = await manager.getBestNode()
    return NextResponse.json({ node: bestNode })
  }

  // 从数据库获取所有节点
  const nodes = await manager.getAllNodes()

  return NextResponse.json({
    nodes,
    total: nodes.length,
    active: nodes.filter(n => n.status === 'active').length,
  })
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const manager = getVolunteerNodeManager()

  // 健康检查所有节点
  if (action === 'check') {
    const nodes = await manager.getAllNodes()
    const results = []

    for (const node of nodes) {
      const health = await manager.checkNodeHealth(node.url)
      results.push({
        nodeId: node.id,
        name: node.name,
        online: health.online,
        responseTime: health.responseTime,
      })
    }

    return NextResponse.json({ results })
  }

  // 注册新节点
  const body = await request.json()
  const { name, url, description, providedBy, contactInfo, nodeType, region, capabilities } = body

  if (!name || !url || !providedBy) {
    return NextResponse.json(
      { error: '请填写节点名称、服务器地址和志愿者名称' },
      { status: 400 }
    )
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json(
      { error: '服务器地址格式不正确，请输入完整的URL（例如 https://example.com）' },
      { status: 400 }
    )
  }

  const node = await manager.registerNode({
    name,
    url,
    description,
    providedBy,
    contactInfo,
    nodeType: nodeType || 'full',
    region,
    capabilities: capabilities || [],
  })

  return NextResponse.json({
    success: true,
    message: node.status === 'active'
      ? '节点注册成功！您的服务器已在线。'
      : '节点已注册，但暂时无法连接您的服务器。请确认服务器正在运行。',
    node: {
      id: node.id,
      name: node.name,
      status: node.status,
      lastHeartbeat: node.lastHeartbeat,
    },
  }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: '缺少节点ID' }, { status: 400 })
  }

  const manager = getVolunteerNodeManager()
  const success = await manager.removeNode(id)

  if (success) {
    return NextResponse.json({ success: true, message: '节点已移除' })
  } else {
    return NextResponse.json({ error: '节点不存在或移除失败' }, { status: 404 })
  }
}
