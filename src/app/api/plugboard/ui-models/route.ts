import { NextRequest, NextResponse } from 'next/server'
import { plugBoardRegistry } from '@/lib/plugboard'

// GET /api/plugboard/ui-models — 获取所有UI型号
export async function GET() {
  try {
    const uiModels = plugBoardRegistry.listUIModels()
    return NextResponse.json({ uiModels, total: uiModels.length })
  } catch (error) {
    console.error('Failed to fetch UI plug models:', error)
    return NextResponse.json({ error: 'Failed to fetch UI plug models' }, { status: 500 })
  }
}

// POST /api/plugboard/ui-models — 创建UI型号
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, uiType, template, plugSpec, slotSpec, styleSpec, behaviorSpec, neuralMap, version } = body

    if (!code || !name || !uiType || !template || !plugSpec || !slotSpec) {
      return NextResponse.json({ error: 'Missing required fields: code, name, uiType, template, plugSpec, slotSpec' }, { status: 400 })
    }

    plugBoardRegistry.registerUIModel({
      code,
      name,
      uiType,
      template: typeof template === 'string' ? JSON.parse(template) : template,
      plugSpec: typeof plugSpec === 'string' ? JSON.parse(plugSpec) : plugSpec,
      slotSpec: typeof slotSpec === 'string' ? JSON.parse(slotSpec) : slotSpec,
      styleSpec: styleSpec ? (typeof styleSpec === 'string' ? JSON.parse(styleSpec) : styleSpec) : undefined,
      behaviorSpec: behaviorSpec ? (typeof behaviorSpec === 'string' ? JSON.parse(behaviorSpec) : behaviorSpec) : undefined,
      neuralMap: neuralMap ? (typeof neuralMap === 'string' ? JSON.parse(neuralMap) : neuralMap) : undefined,
      version: version ?? '1.0.0',
    })

    return NextResponse.json({ success: true, code }, { status: 201 })
  } catch (error) {
    console.error('Failed to create UI plug model:', error)
    return NextResponse.json({ error: 'Failed to create UI plug model' }, { status: 500 })
  }
}
