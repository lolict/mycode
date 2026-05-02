import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // 获取项目总数
    const totalProjects = await db.project.count({
      where: {
        status: {
          in: ['active', 'completed']
        }
      }
    })

    // 获取总筹集金额
    const projects = await db.project.findMany({
      where: {
        status: {
          in: ['active', 'completed']
        }
      },
      select: {
        currentAmount: true
      }
    })

    const totalAmount = projects.reduce((sum, project) => sum + project.currentAmount, 0)

    // 获取捐赠者总数（去重）
    const totalDonors = await db.donation.groupBy({
      by: ['donorId'],
      _count: true
    })

    // 计算成功率
    const completedProjects = await db.project.count({
      where: {
        status: 'completed'
      }
    })

    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0

    return NextResponse.json({
      totalProjects,
      totalAmount,
      totalDonors: totalDonors.length,
      successRate
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}