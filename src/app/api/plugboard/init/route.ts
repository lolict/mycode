import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  PLUG_TYPES, SOCKET_TYPES, COMPATIBLE_RULES,
  DEFAULT_PLUGS, DEFAULT_SOCKETS, DEFAULT_CONNECTIONS,
} from '@/lib/plug-socket-registry'
import {
  PRESET_VOCAB_MODELS, PRESET_UI_MODELS, PRESET_NEURAL_NODES,
} from '@/lib/plugboard'

// POST /api/plugboard/init — 初始化插板系统（写入所有默认数据）
export async function POST() {
  try {
    const results = { plugTypes: 0, socketTypes: 0, rules: 0, plugs: 0, sockets: 0, connections: 0, vocabModels: 0, uiModels: 0, neuralNodes: 0, errors: [] as string[] }

    // 1. 写入默认插头实例
    for (const p of DEFAULT_PLUGS) {
      try {
        await db.plugModel.upsert({
          where: { code: p.code },
          update: { name: p.name, description: p.description, plugTypeCode: p.plugTypeCode, provider: p.provider, pinValues: p.pinValues, sourceModule: p.sourceModule || null },
          create: { code: p.code, name: p.name, description: p.description, plugTypeCode: p.plugTypeCode, provider: p.provider, pinValues: p.pinValues, sourceModule: p.sourceModule || null },
        })
        results.plugs++
      } catch (e: any) { results.errors.push(`Plug ${p.code}: ${e.message}`) }
    }

    // 2. 写入默认插槽实例
    for (const s of DEFAULT_SOCKETS) {
      try {
        await db.slotModel.upsert({
          where: { code: s.code },
          update: { name: s.name, description: s.description, socketTypeCode: s.socketTypeCode, consumer: s.consumer, location: s.location, isRequired: s.isRequired, allowMultiple: s.allowMultiple },
          create: { code: s.code, name: s.name, description: s.description, socketTypeCode: s.socketTypeCode, consumer: s.consumer, location: s.location, isRequired: s.isRequired, allowMultiple: s.allowMultiple },
        })
        results.sockets++
      } catch (e: any) { results.errors.push(`Slot ${s.code}: ${e.message}`) }
    }

    // 3. 写入默认连接
    for (const conn of DEFAULT_CONNECTIONS) {
      try {
        const plug = await db.plugModel.findUnique({ where: { code: conn.plugCode } })
        const slot = await db.slotModel.findUnique({ where: { code: conn.socketCode } })
        if (!plug || !slot) { results.errors.push(`Connection ${conn.plugCode}→${conn.socketCode}: plug or slot not found`); continue }

        const existing = await db.plugConnection.findFirst({
          where: { plugId: plug.id, slotId: slot.id, status: 'active' }
        })
        if (!existing) {
          await db.plugConnection.create({
            data: { plugId: plug.id, slotId: slot.id, status: 'active', signalChannel: conn.signalChannel || null }
          })
          results.connections++
        }
      } catch (e: any) { results.errors.push(`Connection ${conn.plugCode}→${conn.socketCode}: ${e.message}`) }
    }

    // 4. 写入词汇型号
    for (const vm of PRESET_VOCAB_MODELS) {
      try {
        await db.vocabPlugModel.upsert({
          where: { code: vm.code },
          update: { name: vm.name, category: vm.category, vocabulary: JSON.stringify(vm.vocabulary), plugSpec: JSON.stringify(vm.plugSpec), slotSpec: JSON.stringify(vm.slotSpec), neuralMap: vm.neuralMap ? JSON.stringify(vm.neuralMap) : null, version: vm.version },
          create: { code: vm.code, name: vm.name, category: vm.category, vocabulary: JSON.stringify(vm.vocabulary), plugSpec: JSON.stringify(vm.plugSpec), slotSpec: JSON.stringify(vm.slotSpec), neuralMap: vm.neuralMap ? JSON.stringify(vm.neuralMap) : null, version: vm.version },
        })
        results.vocabModels++
      } catch (e: any) { results.errors.push(`VocabModel ${vm.code}: ${e.message}`) }
    }

    // 5. 写入UI型号
    for (const um of PRESET_UI_MODELS) {
      try {
        await db.uIPlugModel.upsert({
          where: { code: um.code },
          update: { name: um.name, uiType: um.uiType, template: JSON.stringify(um.template), plugSpec: JSON.stringify(um.plugSpec), slotSpec: JSON.stringify(um.slotSpec), styleSpec: um.styleSpec ? JSON.stringify(um.styleSpec) : null, behaviorSpec: um.behaviorSpec ? JSON.stringify(um.behaviorSpec) : null, neuralMap: um.neuralMap ? JSON.stringify(um.neuralMap) : null, version: um.version },
          create: { code: um.code, name: um.name, uiType: um.uiType, template: JSON.stringify(um.template), plugSpec: JSON.stringify(um.plugSpec), slotSpec: JSON.stringify(um.slotSpec), styleSpec: um.styleSpec ? JSON.stringify(um.styleSpec) : null, behaviorSpec: um.behaviorSpec ? JSON.stringify(um.behaviorSpec) : null, neuralMap: um.neuralMap ? JSON.stringify(um.neuralMap) : null, version: um.version },
        })
        results.uiModels++
      } catch (e: any) { results.errors.push(`UIModel ${um.code}: ${e.message}`) }
    }

    // 6. 写入神经节点
    for (const nn of PRESET_NEURAL_NODES) {
      try {
        await db.neuralNode.upsert({
          where: { code: nn.code },
          update: { name: nn.name, description: nn.description || null, nodeType: nn.nodeType, activationFunction: nn.activationFunction, threshold: nn.threshold, inputs: nn.inputs ? JSON.stringify(nn.inputs) : null, outputs: nn.outputs ? JSON.stringify(nn.outputs) : null },
          create: { code: nn.code, name: nn.name, description: nn.description || null, nodeType: nn.nodeType, activationFunction: nn.activationFunction, threshold: nn.threshold, inputs: nn.inputs ? JSON.stringify(nn.inputs) : null, outputs: nn.outputs ? JSON.stringify(nn.outputs) : null },
        })
        results.neuralNodes++
      } catch (e: any) { results.errors.push(`NeuralNode ${nn.code}: ${e.message}`) }
    }

    return NextResponse.json({ success: true, results }, { status: 201 })
  } catch (error) {
    console.error('初始化插板系统失败:', error)
    return NextResponse.json({ error: '初始化插板系统失败' }, { status: 500 })
  }
}

// GET /api/plugboard/init — 获取插板系统状态
export async function GET() {
  try {
    const [plugCount, slotCount, connectionCount, vocabCount, uiCount, neuralCount] = await Promise.all([
      db.plugModel.count(),
      db.slotModel.count(),
      db.plugConnection.count({ where: { status: 'active' } }),
      db.vocabPlugModel.count(),
      db.uIPlugModel.count(),
      db.neuralNode.count(),
    ])

    return NextResponse.json({
      initialized: plugCount > 0,
      stats: { plugCount, slotCount, connectionCount, vocabCount, uiCount, neuralCount },
    })
  } catch (error) {
    console.error('获取插板状态失败:', error)
    return NextResponse.json({ error: '获取插板状态失败' }, { status: 500 })
  }
}
