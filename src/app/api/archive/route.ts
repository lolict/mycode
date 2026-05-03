import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/archive - List all archives with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const layer = searchParams.get('layer')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (layer) where.layer = layer
    if (status) where.status = status
    if (categoryId) where.categoryId = categoryId
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { summary: { contains: search } },
        { tags: { contains: search } }
      ]
    }

    const archives = await prisma.creativeArchive.findMany({
      where,
      include: {
        category: true,
        outgoingRelations: {
          include: {
            to: { select: { id: true, title: true, layer: true } }
          }
        },
        incomingRelations: {
          include: {
            from: { select: { id: true, title: true, layer: true } }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // 统计信息
    const stats = {
      total: await prisma.creativeArchive.count(),
      byLayer: {
        philosophy: await prisma.creativeArchive.count({ where: { layer: 'philosophy' } }),
        foundation: await prisma.creativeArchive.count({ where: { layer: 'foundation' } }),
        architecture: await prisma.creativeArchive.count({ where: { layer: 'architecture' } }),
        application: await prisma.creativeArchive.count({ where: { layer: 'application' } }),
      },
      byStatus: {
        draft: await prisma.creativeArchive.count({ where: { status: 'draft' } }),
        developing: await prisma.creativeArchive.count({ where: { status: 'developing' } }),
        implemented: await prisma.creativeArchive.count({ where: { status: 'implemented' } }),
        deferred: await prisma.creativeArchive.count({ where: { status: 'deferred' } }),
        deprecated: await prisma.creativeArchive.count({ where: { status: 'deprecated' } }),
      }
    }

    return NextResponse.json({ archives, stats })
  } catch (error) {
    console.error('获取归档列表失败:', error)
    return NextResponse.json({ error: '获取归档列表失败' }, { status: 500 })
  }
}

// POST /api/archive - Create a new archive entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      summary,
      categoryId,
      layer = 'application',
      status = 'draft',
      priority = 50,
      completion = 0,
      featureVector,
      tags,
      source,
      version = '1.0',
      authorId
    } = body

    if (!title || !content) {
      return NextResponse.json({ error: '标题和内容为必填项' }, { status: 400 })
    }

    const archive = await prisma.creativeArchive.create({
      data: {
        title,
        content,
        summary,
        categoryId,
        layer,
        status,
        priority,
        completion,
        featureVector: featureVector ? JSON.stringify(featureVector) : null,
        tags: tags ? JSON.stringify(tags) : null,
        source,
        version,
        authorId
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ archive }, { status: 201 })
  } catch (error) {
    console.error('创建归档失败:', error)
    return NextResponse.json({ error: '创建归档失败' }, { status: 500 })
  }
}
