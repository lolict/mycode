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

    // 解析特殊数据
    const medicalRecordsWithDetails = medicalRecords.map(record => {
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
        console.error('Error parsing medical record data:', error)
      }

      return {
        ...record,
        specialData,
        tags
      }
    })

    return NextResponse.json({
      medicalRecords: medicalRecordsWithDetails,
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
    let medicalData = {}
    if (specialData) {
      medicalData = {
        diseaseType: specialData.diseaseType || '', // 疾病类型
        cause: specialData.cause || '', // 病情起因
        diagnosis: specialData.diagnosis || '', // 诊断结果
        treatment: specialData.treatment || '', // 治疗方案
        medication: specialData.medication || '', // 用药记录
        hospital: specialData.hospital || '', // 就医医院
        doctor: specialData.doctor || '', // 主治医生
        startDate: specialData.startDate || '', // 发病时间
        severity: specialData.severity || 'medium', // 严重程度：mild, medium, severe
        isChronic: specialData.isChronic || false, // 是否慢性病
        needsHelp: specialData.needsHelp || false, // 是否需要帮助
        helpType: specialData.helpType || '', // 需要的帮助类型
        ...specialData
      }
    }

    const medicalRecord = await db.namedLedger.create({
      data: {
        userId,
        ledgerType: 'medical',
        content,
        specialData: JSON.stringify(medicalData),
        tags: tags ? JSON.stringify(tags) : null,
        privacy,
        projectId,
        status: 'pending',
        value: calculateMedicalValue(medicalData)
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

    // 如果是残疾人用户，更新共同体账户
    if (user.userType === 'disabled') {
      const balanceAmount = medicalRecord.value * 0.3 // 病历记录获得30%庇佑
      
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
          reason: `病历账本记录：${content.substring(0, 30)}...`,
          transactionType: 'credit'
        }
      })
    }

    return NextResponse.json(medicalRecord, { status: 201 })
  } catch (error) {
    console.error('Failed to create medical record:', error)
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    )
  }
}

// 计算病历记录的价值
function calculateMedicalValue(medicalData: any): number {
  let baseValue = 10
  
  // 根据严重程度调整
  if (medicalData.severity === 'severe') baseValue += 20
  else if (medicalData.severity === 'medium') baseValue += 10
  
  // 慢性病额外价值
  if (medicalData.isChronic) baseValue += 15
  
  // 需要帮助额外价值
  if (medicalData.needsHelp) baseValue += 10
  
  // 详细记录额外价值
  if (medicalData.diagnosis && medicalData.treatment) baseValue += 10
  if (medicalData.medication) baseValue += 5
  
  return baseValue
}