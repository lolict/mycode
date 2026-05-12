import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { plugBoardRegistry } from '@/lib/plugboard'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plugCode, slotCode, config, createdBy } = body

    if (!plugCode || !slotCode) {
      return NextResponse.json(
        { error: 'Missing required fields: plugCode, slotCode' },
        { status: 400 }
      )
    }

    // Check compatibility first using the registry
    const result = plugBoardRegistry.connect(plugCode, slotCode)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Compatibility check failed',
          errors: result.errors,
          warnings: result.warnings,
        },
        { status: 400 }
      )
    }

    // Find the plug and slot in the database to get their IDs
    const plug = await db.plugModel.findUnique({ where: { code: plugCode } })
    const slot = await db.slotModel.findUnique({ where: { code: slotCode } })

    if (!plug) {
      return NextResponse.json(
        { error: `Plug model with code "${plugCode}" not found in database` },
        { status: 404 }
      )
    }

    if (!slot) {
      return NextResponse.json(
        { error: `Slot model with code "${slotCode}" not found in database` },
        { status: 404 }
      )
    }

    // Create the PlugConnection record
    const connection = await db.plugConnection.create({
      data: {
        plugId: plug.id,
        slotId: slot.id,
        config: config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null,
        status: 'connected',
        createdBy: createdBy ?? null,
      },
    })

    return NextResponse.json({
      connection,
      warnings: result.warnings,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to connect plug to slot:', error)
    return NextResponse.json(
      { error: 'Failed to connect plug to slot' },
      { status: 500 }
    )
  }
}
