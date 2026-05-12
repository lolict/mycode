import { NextRequest, NextResponse } from 'next/server'
import { plugBoardRegistry, checkFullCompatibility } from '@/lib/plugboard'

// GET /api/plugboard/compatibility — 双层兼容性检查
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plugCode = searchParams.get('plugCode')
    const slotCode = searchParams.get('slotCode')

    // Also support type-level check
    const plugTypeCode = searchParams.get('plugTypeCode')
    const socketTypeCode = searchParams.get('socketTypeCode')

    // Type-level check
    if (plugTypeCode && socketTypeCode) {
      const result = checkFullCompatibility(plugTypeCode, socketTypeCode)
      return NextResponse.json({
        plugTypeCode,
        socketTypeCode,
        compatible: result.compatible,
        ruleCompatible: result.ruleCompatible,
        interfaceCompatible: result.interfaceCompatible,
        ruleInfo: result.ruleInfo,
        errors: result.errors,
        warnings: result.warnings,
      })
    }

    // Instance-level check
    if (!plugCode || !slotCode) {
      return NextResponse.json(
        { error: 'Provide either (plugCode + slotCode) or (plugTypeCode + socketTypeCode)' },
        { status: 400 }
      )
    }

    const plug = plugBoardRegistry.getPlug(plugCode)
    const slot = plugBoardRegistry.getSlot(slotCode)

    if (!plug) {
      return NextResponse.json({ error: `Plug "${plugCode}" not found in registry` }, { status: 404 })
    }
    if (!slot) {
      return NextResponse.json({ error: `Slot "${slotCode}" not found in registry` }, { status: 404 })
    }

    // Double-layer check: rule layer + interface layer
    const result = checkFullCompatibility(
      plug.plugType,
      slot.slotType,
      plug.interfaceSpec,
      slot.interfaceSpec,
    )

    const typeMismatch = slot.requiredType && plug.plugType !== slot.requiredType

    return NextResponse.json({
      plugCode,
      slotCode,
      compatible: result.compatible && !typeMismatch,
      typeMatch: !typeMismatch,
      interfaceCompatible: result.interfaceCompatible,
      ruleCompatible: result.ruleCompatible,
      ruleInfo: result.ruleInfo,
      errors: [
        ...(typeMismatch ? [`Plug type "${plug.plugType}" does not match required slot type "${slot.requiredType}"`] : []),
        ...result.errors,
      ],
      warnings: result.warnings,
    })
  } catch (error) {
    console.error('Failed to check compatibility:', error)
    return NextResponse.json({ error: 'Failed to check compatibility' }, { status: 500 })
  }
}
