import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // 获取第一个用户的记名账本记录作为演示
    const user = await db.user.findFirst()
    if (!user) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      )
    }

    const ledgers = await db.namedLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(ledgers)
  } catch (error) {
    console.error('Failed to fetch ledgers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ledgers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ledgerType, content, value } = body

    // 验证必填字段
    if (!ledgerType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证账本类型
    const validTypes = [
      'technology', 'technique', 'public_tool', 'intelligence', 
      'energy', 'charity', 'donation', 'volunteer', 'time', 
      'deposit', 'cooperation'
    ]
    
    if (!validTypes.includes(ledgerType)) {
      return NextResponse.json(
        { error: 'Invalid ledger type' },
        { status: 400 }
      )
    }

    // 获取第一个用户作为演示
    const user = await db.user.findFirst()
    if (!user) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      )
    }

    const ledger = await db.namedLedger.create({
      data: {
        userId: user.id,
        ledgerType,
        content,
        value: parseFloat(value) || 0,
        status: 'pending'
      }
    })

    return NextResponse.json(ledger, { status: 201 })
  } catch (error) {
    console.error('Failed to create ledger:', error)
    return NextResponse.json(
      { error: 'Failed to create ledger' },
      { status: 500 }
    )
  }
}