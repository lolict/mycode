import { NextRequest, NextResponse } from 'next/server'
import { plugBoardRegistry } from '@/lib/plugboard'

// GET /api/plugboard/plugs — 获取所有插头型号定义（来自内存注册表）
export async function GET() {
  try {
    const plugs = plugBoardRegistry.listPlugs()
    return NextResponse.json({ plugs, total: plugs.length })
  } catch (error) {
    console.error('Failed to fetch plug models:', error)
    return NextResponse.json({ error: 'Failed to fetch plug models' }, { status: 500 })
  }
}

// POST /api/plugboard/plugs — 创建插头型号定义
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, plugType, version, description, interfaceSpec, config, dependencies, tags, author, provider, pinValues, sourceModule } = body

    if (!code || !name || !plugType || !description || !interfaceSpec) {
      return NextResponse.json({ error: 'Missing required fields: code, name, plugType, description, interfaceSpec' }, { status: 400 })
    }

    // Register in memory
    plugBoardRegistry.registerPlug({
      code,
      name,
      plugType,
      version: version ?? '1.0.0',
      description,
      interfaceSpec: typeof interfaceSpec === 'string' ? JSON.parse(interfaceSpec) : interfaceSpec,
      config: config ? (typeof config === 'string' ? JSON.parse(config) : config) : undefined,
      dependencies: dependencies ? (typeof dependencies === 'string' ? JSON.parse(dependencies) : dependencies) : undefined,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : undefined,
      author,
      provider,
      pinValues: pinValues ? (typeof pinValues === 'string' ? JSON.parse(pinValues) : pinValues) : undefined,
      sourceModule,
    })

    return NextResponse.json({ success: true, code }, { status: 201 })
  } catch (error) {
    console.error('Failed to create plug model:', error)
    return NextResponse.json({ error: 'Failed to create plug model' }, { status: 500 })
  }
}
