import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, message, anonymous, donorId } = body

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

    const project = await db.project.findUnique({
      where: { id }
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

    if (new Date() > new Date(project.endDate)) {
      return NextResponse.json(
        { error: 'Project has ended' },
        { status: 400 }
      )
    }

    const donation = await db.donation.create({
      data: {
        amount: parseFloat(amount),
        message,
        anonymous: anonymous || false,
        projectId: id,
        donorId
      }
    })

    await db.project.update({
      where: { id },
      data: {
        currentAmount: {
          increment: parseFloat(amount)
        }
      }
    })

    const updatedProject = await db.project.findUnique({
      where: { id }
    })

    if (updatedProject && updatedProject.currentAmount >= updatedProject.targetAmount) {
      await db.project.update({
        where: { id },
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
