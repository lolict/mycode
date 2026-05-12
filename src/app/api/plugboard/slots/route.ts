import { NextRequest, NextResponse } from 'next/server'
import { plugBoardRegistry } from '@/lib/plugboard'

// GET /api/plugboard/slots — 获取所有插槽型号定义（来自内存注册表）
export async function GET() {
  try {
    const slots = plugBoardRegistry.listSlots()
    return NextResponse.json({ slots, total: slots.length })
  } catch (error) {
    console.error('Failed to fetch slot models:', error)
    return NextResponse.json({ error: 'Failed to fetch slot models' }, { status: 500 })
  }
}

// POST /api/plugboard/slots — 创建插槽型号定义
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, slotType, version, description, interfaceSpec, capacity, requiredType, config, tags, consumer, location, isRequired, allowMultiple } = body

    if (!code || !name || !slotType || !description || !interfaceSpec) {
      return NextResponse.json({ error: 'Missing required fields: code, name, slotType, description, interfaceSpec' }, { status: 400 })
    }

    // Register in memory
    plugBoardRegistry.registerSlot({
      code,
      name,
      slotType,
      version: version ?? '1.0.0',
      description,
      interfaceSpec: typeof interfaceSpec === 'string' ? JSON.parse(interfaceSpec) : interfaceSpec,
      capacity: capacity ?? 1,
      requiredType,
      config: config ? (typeof config === 'string' ? JSON.parse(config) : config) : undefined,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : undefined,
      consumer,
      location: location ? (typeof location === 'string' ? JSON.parse(location) : location) : undefined,
      isRequired,
      allowMultiple,
    })

    return NextResponse.json({ success: true, code }, { status: 201 })
  } catch (error) {
    console.error('Failed to create slot model:', error)
    return NextResponse.json({ error: 'Failed to create slot model' }, { status: 500 })
  }
}
