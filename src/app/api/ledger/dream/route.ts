import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'pending'
    const dreamType = searchParams.get('dreamType') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    let whereClause: any = { ledgerType: 'dream' }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status !== 'all') {
      whereClause.status = status
    }

    const [dreamRecords, total] = await Promise.all([
      db.namedLedger.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              userType: true,
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

    // 解析特殊数据和过滤梦想类型
    const dreamRecordsWithDetails = dreamRecords
      .map(record => {
        let specialData = null
        let tags = []
        
        try {
          if (record.specialData) {
            specialData = JSON.parse(record.specialData)
          }
          if (record.tags) {
            tags = JSON.parse(record.tags)
          }
        } catch (error) {
          console.error('Error parsing dream record data:', error)
        }

        return {
          ...record,
          specialData,
          tags
        }
      })
      .filter(record => {
        if (dreamType === 'all') return true
        return record.specialData?.dreamType === dreamType
      })

    return NextResponse.json({
      dreamRecords: dreamRecordsWithDetails,
      pagination: {
        page,
        pageSize,
        total: dreamRecordsWithDetails.length,
        totalPages: Math.ceil(dreamRecordsWithDetails.length / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch dream records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dream records' },
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
      specialData,
      tags,
      privacy = 'private',
      projectId
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

    // 构建特殊数据
    let dreamData = {}
    if (specialData) {
      dreamData = {
        dreamType: specialData.dreamType || 'life', // 梦想类型：life, career, health, family, innovation, social
        dreamTitle: specialData.dreamTitle || '', // 梦想标题
        description: specialData.description || '', // 详细描述
        motivation: specialData.motivation || '', // 动机和原因
        targetDate: specialData.targetDate || '', // 目标实现时间
        requiredResources: specialData.requiredResources || [], // 所需资源
        currentProgress: specialData.currentProgress || 0, // 当前进度(0-100)
        actionSteps: specialData.actionSteps || [], // 行动步骤
        obstacles: specialData.obstacles || [], // 面临的障碍
        supportNeeded: specialData.supportNeeded || [], // 需要的支持
        expectedImpact: specialData.expectedImpact || '', // 预期影响
        priority: specialData.priority || 'medium', // 优先级：low, medium, high
        isShared: specialData.isShared || false, // 是否愿意分享
        collaboration: specialData.collaboration || false, // 是否需要合作
        ...specialData
      }
    }

    const dreamRecord = await db.namedLedger.create({
      data: {
        userId,
        ledgerType: 'dream',
        content,
        specialData: JSON.stringify(dreamData),
        tags: tags ? JSON.stringify(tags) : null,
        privacy,
        projectId,
        status: 'pending',
        value: calculateDreamValue(dreamData)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userType: true,
            avatar: true
          }
        }
      }
    })

    // 所有用户记录梦想都获得共同体账户奖励
    const balanceAmount = dreamRecord.value * 0.2 // 梦想记录获得20%庇佑
    
    await db.user.update({
      where: { id: userId },
      data: {
        communityBalance: {
          increment: balanceAmount
        }
      }
    })

    // 记录共同体账户变动
    await db.communityAccount.create({
      data: {
        userId,
        accountType: 'balance',
        amount: balanceAmount,
        reason: `梦境账本记录：${content.substring(0, 30)}...`,
        transactionType: 'credit'
      }
    })

    // 如果是健全人且有合作意愿，给予投资点数
    if (user.userType === 'able-bodied' && dreamData.collaboration) {
      const investmentPoints = dreamRecord.value * 0.1
      
      await db.user.update({
        where: { id: userId },
        data: {
          investmentPoints: {
            increment: investmentPoints
          }
        }
      })

      await db.communityAccount.create({
        data: {
          userId,
          accountType: 'investment',
          amount: investmentPoints,
          reason: `支持梦想实现：${dreamData.dreamTitle || content.substring(0, 20)}...`,
          transactionType: 'credit'
        }
      })
    }

    return NextResponse.json(dreamRecord, { status: 201 })
  } catch (error) {
    console.error('Failed to create dream record:', error)
    return NextResponse.json(
      { error: 'Failed to create dream record' },
      { status: 500 }
    )
  }
}

// 计算梦想记录的价值
function calculateDreamValue(dreamData: any): number {
  let baseValue = 15
  
  // 根据梦想类型调整
  if (dreamData.dreamType === 'innovation') baseValue += 25
  else if (dreamData.dreamType === 'social') baseValue += 20
  else if (dreamData.dreamType === 'career') baseValue += 15
  
  // 优先级调整
  if (dreamData.priority === 'high') baseValue += 15
  else if (dreamData.priority === 'medium') baseValue += 10
  
  // 详细规划额外价值
  if (dreamData.actionSteps && dreamData.actionSteps.length > 0) baseValue += 10
  if (dreamData.requiredResources && dreamData.requiredResources.length > 0) baseValue += 10
  if (dreamData.targetDate) baseValue += 5
  
  // 合作意愿额外价值
  if (dreamData.collaboration) baseValue += 15
  
  // 分享意愿额外价值
  if (dreamData.isShared) baseValue += 10
  
  return baseValue
}