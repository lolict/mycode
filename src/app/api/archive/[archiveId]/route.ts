import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/archive/[archiveId] - Get single archive with relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const { archiveId } = await params

    const archive = await prisma.creativeArchive.findUnique({
      where: { id: archiveId },
      include: {
        category: true,
        outgoingRelations: {
          include: {
            to: { select: { id: true, title: true, layer: true, status: true } }
          }
        },
        incomingRelations: {
          include: {
            from: { select: { id: true, title: true, layer: true, status: true } }
          }
        }
      }
    })

    if (!archive) {
      return NextResponse.json({ error: '归档不存在' }, { status: 404 })
    }

    return NextResponse.json({ archive })
  } catch (error) {
    console.error('获取归档详情失败:', error)
    return NextResponse.json({ error: '获取归档详情失败' }, { status: 500 })
  }
}

// PATCH /api/archive/[archiveId] - Update archive
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const { archiveId } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'title', 'content', 'summary', 'categoryId', 'layer',
      'status', 'priority', 'completion', 'featureVector', 'tags',
      'source', 'version', 'authorId'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'featureVector' && typeof body[field] === 'object') {
          updateData[field] = JSON.stringify(body[field])
        } else if (field === 'tags' && Array.isArray(body[field])) {
          updateData[field] = JSON.stringify(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const archive = await prisma.creativeArchive.update({
      where: { id: archiveId },
      data: updateData,
      include: {
        category: true,
        outgoingRelations: { include: { to: true } },
        incomingRelations: { include: { from: true } }
      }
    })

    return NextResponse.json({ archive })
  } catch (error) {
    console.error('更新归档失败:', error)
    return NextResponse.json({ error: '更新归档失败' }, { status: 500 })
  }
}

// DELETE /api/archive/[archiveId] - Delete archive
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const { archiveId } = await params

    // Delete related relations first
    await prisma.archiveRelation.deleteMany({
      where: {
        OR: [
          { fromId: archiveId },
          { toId: archiveId }
        ]
      }
    })

    await prisma.creativeArchive.delete({
      where: { id: archiveId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除归档失败:', error)
    return NextResponse.json({ error: '删除归档失败' }, { status: 500 })
  }
}
