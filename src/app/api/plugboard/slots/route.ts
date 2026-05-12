import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { plugBoardRegistry } from '@/lib/plugboard'

export async function GET() {
  try {
    const slots = plugBoardRegistry.listSlots()
    return NextResponse.json({ slots, total: slots.length })
  } catch (error) {
    console.error('Failed to fetch slot models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch slot models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, slotType, version, description, interfaceSpec, capacity, requiredType, config, tags, status } = body

    if (!code || !name || !slotType || !description || !interfaceSpec) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, slotType, description, interfaceSpec' },
        { status: 400 }
      )
    }

    const slot = await db.slotModel.create({
      data: {
        code,
        name,
        slotType,
        version: version ?? '1.0.0',
        description,
        interfaceSpec: typeof interfaceSpec === 'string' ? interfaceSpec : JSON.stringify(interfaceSpec),
        capacity: capacity ?? 1,
        requiredType: requiredType ?? null,
        config: config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null,
        tags: tags ?? null,
        status: status ?? 'active',
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    console.error('Failed to create slot model:', error)
    return NextResponse.json(
      { error: 'Failed to create slot model' },
      { status: 500 }
    )
  }
}
