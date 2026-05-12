import { NextRequest, NextResponse } from 'next/server'
import { getVolunteerNodeManager, type VolunteerNode } from '@/core/v2/cloud/volunteer'

/**
 * 志愿者节点 API
 *
 * POST /api/cloud/nodes — 注册新节点
 * GET  /api/cloud/nodes — 获取所有节点
 * GET  /api/cloud/nodes?best=true — 获取最优节点
 * DELETE /api/cloud/nodes?id=xxx — 移除节点
 */

// 内存中的节点列表（生产环境应持久化到数据库）
const registeredNodes: VolunteerNode[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const best = searchParams.get('best')

  const manager = getVolunteerNodeManager()

  if (best === 'true') {
    const bestNode = manager.getBestNode()
    return NextResponse.json({ node: bestNode })
  }

  return NextResponse.json({
    nodes: registeredNodes,
    total: registeredNodes.length,
    active: registeredNodes.filter(n => n.status === 'active').length,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, url, description, providedBy, contactInfo, nodeType, region, capabilities } = body

  // 验证必填字段
  if (!name || !url || !providedBy) {
    return NextResponse.json(
      { error: '请填写节点名称、服务器地址和志愿者名称' },
      { status: 400 }
    )
  }

  // 验证 URL 格式
  try {
    new URL(url)
  } catch {
    return NextResponse.json(
      { error: '服务器地址格式不正确，请输入完整的URL（例如 https://example.com）' },
      { status: 400 }
    )
  }

  const manager = getVolunteerNodeManager()

  // 注册节点（自动检测健康状态）
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

  registeredNodes.push(node)

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
