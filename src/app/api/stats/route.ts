import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDigestiveSystem } from '@/core/v2/digestive'
import { persistError } from '@/core/v2/digestive/persist'

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
    const digestive = getDigestiveSystem()
    const digested = digestive.digest(error, { source: 'stats-api', operation: 'fetch-stats' })
    persistError(digested).catch(() => {})
    return NextResponse.json(
      { error: digested.message, ...(digested.suggestion ? { suggestion: digested.suggestion } : {}) },
      { status: 500 }
    )
  }
}