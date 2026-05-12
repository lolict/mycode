import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEXI_MODULES, DEXI_CATEGORIES } from '@/lib/dexi-registry'

export async function GET() {
  try {
    return NextResponse.json({
      modules: DEXI_MODULES,
      categories: DEXI_CATEGORIES,
    })
  } catch (error) {
    console.error('Failed to fetch dexi modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dexi modules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, category, description, version, status, config, parentId, sortOrder } = body

    if (!code || !name || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, category, description' },
        { status: 400 }
      )
    }

    const module = await db.dexiModule.create({
      data: {
        code,
        name,
        category,
        description,
        version: version ?? '1.0.0',
        status: status ?? 'active',
        config: config ? JSON.stringify(config) : null,
        parentId: parentId ?? null,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    console.error('Failed to create dexi module:', error)
    return NextResponse.json(
      { error: 'Failed to create dexi module' },
      { status: 500 }
    )
  }
}
