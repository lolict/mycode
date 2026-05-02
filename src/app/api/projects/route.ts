import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
      // 推荐项目逻辑：当前金额达到目标50%以上或者即将结束的项目
      whereClause.OR = [
        {
          currentAmount: {
            gte: 0
          }
        },
        {
          endDate: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天内结束
          }
        }
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
              avatar: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true
            }
          },
          _count: {
            select: {
              donations: true
            }
          }
        },
        orderBy: [
          { currentAmount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit ? parseInt(limit) : pageSize,
        skip: (page - 1) * pageSize
      }),
      db.project.count({ where: whereClause })
    ])

    // 更新donorCount字段
    const projectsWithDonorCount = await Promise.all(
      projects.map(async (project) => {
        const donations = await db.donation.findMany({
          where: { projectId: project.id },
          select: { donorId: true }
        })
        const donorCount = new Set(donations.map(d => d.donorId)).size
        return {
          ...project,
          donorCount
        }
      })
    )

    return NextResponse.json({
      projects: projectsWithDonorCount,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      creatorId
    } = body

    // 验证必填字段
    if (!title || !description || !content || !targetAmount || !endDate || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ========== 道德账本门槛检查 ==========
    // 发起人必须满足以下条件才能创建众筹项目：
    // 1. 至少3条已验证道德记录
    // 2. 综合评分60分以上
    // 3. 达到"行者"等级以上
    const moralLedger = await db.moralLedger.findUnique({
      where: { userId: creatorId }
    })

    if (!moralLedger) {
      return NextResponse.json(
        { error: '您还没有道德账本，请先在道德账本中添加道德记录。需要至少3条已验证记录和60分以上综合评分才能发起项目。' },
        { status: 403 }
      )
    }

    if (moralLedger.verifiedRecordCount < 3) {
      return NextResponse.json(
        { error: `道德记录不足：您有 ${moralLedger.verifiedRecordCount} 条已验证记录，需要至少 3 条。请继续积累道德记录。` },
        { status: 403 }
      )
    }

    if (moralLedger.compositeScore < 60) {
      return NextResponse.json(
        { error: `综合评分不足：您的评分为 ${moralLedger.compositeScore.toFixed(1)} 分，需要达到 60 分以上才能发起项目。` },
        { status: 403 }
      )
    }

    const validLevels = ['行者', '愿者', '守护者', '圆觉者']
    if (!validLevels.includes(moralLedger.level)) {
      return NextResponse.json(
        { error: `等级不足：您当前为"${moralLedger.level}"，需要达到"行者"等级以上才能发起项目。` },
        { status: 403 }
      )
    }
    // ========== 道德账本门槛检查结束 ==========

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
        status: 'pending'
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}