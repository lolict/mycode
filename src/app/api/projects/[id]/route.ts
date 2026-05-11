import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
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

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // 获取捐赠者数量
    const donations = await db.donation.findMany({
      where: { projectId: project.id },
      select: { donorId: true }
    })
    const donorCount = new Set(donations.map(d => d.donorId)).size

    const projectWithDonorCount = {
      ...project,
      donorCount
    }

    return NextResponse.json(projectWithDonorCount)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}