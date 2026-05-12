import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { plugBoardRegistry } from '@/lib/plugboard'

export async function GET() {
  try {
    const uiModels = plugBoardRegistry.listUIModels()
    return NextResponse.json({ uiModels, total: uiModels.length })
  } catch (error) {
    console.error('Failed to fetch UI plug models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch UI plug models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, uiType, template, plugSpec, slotSpec, styleSpec, behaviorSpec, neuralMap, version, status } = body

    if (!code || !name || !uiType || !template || !plugSpec || !slotSpec) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, uiType, template, plugSpec, slotSpec' },
        { status: 400 }
      )
    }

    const uiModel = await db.uIPlugModel.create({
      data: {
        code,
        name,
        uiType,
        template: typeof template === 'string' ? template : JSON.stringify(template),
        plugSpec: typeof plugSpec === 'string' ? plugSpec : JSON.stringify(plugSpec),
        slotSpec: typeof slotSpec === 'string' ? slotSpec : JSON.stringify(slotSpec),
        styleSpec: styleSpec ? (typeof styleSpec === 'string' ? styleSpec : JSON.stringify(styleSpec)) : null,
        behaviorSpec: behaviorSpec ? (typeof behaviorSpec === 'string' ? behaviorSpec : JSON.stringify(behaviorSpec)) : null,
        neuralMap: neuralMap ? (typeof neuralMap === 'string' ? neuralMap : JSON.stringify(neuralMap)) : null,
        version: version ?? '1.0.0',
        status: status ?? 'active',
      },
    })

    return NextResponse.json(uiModel, { status: 201 })
  } catch (error) {
    console.error('Failed to create UI plug model:', error)
    return NextResponse.json(
      { error: 'Failed to create UI plug model' },
      { status: 500 }
    )
  }
}
