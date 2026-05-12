import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isCompatible, COMPATIBLE_RULES } from '@/lib/plug-socket-registry'

// POST /api/plug-board/connect — 将插头插入插槽
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plugCode, socketCode } = body

    if (!plugCode || !socketCode) {
      return NextResponse.json({ error: '缺少plugCode或socketCode' }, { status: 400 })
    }

    const plug = await db.plug.findUnique({ where: { code: plugCode } })
    const socket = await db.socket.findUnique({ where: { code: socketCode } })

    if (!plug) {
      return NextResponse.json({ error: `插头 ${plugCode} 不存在` }, { status: 404 })
    }
    if (!socket) {
      return NextResponse.json({ error: `插槽 ${socketCode} 不存在` }, { status: 404 })
    }

    // 检查型号兼容性
    if (!isCompatible(plug.plugTypeCode, socket.socketTypeCode)) {
      return NextResponse.json({
        error: '型号不兼容',
        detail: `${plug.plugTypeCode}型号插头无法插入${socket.socketTypeCode}型号插槽`,
        plugType: plug.plugTypeCode,
        socketType: socket.socketTypeCode,
        compatibleRules: COMPATIBLE_RULES.filter(r => r.socketTypeCode === socket.socketTypeCode),
      }, { status: 409 })
    }

    // 检查是否已有活跃连接
    const existing = await db.plugConnection.findFirst({
      where: { socketId: socket.id, status: 'active' }
    })

    if (existing && !socket.allowMultiple) {
      // 先断开旧连接
      await db.plugConnection.update({
        where: { id: existing.id },
        data: { status: 'disconnected', disconnectedAt: new Date() },
      })
    }

    // 获取兼容规则
    const rule = COMPATIBLE_RULES.find(
      r => r.plugTypeCode === plug.plugTypeCode && r.socketTypeCode === socket.socketTypeCode
    )

    // 创建新连接
    const connection = await db.plugConnection.create({
      data: {
        plugId: plug.id,
        socketId: socket.id,
        status: 'active',
        transformResult: rule?.transform || null,
        signalChannel: `plug:${plugCode}:connected`,
      }
    })

    return NextResponse.json({
      connection: {
        id: connection.id,
        plugCode: plug.code,
        plugName: plug.name,
        plugType: plug.plugTypeCode,
        socketCode: socket.code,
        socketName: socket.name,
        socketType: socket.socketTypeCode,
        rule: rule ? { priority: rule.priority, description: rule.description, transform: rule.transform } : null,
        signalChannel: connection.signalChannel,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('连接插头插槽失败:', error)
    return NextResponse.json({ error: '连接插头插槽失败' }, { status: 500 })
  }
}

// DELETE /api/plug-board/connect — 断开连接
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connectionId')

    if (!connectionId) {
      return NextResponse.json({ error: '缺少connectionId' }, { status: 400 })
    }

    const connection = await db.plugConnection.update({
      where: { id: connectionId },
      data: { status: 'disconnected', disconnectedAt: new Date() },
    })

    return NextResponse.json({ disconnected: true, connectionId })
  } catch (error) {
    console.error('断开连接失败:', error)
    return NextResponse.json({ error: '断开连接失败' }, { status: 500 })
  }
}
