import { NextResponse } from 'next/server'
import { plugBoardRegistry } from '@/lib/plugboard'
import { db } from '@/lib/db'

// GET /api/plugboard/neural-nodes — 获取所有神经节点
export async function GET() {
  try {
    // First try DB, then fallback to registry
    const dbNodes = await db.neuralNode.findMany({ where: { isActive: true } })
    if (dbNodes.length > 0) {
      const nodes = dbNodes.map(n => ({
        code: n.code,
        name: n.name,
        description: n.description,
        nodeType: n.nodeType,
        activationFunction: n.activationFunction,
        threshold: n.threshold,
        inputs: n.inputs ? JSON.parse(n.inputs) : undefined,
        outputs: n.outputs ? JSON.parse(n.outputs) : undefined,
      }))
      return NextResponse.json({ nodes, total: nodes.length })
    }

    // Fallback to registry
    const registryNodes = plugBoardRegistry.listNeuralNodes()
    return NextResponse.json({ nodes: registryNodes, total: registryNodes.length })
  } catch (error) {
    console.error('Failed to fetch neural nodes:', error)
    return NextResponse.json({ error: 'Failed to fetch neural nodes' }, { status: 500 })
  }
}
