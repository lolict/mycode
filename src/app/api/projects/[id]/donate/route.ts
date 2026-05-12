import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withDigestive } from '@/core/v2/digestive/middleware'
import { getDopamineEngine } from '@/core/v2/dopamine'
import { persistDopamine } from '@/core/v2/dopamine/persist'
import { getNervousSystem } from '@/core/v2/nervous'

/**
 * 捐款 API — 活体架构版
 *
 * 流程：
 * 1. 吃饭（接收请求）
 * 2. 消化（withDigestive 自动处理错误 = 肛门保障）
 * 3. 吸收营养（写入数据库）
 * 4. 多巴胺分泌（做善事了！五维评分 + 奖励记录）
 * 5. 神经信号广播（通知其他模块：有人捐款了！）
 */

const donateHandler = withDigestive(
  async (request, context) => {
    const { id } = await context.params
    const body = await request.json()
    const { amount, message, anonymous, donorId } = body

    // 验证必填字段
    if (!amount || !donorId) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: '金额必须大于0' },
        { status: 400 }
      )
    }

    // 检查项目是否存在
    const project = await db.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: '项目不存在', grade: 'noise', suggestion: '请检查项目链接是否正确' },
        { status: 404 }
      )
    }

    if (project.status !== 'active') {
      return NextResponse.json(
        { error: '项目当前不可捐款', suggestion: '该项目可能已结束或暂停' },
        { status: 400 }
      )
    }

    // 检查项目是否已结束
    if (new Date() > new Date(project.endDate)) {
      return NextResponse.json(
        { error: '项目已结束', suggestion: '该项目筹款已截止' },
        { status: 400 }
      )
    }

    // === 核心业务：创建捐款记录 ===
    const donation = await db.donation.create({
      data: {
        amount: parseFloat(amount),
        message,
        anonymous: anonymous || false,
        projectId: id,
        donorId,
      },
    })

    // 更新项目的当前金额
    await db.project.update({
      where: { id },
      data: {
        currentAmount: {
          increment: parseFloat(amount),
        },
      },
    })

    // 检查是否达到目标金额
    const updatedProject = await db.project.findUnique({
      where: { id },
    })

    if (updatedProject && updatedProject.currentAmount >= updatedProject.targetAmount) {
      await db.project.update({
        where: { id },
        data: { status: 'completed' },
      })
    }

    // === 多巴胺分泌：做善事了！===
    const dopamine = getDopamineEngine()
    const dopamineRecord = dopamine.release({
      type: 'donate',
      description: `向项目"${project.title}"捐款${amount}元`,
      userId: donorId,
      targetId: id,
      data: {
        amount: parseFloat(amount),
        anonymous: anonymous || false,
        urgency: project.status === 'active' ? 'normal' : 'critical',
      },
      timestamp: Date.now(),
    })

    // 持久化多巴胺记录到数据库
    await persistDopamine(dopamineRecord)

    // === 神经信号广播：告诉全世界有人捐款了！===
    const nervous = getNervousSystem()
    nervous.emit({
      channel: 'action:donate',
      from: 'donate-api',
      payload: {
        type: 'donate',
        userId: donorId,
        targetId: id,
        amount: parseFloat(amount),
        anonymous: anonymous || false,
        dopamineValue: dopamineRecord.dopamineValue,
      },
      priority: 8, // 捐款是高优先级信号
    })

    // 返回结果，包含多巴胺评分
    return NextResponse.json({
      ...donation,
      dopamine: {
        value: dopamineRecord.dopamineValue,
        score: dopamineRecord.score,
      },
    }, { status: 201 })
  },
  {
    source: 'donate-api',
    operation: '捐款',
  }
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return donateHandler(request, { params })
}
