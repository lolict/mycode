import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SOCKET_TYPES, getCompatiblePlugTypes } from '@/lib/plug-socket-registry'

// GET /api/plugboard/instances/sockets — 获取所有插槽实例（从数据库）
export async function GET() {
  try {
    const sockets = await db.slotModel.findMany({
      where: { status: 'active' },
      include: {
        connections: {
          where: { status: 'active' },
          include: { plug: true },
        },
      },
      orderBy: { socketTypeCode: 'asc' },
    })

    const result = sockets.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description,
      socketTypeCode: s.socketTypeCode,
      consumer: s.consumer,
      location: s.location ? JSON.parse(s.location) : null,
      isRequired: s.isRequired,
      allowMultiple: s.allowMultiple,
      version: s.version,
      socketTypeInfo: SOCKET_TYPES.find(st => st.code === s.socketTypeCode),
      compatiblePlugTypes: getCompatiblePlugTypes(s.socketTypeCode),
      connectedPlugs: s.connections.map(c => ({
        id: c.id,
        plugId: c.plug.id,
        plugCode: c.plug.code,
        plugName: c.plug.name,
        plugTypeCode: c.plug.plugTypeCode,
        plugPinValues: c.plug.pinValues ? JSON.parse(c.plug.pinValues) : null,
        connectedAt: c.connectedAt,
        signalChannel: c.signalChannel,
      })),
    }))

    return NextResponse.json({ sockets: result, socketTypes: SOCKET_TYPES })
  } catch (error) {
    console.error('获取插槽列表失败:', error)
    return NextResponse.json({ error: '获取插槽列表失败' }, { status: 500 })
  }
}
