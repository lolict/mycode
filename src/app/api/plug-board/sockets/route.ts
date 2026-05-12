import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SOCKET_TYPES, getCompatiblePlugTypes } from '@/lib/plug-socket-registry'

// GET /api/plug-board/sockets — 获取所有插槽
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const socketTypeCode = searchParams.get('socketType')
    const consumer = searchParams.get('consumer')

    const where: any = { isActive: true }
    if (socketTypeCode) where.socketTypeCode = socketTypeCode
    if (consumer) where.consumer = consumer

    const sockets = await db.socket.findMany({
      where,
      include: {
        socketType: true,
        connections: {
          where: { status: 'active' },
          include: { plug: true },
        },
      },
      orderBy: { socketTypeCode: 'asc' },
    })

    const result = sockets.map(s => ({
      ...s,
      location: s.location ? JSON.parse(s.location) : null,
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

    return NextResponse.json({
      sockets: result,
      socketTypes: SOCKET_TYPES,
    })
  } catch (error) {
    console.error('获取插槽列表失败:', error)
    return NextResponse.json({ error: '获取插槽列表失败' }, { status: 500 })
  }
}
