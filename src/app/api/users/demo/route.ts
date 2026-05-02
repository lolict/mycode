import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // 获取第一个用户作为演示，如果没有则创建
    let user = await db.user.findFirst()

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'demo@yuanju.org',
          name: '演示用户',
          phone: '13800138000'
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}