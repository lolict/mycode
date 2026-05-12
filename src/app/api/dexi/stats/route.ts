import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDexiStats } from '@/lib/dexi-registry'

export async function GET() {
  try {
    const registryStats = getDexiStats()

    const [totalRecords, activeRecords, dbModuleCount] = await Promise.all([
      db.dexiRecord.count(),
      db.dexiRecord.count({ where: { status: 'active' } }),
      db.dexiModule.count(),
    ])

    // Records by category
    const recordsByCategory = await db.dexiRecord.groupBy({
      by: ['moduleCode'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Recent records
    const recentRecords = await db.dexiRecord.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        module: {
          select: { name: true, fullName: true, icon: true, color: true }
        }
      }
    })

    return NextResponse.json({
      registry: registryStats,
      database: {
        dbModuleCount,
        totalRecords,
        activeRecords,
      },
      recordsByCategory,
      recentRecords,
    })
  } catch (error) {
    console.error('Failed to fetch dexi stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
