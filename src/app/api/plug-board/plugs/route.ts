import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PLUG_TYPES, isCompatible, getCompatibleSocketTypes } from '@/lib/plug-socket-registry'

// GET /api/plug-board/plugs — 获取所有插头
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const plugTypeCode = searchParams.get('plugType')
    const provider = searchParams.get('provider')

    const where: any = { isActive: true }
    if (plugTypeCode) where.plugTypeCode = plugTypeCode
    if (provider) where.provider = provider

    const plugs = await db.plug.findMany({
      where,
      include: { plugType: true, _count: { select: { connections: { where: { status: 'active' } } } } },
      orderBy: { plugTypeCode: 'asc' },
    })

    // 为每个插头附加可插入的插槽型号
    const result = plugs.map(p => ({
      ...p,
      pinValues: p.pinValues ? JSON.parse(p.pinValues) : null,
      plugTypeInfo: PLUG_TYPES.find(pt => pt.code === p.plugTypeCode),
      compatibleSocketTypes: getCompatibleSocketTypes(p.plugTypeCode),
      activeConnections: p._count.connections,
    }))

    return NextResponse.json({
      plugs: result,
      plugTypes: PLUG_TYPES,
    })
  } catch (error) {
    console.error('获取插头列表失败:', error)
    return NextResponse.json({ error: '获取插头列表失败' }, { status: 500 })
  }
}
