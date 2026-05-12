import { NextResponse } from 'next/server'

/**
 * 健康检查 API — 志愿者节点的健康端点
 *
 * 每个运行圆聚助残平台的实例都应该有这个端点，
 * 这样其他节点和监控系统可以检查它是否在线。
 */
export async function GET() {
  return NextResponse.json({
    online: true,
    version: '0.1.0',
    platform: '圆聚助残公益众筹平台',
    activeConnections: 0,
    load: 0,
    timestamp: Date.now(),
    features: [
      'crowdfunding',
      'ledger',
      'living-system',
      'cloud-sync',
      'volunteer-node',
    ],
  })
}
