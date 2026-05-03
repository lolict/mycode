import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/archive/relations - Get all relations (optional filter by archiveId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const archiveId = searchParams.get('archiveId')
    const relationType = searchParams.get('relationType')

    const where: Record<string, unknown> = {}
    if (archiveId) {
      where.OR = [
        { fromId: archiveId },
        { toId: archiveId }
      ]
    }
    if (relationType) {
      where.relationType = relationType
    }

    const relations = await prisma.archiveRelation.findMany({
      where,
      include: {
        from: { select: { id: true, title: true, layer: true } },
        to: { select: { id: true, title: true, layer: true } }
      },
      orderBy: { distance: 'asc' }
    })

    return NextResponse.json({ relations })
  } catch (error) {
    console.error('获取关系列表失败:', error)
    return NextResponse.json({ error: '获取关系列表失败' }, { status: 500 })
  }
}

// POST /api/archive/relations - Create a new relation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromId, toId, relationType = 'related', distance = 50, description } = body

    if (!fromId || !toId) {
      return NextResponse.json({ error: '源和目标归档ID为必填项' }, { status: 400 })
    }

    if (fromId === toId) {
      return NextResponse.json({ error: '不能创建自关联' }, { status: 400 })
    }

    // Check if relation already exists
    const existing = await prisma.archiveRelation.findUnique({
      where: {
        fromId_toId_relationType: {
          fromId,
          toId,
          relationType
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: '该关系已存在' }, { status: 409 })
    }

    const relation = await prisma.archiveRelation.create({
      data: {
        fromId,
        toId,
        relationType,
        distance,
        description
      },
      include: {
        from: { select: { id: true, title: true, layer: true } },
        to: { select: { id: true, title: true, layer: true } }
      }
    })

    return NextResponse.json({ relation }, { status: 201 })
  } catch (error) {
    console.error('创建关系失败:', error)
    return NextResponse.json({ error: '创建关系失败' }, { status: 500 })
  }
}
