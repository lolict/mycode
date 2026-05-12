import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { plugBoardRegistry } from '@/lib/plugboard'

export async function GET() {
  try {
    const plugs = plugBoardRegistry.listPlugs()
    return NextResponse.json({ plugs, total: plugs.length })
  } catch (error) {
    console.error('Failed to fetch plug models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plug models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, plugType, version, description, interfaceSpec, config, dependencies, tags, author, status } = body

    if (!code || !name || !plugType || !description || !interfaceSpec) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, plugType, description, interfaceSpec' },
        { status: 400 }
      )
    }

    const plug = await db.plugModel.create({
      data: {
        code,
        name,
        plugType,
        version: version ?? '1.0.0',
        description,
        interfaceSpec: typeof interfaceSpec === 'string' ? interfaceSpec : JSON.stringify(interfaceSpec),
        config: config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null,
        dependencies: dependencies ? (typeof dependencies === 'string' ? dependencies : JSON.stringify(dependencies)) : null,
        tags: tags ?? null,
        author: author ?? null,
        status: status ?? 'active',
      },
    })

    return NextResponse.json(plug, { status: 201 })
  } catch (error) {
    console.error('Failed to create plug model:', error)
    return NextResponse.json(
      { error: 'Failed to create plug model' },
      { status: 500 }
    )
  }
}
