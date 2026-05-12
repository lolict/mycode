import { NextRequest, NextResponse } from 'next/server'
import { plugBoardRegistry } from '@/lib/plugboard'

// GET /api/plugboard/vocab-models — 获取所有词汇型号
export async function GET() {
  try {
    const vocabModels = plugBoardRegistry.listVocabModels()
    return NextResponse.json({ vocabModels, total: vocabModels.length })
  } catch (error) {
    console.error('Failed to fetch vocab plug models:', error)
    return NextResponse.json({ error: 'Failed to fetch vocab plug models' }, { status: 500 })
  }
}

// POST /api/plugboard/vocab-models — 创建词汇型号
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, category, vocabulary, plugSpec, slotSpec, neuralMap, version } = body

    if (!code || !name || !category || !vocabulary || !plugSpec || !slotSpec) {
      return NextResponse.json({ error: 'Missing required fields: code, name, category, vocabulary, plugSpec, slotSpec' }, { status: 400 })
    }

    plugBoardRegistry.registerVocabModel({
      code,
      name,
      category,
      vocabulary: typeof vocabulary === 'string' ? JSON.parse(vocabulary) : vocabulary,
      plugSpec: typeof plugSpec === 'string' ? JSON.parse(plugSpec) : plugSpec,
      slotSpec: typeof slotSpec === 'string' ? JSON.parse(slotSpec) : slotSpec,
      neuralMap: neuralMap ? (typeof neuralMap === 'string' ? JSON.parse(neuralMap) : neuralMap) : undefined,
      version: version ?? '1.0.0',
    })

    return NextResponse.json({ success: true, code }, { status: 201 })
  } catch (error) {
    console.error('Failed to create vocab plug model:', error)
    return NextResponse.json({ error: 'Failed to create vocab plug model' }, { status: 500 })
  }
}
