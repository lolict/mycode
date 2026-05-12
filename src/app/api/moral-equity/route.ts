import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { VIRTUE_LABELS, FREQUENCY_LABELS, calculateEquityLevel, MORAL_TASKS } from '@/lib/moral-equity-tasks'

export async function GET() {
  try {
    // Get moral equity stats from the database
    const totalEquities = await db.moralEquity.count()
    const avgScores = await db.moralEquity.aggregate({
      _avg: {
        benevolenceScore: true,
        righteousnessScore: true,
        proprietyScore: true,
        wisdomScore: true,
        trustScore: true,
        totalScore: true,
      },
    })

    const levelDistribution = await db.moralEquity.groupBy({
      by: ['equityLevel'],
      _count: { equityLevel: true },
    })

    return NextResponse.json({
      virtueDefinitions: VIRTUE_LABELS,
      frequencyLabels: FREQUENCY_LABELS,
      totalTasks: MORAL_TASKS.length,
      stats: {
        totalEquities,
        averageScores: avgScores._avg,
        levelDistribution: levelDistribution.map((item) => ({
          level: item.equityLevel,
          count: item._count.equityLevel,
        })),
      },
    })
  } catch (error) {
    console.error('Failed to fetch moral equity summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moral equity summary' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      benevolenceScore,
      righteousnessScore,
      proprietyScore,
      wisdomScore,
      trustScore,
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
    }

    const bScore = benevolenceScore ?? 0
    const rScore = righteousnessScore ?? 0
    const pScore = proprietyScore ?? 0
    const wScore = wisdomScore ?? 0
    const tScore = trustScore ?? 0
    const totalScore = bScore + rScore + pScore + wScore + tScore
    const equityLevel = calculateEquityLevel(totalScore)

    // Upsert: create or update moral equity for the user
    const equity = await db.moralEquity.upsert({
      where: { userId },
      update: {
        benevolenceScore: bScore,
        righteousnessScore: rScore,
        proprietyScore: pScore,
        wisdomScore: wScore,
        trustScore: tScore,
        totalScore,
        equityLevel,
      },
      create: {
        userId,
        benevolenceScore: bScore,
        righteousnessScore: rScore,
        proprietyScore: pScore,
        wisdomScore: wScore,
        trustScore: tScore,
        totalScore,
        equityLevel,
      },
    })

    return NextResponse.json(equity)
  } catch (error) {
    console.error('Failed to create/update moral equity:', error)
    return NextResponse.json(
      { error: 'Failed to create/update moral equity' },
      { status: 500 }
    )
  }
}
