import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PLUG_TYPES, getCompatibleSocketTypes } from '@/lib/plug-socket-registry'

// GET /api/plugboard/instances/plugs — 获取所有插头实例（从数据库）
export async function GET() {
  try {
    const plugs = await db.plugModel.findMany({
      where: { status: 'active' },
      include: { _count: { select: { connections: { where: { status: 'active' } } } } },
      orderBy: { plugTypeCode: 'asc' },
    })

    const result = plugs.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      plugTypeCode: p.plugTypeCode,
      provider: p.provider,
      pinValues: p.pinValues ? JSON.parse(p.pinValues) : null,
      version: p.version,
      sourceModule: p.sourceModule,
      plugTypeInfo: PLUG_TYPES.find(pt => pt.code === p.plugTypeCode),
      compatibleSocketTypes: getCompatibleSocketTypes(p.plugTypeCode),
      activeConnections: p._count.connections,
    }))

    return NextResponse.json({ plugs: result, plugTypes: PLUG_TYPES })
  } catch (error) {
    console.error('获取插头列表失败:', error)
    return NextResponse.json({ error: '获取插头列表失败' }, { status: 500 })
  }
}
