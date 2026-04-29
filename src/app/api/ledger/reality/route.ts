import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'pending'
    const realityType = searchParams.get('realityType') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    let whereClause: any = { ledgerType: 'reality' }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status !== 'all') {
      whereClause.status = status
    }

    const [realityRecords, total] = await Promise.all([
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

    // 解析特殊数据和过滤实账本类型
    const realityRecordsWithDetails = realityRecords
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
          console.error('Error parsing reality record data:', error)
        }

        return {
          ...record,
          specialData,
          tags
        }
      })
      .filter(record => {
        if (realityType === 'all') return true
        return record.specialData?.realityType === realityType
      })

    return NextResponse.json({
      realityRecords: realityRecordsWithDetails,
      pagination: {
        page,
        pageSize,
        total: realityRecordsWithDetails.length,
        totalPages: Math.ceil(realityRecordsWithDetails.length / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch reality records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reality records' },
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
    let realityData = {}
    if (specialData) {
      realityData = {
        realityType: specialData.realityType || 'daily', // 实账本类型：daily, struggle, achievement, change, truth
        eventTitle: specialData.eventTitle || '', // 事件标题
        eventDate: specialData.eventDate || '', // 事件发生时间
        location: specialData.location || '', // 事件地点
        participants: specialData.participants || [], // 参与者
        detailedDescription: specialData.detailedDescription || '', // 详细描述
        emotionalImpact: specialData.emotionalImpact || '', // 情感影响
        lessonsLearned: specialData.lessonsLearned || '', // 学到的教训
        evidence: specialData.evidence || [], // 证据材料
        witnesses: specialData.witnesses || [], // 见证人
        consequences: specialData.consequences || [], // 后果影响
        resolution: specialData.resolution || '', // 解决方案
        currentStatus: specialData.currentStatus || '', // 当前状态
        futureOutlook: specialData.futureOutlook || '', // 未来展望
        authenticity: specialData.authenticity || 'verified', // 真实性：verified, reported, alleged
        impact: specialData.impact || 'personal', // 影响范围：personal, family, community, social
        ...specialData
      }
    }

    const realityRecord = await db.namedLedger.create({
      data: {
        userId,
        ledgerType: 'reality',
        content,
        specialData: JSON.stringify(realityData),
        tags: tags ? JSON.stringify(tags) : null,
        privacy,
        projectId,
        status: 'pending',
        value: calculateRealityValue(realityData)
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

    // 根据用户类型和实账本类型给予不同奖励
    if (user.userType === 'disabled') {
      // 残疾人用户获得更高庇佑
      const balanceAmount = realityRecord.value * 0.4 // 实账本记录获得40%庇佑
      
      await db.user.update({
        where: { id: userId },
        data: {
          communityBalance: {
            increment: balanceAmount
          }
        }
      })

      await db.communityAccount.create({
        data: {
          userId,
          accountType: 'balance',
          amount: balanceAmount,
          reason: `实账本记录：${content.substring(0, 30)}...`,
          transactionType: 'credit'
        }
      })
    } else {
      // 健全人用户获得投资点数
      const investmentPoints = realityRecord.value * 0.15
      
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
          reason: `记录真实经历：${realityData.eventTitle || content.substring(0, 20)}...`,
          transactionType: 'credit'
        }
      })
    }

    return NextResponse.json(realityRecord, { status: 201 })
  } catch (error) {
    console.error('Failed to create reality record:', error)
    return NextResponse.json(
      { error: 'Failed to create reality record' },
      { status: 500 }
    )
  }
}

// 计算实账本记录的价值
function calculateRealityValue(realityData: any): number {
  let baseValue = 12
  
  // 根据实账本类型调整
  if (realityData.realityType === 'struggle') baseValue += 20
  else if (realityData.realityType === 'achievement') baseValue += 18
  else if (realityData.realityType === 'change') baseValue += 15
  else if (realityData.realityType === 'truth') baseValue += 25
  
  // 影响范围调整
  if (realityData.impact === 'social') baseValue += 20
  else if (realityData.impact === 'community') baseValue += 15
  else if (realityData.impact === 'family') baseValue += 10
  
  // 详细记录额外价值
  if (realityData.detailedDescription && realityData.detailedDescription.length > 100) baseValue += 10
  if (realityData.lessonsLearned) baseValue += 8
  if (realityData.emotionalImpact) baseValue += 7
  
  // 证据和见证人额外价值
  if (realityData.evidence && realityData.evidence.length > 0) baseValue += 12
  if (realityData.witnesses && realityData.witnesses.length > 0) baseValue += 8
  
  // 真实性验证
  if (realityData.authenticity === 'verified') baseValue += 15
  else if (realityData.authenticity === 'reported') baseValue += 8
  
  return baseValue
}