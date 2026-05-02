import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 创建价值贡献记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, dimension, value, description, evidenceUrls } = body

    if (!userId || !dimension || !description) {
      return NextResponse.json(
        { error: '缺少必填字段：userId, dimension, description' },
        { status: 400 }
      )
    }

    const validDimensions = [
      'moral', 'intelligence', 'labor', 'land',
      'energy', 'duty', 'innovation', 'copyright'
    ]

    if (!validDimensions.includes(dimension)) {
      return NextResponse.json(
        { error: `无效的价值维度，有效维度：${validDimensions.join(', ')}` },
        { status: 400 }
      )
    }

    const contribution = await db.valueContribution.create({
      data: {
        userId,
        dimension,
        value: value || 0,
        description,
        evidenceUrls: evidenceUrls ? JSON.stringify(evidenceUrls) : null,
        isVerified: false
      }
    })

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    console.error('创建价值贡献失败:', error)
    return NextResponse.json(
      { error: '创建价值贡献失败' },
      { status: 500 }
    )
  }
}

// 获取价值贡献
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const dimension = searchParams.get('dimension')

    const where: any = {}
    if (userId) where.userId = userId
    if (dimension) where.dimension = dimension

    const contributions = await db.valueContribution.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ contributions })
  } catch (error) {
    console.error('获取价值贡献失败:', error)
    return NextResponse.json(
      { error: '获取价值贡献失败' },
      { status: 500 }
    )
  }
}
