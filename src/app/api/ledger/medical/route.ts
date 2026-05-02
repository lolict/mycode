import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    let whereClause: any = { ledgerType: 'medical' }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status !== 'all') {
      whereClause.status = status
    }

    const [medicalRecords, total] = await Promise.all([
      db.namedLedger.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { status: 'asc' }
        ],
        take: pageSize,
        skip: (page - 1) * pageSize
      }),
      db.namedLedger.count({ where: whereClause })
    ])

    return NextResponse.json({
      medicalRecords,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch medical records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      content,
      value
    } = body

    // 验证必填字段
    if (!userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields', details: '用户ID和内容是必填的' },
        { status: 400 }
      )
    }

    // 验证用户是否存在
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const medicalRecord = await db.namedLedger.create({
      data: {
        userId,
        ledgerType: 'medical',
        content,
        value: value || 0,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(medicalRecord, { status: 201 })
  } catch (error) {
    console.error('Failed to create medical record:', error)
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    )
  }
}
