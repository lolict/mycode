import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取用户道德账本
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // 获取道德账本
    let ledger = await db.moralLedger.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })

    // 如果没有账本，创建一个默认的
    if (!ledger) {
      ledger = await db.moralLedger.create({
        data: {
          userId,
          level: '初心者'
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      })
    }

    // 获取最近的道德记录
    const recentRecords = await db.moralRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    })

    // 获取八维价值贡献
    const valueContributions = await db.valueContribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // 计算各维度价值汇总
    const valueDimensions = [
      'moral', 'intelligence', 'labor', 'land',
      'energy', 'duty', 'innovation', 'copyright'
    ]

    const valueSummary: Record<string, number> = {}
    for (const dim of valueDimensions) {
      const contributions = valueContributions.filter(c => c.dimension === dim)
      valueSummary[dim] = contributions.reduce((sum, c) => sum + c.value, 0)
    }

    // 获取组织信息
    const orgMembership = await db.organizationMember.findFirst({
      where: { userId },
      include: {
        organizationUnit: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      ledger,
      recentRecords,
      valueContributions,
      valueSummary,
      orgMembership
    })
  } catch (error) {
    console.error('获取道德账本失败:', error)
    return NextResponse.json(
      { error: '获取道德账本失败' },
      { status: 500 }
    )
  }
}
