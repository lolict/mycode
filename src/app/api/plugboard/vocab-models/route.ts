import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { plugBoardRegistry } from '@/lib/plugboard'

export async function GET() {
  try {
    const vocabModels = plugBoardRegistry.listVocabModels()
    return NextResponse.json({ vocabModels, total: vocabModels.length })
  } catch (error) {
    console.error('Failed to fetch vocab plug models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vocab plug models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, category, vocabulary, plugSpec, slotSpec, neuralMap, version, status } = body

    if (!code || !name || !category || !vocabulary || !plugSpec || !slotSpec) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, category, vocabulary, plugSpec, slotSpec' },
        { status: 400 }
      )
    }

    const vocabModel = await db.vocabPlugModel.create({
      data: {
        code,
        name,
        category,
        vocabulary: typeof vocabulary === 'string' ? vocabulary : JSON.stringify(vocabulary),
        plugSpec: typeof plugSpec === 'string' ? plugSpec : JSON.stringify(plugSpec),
        slotSpec: typeof slotSpec === 'string' ? slotSpec : JSON.stringify(slotSpec),
        neuralMap: neuralMap ? (typeof neuralMap === 'string' ? neuralMap : JSON.stringify(neuralMap)) : null,
        version: version ?? '1.0.0',
        status: status ?? 'active',
      },
    })

    return NextResponse.json(vocabModel, { status: 201 })
  } catch (error) {
    console.error('Failed to create vocab plug model:', error)
    return NextResponse.json(
      { error: 'Failed to create vocab plug model' },
      { status: 500 }
    )
  }
}
