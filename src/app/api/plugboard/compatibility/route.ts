import { NextRequest, NextResponse } from 'next/server'
import { plugBoardRegistry, checkCompatibility } from '@/lib/plugboard'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plugCode = searchParams.get('plugCode')
    const slotCode = searchParams.get('slotCode')

    if (!plugCode || !slotCode) {
      return NextResponse.json(
        { error: 'Missing required query parameters: plugCode, slotCode' },
        { status: 400 }
      )
    }

    // Try to get plug and slot from the registry
    const plug = plugBoardRegistry.getPlug(plugCode)
    const slot = plugBoardRegistry.getSlot(slotCode)

    if (!plug && !slot) {
      return NextResponse.json(
        { error: `Neither plug "${plugCode}" nor slot "${slotCode}" found in registry` },
        { status: 404 }
      )
    }

    if (!plug) {
      return NextResponse.json(
        { error: `Plug "${plugCode}" not found in registry` },
        { status: 404 }
      )
    }

    if (!slot) {
      return NextResponse.json(
        { error: `Slot "${slotCode}" not found in registry` },
        { status: 404 }
      )
    }

    // Check type compatibility
    const typeMismatch = slot.requiredType && plug.plugType !== slot.requiredType

    // Check interface compatibility
    const compatResult = checkCompatibility(plug.interfaceSpec, slot.interfaceSpec)

    return NextResponse.json({
      plugCode,
      slotCode,
      compatible: compatResult.compatible && !typeMismatch,
      typeMatch: !typeMismatch,
      interfaceCompatible: compatResult.compatible,
      errors: [
        ...(typeMismatch ? [`Plug type "${plug.plugType}" does not match required slot type "${slot.requiredType}"`] : []),
        ...compatResult.errors,
      ],
      warnings: compatResult.warnings,
    })
  } catch (error) {
    console.error('Failed to check compatibility:', error)
    return NextResponse.json(
      { error: 'Failed to check compatibility' },
      { status: 500 }
    )
  }
}
