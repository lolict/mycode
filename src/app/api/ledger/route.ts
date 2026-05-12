import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDigestiveSystem } from '@/core/v2/digestive'
import { persistError } from '@/core/v2/digestive/persist'
import { getDopamineEngine } from '@/core/v2/dopamine'
import { persistDopamine } from '@/core/v2/dopamine/persist'
import { getNervousSystem } from '@/core/v2/nervous'

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

    // Parse JSON fields for client consumption
    const parsed = ledgers.map((l: any) => ({
      ...l,
      specialData: l.specialData ? JSON.parse(l.specialData) : null,
      tags: l.tags ? JSON.parse(l.tags) : null,
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    const digestive = getDigestiveSystem()
    const digested = digestive.digest(error, { source: 'ledger-api', operation: 'fetch-ledgers' })
    persistError(digested).catch(() => {})
    return NextResponse.json(
      { error: digested.message, ...(digested.suggestion ? { suggestion: digested.suggestion } : {}) },
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
      'deposit', 'cooperation', 'art'
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
        status: 'pending',
        specialData: body.specialData ? JSON.stringify(body.specialData) : null,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        privacy: body.privacy || 'private',
      }
    })

    const dopamine = getDopamineEngine()
    const dopamineRecord = dopamine.release({
      type: 'volunteer',
      description: 'User created a ledger entry',
      userId: user.id,
      targetId: ledger.id,
      data: {},
      timestamp: Date.now(),
    })
    await persistDopamine(dopamineRecord)

    getNervousSystem().emit({
      channel: 'action:volunteer',
      from: 'ledger-api',
      payload: { type: 'volunteer', userId: user.id, targetId: ledger.id },
      priority: 5,
    })

    return NextResponse.json(ledger, { status: 201 })
  } catch (error) {
    const digestive = getDigestiveSystem()
    const digested = digestive.digest(error, { source: 'ledger-api', operation: 'create-ledger' })
    persistError(digested).catch(() => {})
    return NextResponse.json(
      { error: digested.message, ...(digested.suggestion ? { suggestion: digested.suggestion } : {}) },
      { status: 500 }
    )
  }
}