import { NextRequest, NextResponse } from 'next/server'
import { getIdentityManager } from '@/core/v2/identity'

/**
 * 设备身份 API — 本地优先身份系统
 *
 * GET  /api/identity — 获取当前身份和摘要
 * POST /api/identity — 更新身份信息
 * POST /api/identity?action=init — 初始化身份
 */

export async function GET() {
  try {
    const manager = getIdentityManager()
    const identity = await manager.getIdentity()
    const summary = await manager.getIdentitySummary()

    return NextResponse.json({
      identity: {
        deviceId: identity.deviceId,
        name: identity.name,
        avatar: identity.avatar,
        userType: identity.userType,
        bio: identity.bio,
        location: identity.location,
        isVerified: identity.isVerified,
        createdAt: identity.createdAt,
      },
      summary,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: '获取身份失败', detail: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  const manager = getIdentityManager()

  // 初始化身份
  if (action === 'init') {
    try {
      const identity = await manager.init()
      return NextResponse.json({
        success: true,
        identity: {
          deviceId: identity.deviceId,
          name: identity.name,
          userType: identity.userType,
          isVerified: identity.isVerified,
        },
      })
    } catch (error: any) {
      return NextResponse.json(
        { error: '身份初始化失败', detail: error.message },
        { status: 500 }
      )
    }
  }

  // 更新身份信息
  try {
    const body = await request.json()
    const { name, avatar, userType, bio, location } = body

    const updated = await manager.updateProfile({
      name,
      avatar,
      userType,
      bio,
      location,
    })

    return NextResponse.json({
      success: true,
      identity: {
        deviceId: updated.deviceId,
        name: updated.name,
        avatar: updated.avatar,
        userType: updated.userType,
        bio: updated.bio,
        location: updated.location,
        isVerified: updated.isVerified,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: '更新身份失败', detail: error.message },
      { status: 500 }
    )
  }
}
