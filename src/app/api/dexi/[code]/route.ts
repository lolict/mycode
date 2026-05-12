import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getModuleByCode } from '@/lib/dexi-registry'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // First check the registry
    const registryModule = getModuleByCode(code)
    if (registryModule) {
      return NextResponse.json({ source: 'registry', module: registryModule })
    }

    // Then check the database
    const dbModule = await db.dexiModule.findUnique({
      where: { code },
      include: { records: true },
    })

    if (!dbModule) {
      return NextResponse.json(
        { error: 'Dexi module not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ source: 'database', module: dbModule })
  } catch (error) {
    console.error('Failed to fetch dexi module:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dexi module' },
      { status: 500 }
    )
  }
}
