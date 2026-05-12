import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  PLUG_TYPES, SOCKET_TYPES, COMPATIBLE_RULES,
  DEFAULT_PLUGS, DEFAULT_SOCKETS, DEFAULT_CONNECTIONS
} from '@/lib/plug-socket-registry'

// POST /api/plug-board/init — 初始化插板系统（写入所有型号、默认插头/插槽/连接）
export async function POST(request: Request) {
  try {
    const results = { plugTypes: 0, socketTypes: 0, rules: 0, plugs: 0, sockets: 0, connections: 0, errors: [] as string[] }

    // 1. 写入插头型号
    for (const pt of PLUG_TYPES) {
      try {
        await db.plugType.upsert({
          where: { code: pt.code },
          update: { name: pt.name, description: pt.description, pinCount: pt.pinCount, pinDefs: JSON.stringify(pt.pinDefs), icon: pt.icon, color: pt.color },
          create: { code: pt.code, name: pt.name, description: pt.description, pinCount: pt.pinCount, pinDefs: JSON.stringify(pt.pinDefs), icon: pt.icon, color: pt.color },
        })
        results.plugTypes++
      } catch (e: any) { results.errors.push(`PlugType ${pt.code}: ${e.message}`) }
    }

    // 2. 写入插槽型号
    for (const st of SOCKET_TYPES) {
      try {
        await db.socketType.upsert({
          where: { code: st.code },
          update: { name: st.name, description: st.description, pinCount: st.pinCount, pinDefs: JSON.stringify(st.pinDefs), icon: st.icon, color: st.color },
          create: { code: st.code, name: st.name, description: st.description, pinCount: st.pinCount, pinDefs: JSON.stringify(st.pinDefs), icon: st.icon, color: st.color },
        })
        results.socketTypes++
      } catch (e: any) { results.errors.push(`SocketType ${st.code}: ${e.message}`) }
    }

    // 3. 写入兼容规则
    for (const rule of COMPATIBLE_RULES) {
      try {
        await db.compatibleRule.upsert({
          where: { plugTypeCode_socketTypeCode: { plugTypeCode: rule.plugTypeCode, socketTypeCode: rule.socketTypeCode } },
          update: { transform: rule.transform || null, priority: rule.priority, description: rule.description },
          create: { plugTypeCode: rule.plugTypeCode, socketTypeCode: rule.socketTypeCode, transform: rule.transform || null, priority: rule.priority, description: rule.description },
        })
        results.rules++
      } catch (e: any) { results.errors.push(`Rule ${rule.plugTypeCode}→${rule.socketTypeCode}: ${e.message}`) }
    }

    // 4. 写入默认插头
    for (const p of DEFAULT_PLUGS) {
      try {
        await db.plug.upsert({
          where: { code: p.code },
          update: { name: p.name, description: p.description, plugTypeCode: p.plugTypeCode, provider: p.provider, pinValues: p.pinValues, sourceModule: p.sourceModule || null },
          create: { code: p.code, name: p.name, description: p.description, plugTypeCode: p.plugTypeCode, provider: p.provider, pinValues: p.pinValues, sourceModule: p.sourceModule || null },
        })
        results.plugs++
      } catch (e: any) { results.errors.push(`Plug ${p.code}: ${e.message}`) }
    }

    // 5. 写入默认插槽
    for (const s of DEFAULT_SOCKETS) {
      try {
        await db.socket.upsert({
          where: { code: s.code },
          update: { name: s.name, description: s.description, socketTypeCode: s.socketTypeCode, consumer: s.consumer, location: s.location, isRequired: s.isRequired, allowMultiple: s.allowMultiple },
          create: { code: s.code, name: s.name, description: s.description, socketTypeCode: s.socketTypeCode, consumer: s.consumer, location: s.location, isRequired: s.isRequired, allowMultiple: s.allowMultiple },
        })
        results.sockets++
      } catch (e: any) { results.errors.push(`Socket ${s.code}: ${e.message}`) }
    }

    // 6. 写入默认连接
    for (const conn of DEFAULT_CONNECTIONS) {
      try {
        const plug = await db.plug.findUnique({ where: { code: conn.plugCode } })
        const socket = await db.socket.findUnique({ where: { code: conn.socketCode } })
        if (!plug || !socket) { results.errors.push(`Connection ${conn.plugCode}→${conn.socketCode}: plug or socket not found`); continue }

        const existing = await db.plugConnection.findFirst({
          where: { plugId: plug.id, socketId: socket.id, status: 'active' }
        })
        if (!existing) {
          await db.plugConnection.create({
            data: { plugId: plug.id, socketId: socket.id, status: 'active', signalChannel: conn.signalChannel || null }
          })
          results.connections++
        }
      } catch (e: any) { results.errors.push(`Connection ${conn.plugCode}→${conn.socketCode}: ${e.message}`) }
    }

    return NextResponse.json({ success: true, results }, { status: 201 })
  } catch (error) {
    console.error('初始化插板系统失败:', error)
    return NextResponse.json({ error: '初始化插板系统失败' }, { status: 500 })
  }
}

// GET /api/plug-board/init — 获取插板系统状态
export async function GET(request: Request) {
  try {
    const [plugTypeCount, socketTypeCount, ruleCount, plugCount, socketCount, connectionCount] = await Promise.all([
      db.plugType.count(),
      db.socketType.count(),
      db.compatibleRule.count(),
      db.plug.count(),
      db.socket.count(),
      db.plugConnection.count({ where: { status: 'active' } }),
    ])

    return NextResponse.json({
      initialized: plugTypeCount > 0,
      stats: { plugTypeCount, socketTypeCount, ruleCount, plugCount, socketCount, connectionCount },
    })
  } catch (error) {
    console.error('获取插板状态失败:', error)
    return NextResponse.json({ error: '获取插板状态失败' }, { status: 500 })
  }
}
