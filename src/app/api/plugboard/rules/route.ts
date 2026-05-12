import { NextResponse } from 'next/server'
import { COMPATIBLE_RULES } from '@/lib/plug-socket-registry'

// GET /api/plugboard/rules — 获取所有兼容规则
export async function GET() {
  try {
    return NextResponse.json({ rules: COMPATIBLE_RULES, total: COMPATIBLE_RULES.length })
  } catch (error) {
    console.error('Failed to fetch rules:', error)
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}
