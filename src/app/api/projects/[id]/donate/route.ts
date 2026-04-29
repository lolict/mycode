import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount, message, anonymous, donorId } = body

    // 验证必填字段
    if (!amount || !donorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // 检查项目是否存在
    const project = await db.project.findUnique({
      where: { id: params.id }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.status !== 'active') {
      return NextResponse.json(
        { error: 'Project is not active' },
        { status: 400 }
      )
    }

    // 检查项目是否已结束
    if (new Date() > new Date(project.endDate)) {
      return NextResponse.json(
        { error: 'Project has ended' },
        { status: 400 }
      )
    }

    // 创建捐款记录
    const donation = await db.donation.create({
      data: {
        amount: parseFloat(amount),
        message,
        anonymous: anonymous || false,
        projectId: params.id,
        donorId
      }
    })

    // 更新项目的当前金额
    await db.project.update({
      where: { id: params.id },
      data: {
        currentAmount: {
          increment: parseFloat(amount)
        }
      }
    })

    // 检查是否达到目标金额
    const updatedProject = await db.project.findUnique({
      where: { id: params.id }
    })

    if (updatedProject && updatedProject.currentAmount >= updatedProject.targetAmount) {
      await db.project.update({
        where: { id: params.id },
        data: { status: 'completed' }
      })
    }

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error('Failed to create donation:', error)
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}