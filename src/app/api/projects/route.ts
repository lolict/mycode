import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withDigestive } from '@/core/v2/digestive/middleware'
import { getDopamineEngine } from '@/core/v2/dopamine'
import { persistDopamine } from '@/core/v2/dopamine/persist'
import { getNervousSystem } from '@/core/v2/nervous'

/**
 * 项目列表 API — 活体架构版
 *
 * GET: 获取项目列表（普通的读取，不需要消化系统）
 * POST: 创建项目（需要消化+多巴胺+神经）
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'active'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    let whereClause: any = { status }

    if (category) {
      whereClause.category = { name: category }
    }

    if (featured === 'true') {
      whereClause.OR = [
        {
          donorCount: {
            gt: 0,
          },
        },
        {
          endDate: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      ]
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          _count: {
            select: {
              donations: true,
            },
          },
        },
        orderBy: [
          { currentAmount: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit ? parseInt(limit) : pageSize,
        skip: (page - 1) * pageSize,
      }),
      db.project.count({ where: whereClause }),
    ])

    const projectsWithDonorCount = await Promise.all(
      projects.map(async (project) => {
        const donations = await db.donation.findMany({
          where: { projectId: project.id },
          select: { donorId: true },
        })
        const donorCount = new Set(donations.map((d) => d.donorId)).size
        return {
          ...project,
          donorCount,
        }
      })
    )

    return NextResponse.json({
      projects: projectsWithDonorCount,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST 创建项目 — 用消化系统包装
const createProjectHandler = withDigestive(
  async (request, _context) => {
    const body = await request.json()
    const {
      title,
      description,
      content,
      targetAmount,
      endDate,
      categoryId,
      images,
      location,
      organizer,
      contact,
      creatorId,
    } = body

    // 验证必填字段
    if (!title || !description || !content || !targetAmount || !endDate || !creatorId) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    const project = await db.project.create({
      data: {
        title,
        description,
        content,
        targetAmount: parseFloat(targetAmount),
        endDate: new Date(endDate),
        categoryId,
        images: images ? JSON.stringify(images) : null,
        location,
        organizer,
        contact,
        creatorId,
        status: 'pending',
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    // === 多巴胺分泌：创建项目也是善行！===
    const dopamine = getDopamineEngine()
    const dopamineRecord = dopamine.release({
      type: 'create_project',
      description: `发起了助残项目"${title}"`,
      userId: creatorId,
      targetId: project.id,
      data: {
        targetAmount: parseFloat(targetAmount),
        category: categoryId,
      },
      timestamp: Date.now(),
    })

    await persistDopamine(dopamineRecord)

    // === 神经信号广播 ===
    const nervous = getNervousSystem()
    nervous.emit({
      channel: 'action:create',
      from: 'projects-api',
      payload: {
        type: 'create_project',
        userId: creatorId,
        targetId: project.id,
        title,
        dopamineValue: dopamineRecord.dopamineValue,
      },
      priority: 6,
    })

    return NextResponse.json({
      ...project,
      dopamine: {
        value: dopamineRecord.dopamineValue,
        score: dopamineRecord.score,
      },
    }, { status: 201 })
  },
  {
    source: 'projects-api',
    operation: '创建项目',
  }
)

export async function POST(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  return createProjectHandler(request, context)
}
