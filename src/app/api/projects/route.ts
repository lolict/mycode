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
            gte: db.project.fields.targetAmount * 0.5
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
        const donorCount = await db.donation.count({
          where: { projectId: project.id },
          distinct: ['donorId']
        })
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