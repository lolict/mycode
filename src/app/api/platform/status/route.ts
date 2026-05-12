import { NextResponse } from 'next/server'
import { initializePlatform, getPlatformStatus, isPlatformInitialized } from '@/lib/platform-runtime'

// GET: 获取平台运行时状态
export async function GET() {
  try {
    if (!isPlatformInitialized()) {
      const result = initializePlatform()
      return NextResponse.json({
        initialized: result.success,
        systems: result.systems,
        status: result.status,
      })
    }

    const status = getPlatformStatus()
    return NextResponse.json({
      initialized: true,
      status,
    })
  } catch (error) {
    console.error('Platform runtime error:', error)
    return NextResponse.json(
      { error: 'Failed to get platform status', details: String(error) },
      { status: 500 }
    )
  }
}

// POST: 手动初始化/重启平台
export async function POST() {
  try {
    const result = initializePlatform()
    return NextResponse.json({
      success: result.success,
      systems: result.systems,
      status: result.status,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initialize platform', details: String(error) },
      { status: 500 }
    )
  }
}
