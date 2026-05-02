import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 创建道德记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      recordType,
      kindnessScore = 0,
      compassionScore = 0,
      justiceScore = 0,
      dedicationScore = 0,
      severityScore = 0,
      description,
      evidenceUrls
    } = body

    // 验证必填字段
    if (!userId || !recordType || !description) {
      return NextResponse.json(
        { error: '缺少必填字段：userId, recordType, description' },
        { status: 400 }
      )
    }

    // 验证记录类型
    const validTypes = ['kindness', 'compassion', 'justice', 'dedication', 'severity']
    if (!validTypes.includes(recordType)) {
      return NextResponse.json(
        { error: `无效的记录类型，有效类型：${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // 验证用户存在
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 计算综合评分（加权）
    const compositeScore =
      kindnessScore * 0.30 +
      compassionScore * 0.25 +
      justiceScore * 0.20 +
      dedicationScore * 0.15 +
      severityScore * 0.10

    // 创建道德记录
    const record = await db.moralRecord.create({
      data: {
        userId,
        recordType,
        kindnessScore: Math.min(100, Math.max(0, kindnessScore)),
        compassionScore: Math.min(100, Math.max(0, compassionScore)),
        justiceScore: Math.min(100, Math.max(0, justiceScore)),
        dedicationScore: Math.min(100, Math.max(0, dedicationScore)),
        severityScore: Math.min(100, Math.max(0, severityScore)),
        compositeScore: Math.round(compositeScore * 100) / 100,
        description,
        evidenceUrls: evidenceUrls ? JSON.stringify(evidenceUrls) : null,
        verificationCount: 0,
        verificationRequired: 3,
        isVerified: false,
        verifiers: null
      }
    })

    // 更新道德账本
    await updateMoralLedger(userId)

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('创建道德记录失败:', error)
    return NextResponse.json(
      { error: '创建道德记录失败' },
      { status: 500 }
    )
  }
}

// 获取道德记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const recordType = searchParams.get('recordType')
    const verified = searchParams.get('verified')

    const where: any = {}
    if (userId) where.userId = userId
    if (recordType) where.recordType = recordType
    if (verified === 'true') where.isVerified = true
    if (verified === 'false') where.isVerified = false

    const records = await db.moralRecord.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('获取道德记录失败:', error)
    return NextResponse.json(
      { error: '获取道德记录失败' },
      { status: 500 }
    )
  }
}

// 验证道德记录（集体验证机制）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { recordId, verifierId } = body

    if (!recordId || !verifierId) {
      return NextResponse.json(
        { error: '缺少必填字段：recordId, verifierId' },
        { status: 400 }
      )
    }

    const record = await db.moralRecord.findUnique({
      where: { id: recordId }
    })

    if (!record) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      )
    }

    // 不能验证自己的记录
    if (record.userId === verifierId) {
      return NextResponse.json(
        { error: '不能验证自己的道德记录' },
        { status: 400 }
      )
    }

    // 检查是否已验证过
    const verifiers: string[] = record.verifiers ? JSON.parse(record.verifiers) : []
    if (verifiers.includes(verifierId)) {
      return NextResponse.json(
        { error: '您已经验证过此记录' },
        { status: 400 }
      )
    }

    // 添加验证者
    verifiers.push(verifierId)
    const newCount = record.verificationCount + 1
    const isVerified = newCount >= record.verificationRequired

    const updatedRecord = await db.moralRecord.update({
      where: { id: recordId },
      data: {
        verificationCount: newCount,
        isVerified,
        verifiers: JSON.stringify(verifiers)
      }
    })

    // 如果刚刚变为已验证，更新道德账本
    if (isVerified && !record.isVerified) {
      await updateMoralLedger(record.userId)
    }

    return NextResponse.json({
      record: updatedRecord,
      message: isVerified ? '记录已通过集体验证！' : `验证成功，还需 ${record.verificationRequired - newCount} 人验证`
    })
  } catch (error) {
    console.error('验证道德记录失败:', error)
    return NextResponse.json(
      { error: '验证道德记录失败' },
      { status: 500 }
    )
  }
}

// 更新用户道德账本
async function updateMoralLedger(userId: string) {
  // 获取所有已验证的道德记录
  const verifiedRecords = await db.moralRecord.findMany({
    where: {
      userId,
      isVerified: true
    }
  })

  // 计算五维平均分
  const count = verifiedRecords.length || 1
  const totalKindness = verifiedRecords.reduce((sum, r) => sum + r.kindnessScore, 0) / count
  const totalCompassion = verifiedRecords.reduce((sum, r) => sum + r.compassionScore, 0) / count
  const totalJustice = verifiedRecords.reduce((sum, r) => sum + r.justiceScore, 0) / count
  const totalDedication = verifiedRecords.reduce((sum, r) => sum + r.dedicationScore, 0) / count
  const totalSeverity = verifiedRecords.reduce((sum, r) => sum + r.severityScore, 0) / count

  // 加权综合分
  const compositeScore =
    totalKindness * 0.30 +
    totalCompassion * 0.25 +
    totalJustice * 0.20 +
    totalDedication * 0.15 +
    totalSeverity * 0.10

  // 确定等级
  let level = '初心者'
  if (compositeScore >= 90) level = '圆觉者'
  else if (compositeScore >= 75) level = '守护者'
  else if (compositeScore >= 60) level = '愿者'
  else if (compositeScore >= 40) level = '行者'

  // 计算总记录数
  const totalRecords = await db.moralRecord.count({
    where: { userId }
  })

  // Upsert 道德账本
  await db.moralLedger.upsert({
    where: { userId },
    update: {
      totalKindness: Math.round(totalKindness * 100) / 100,
      totalCompassion: Math.round(totalCompassion * 100) / 100,
      totalJustice: Math.round(totalJustice * 100) / 100,
      totalDedication: Math.round(totalDedication * 100) / 100,
      totalSeverity: Math.round(totalSeverity * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      level,
      verifiedRecordCount: verifiedRecords.length,
      totalRecordCount: totalRecords
    },
    create: {
      userId,
      totalKindness: Math.round(totalKindness * 100) / 100,
      totalCompassion: Math.round(totalCompassion * 100) / 100,
      totalJustice: Math.round(totalJustice * 100) / 100,
      totalDedication: Math.round(totalDedication * 100) / 100,
      totalSeverity: Math.round(totalSeverity * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      level,
      verifiedRecordCount: verifiedRecords.length,
      totalRecordCount: totalRecords
    }
  })
}
