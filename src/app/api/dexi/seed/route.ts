import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEXI_MODULES } from '@/lib/dexi-registry'

export async function POST() {
  try {
    let created = 0
    let skipped = 0

    for (const mod of DEXI_MODULES) {
      const existing = await db.dexiModule.findUnique({
        where: { code: mod.code }
      })

      if (existing) {
        // Update existing module
        await db.dexiModule.update({
          where: { code: mod.code },
          data: {
            name: mod.name,
            fullName: mod.fullName,
            category: mod.category,
            description: mod.description,
            icon: mod.icon,
            color: mod.color,
            features: JSON.stringify(mod.features),
            status: mod.status,
            priority: mod.priority,
          }
        })
        skipped++
      } else {
        // Create new module
        await db.dexiModule.create({
          data: {
            code: mod.code,
            name: mod.name,
            fullName: mod.fullName,
            category: mod.category,
            description: mod.description,
            icon: mod.icon,
            color: mod.color,
            features: JSON.stringify(mod.features),
            status: mod.status,
            priority: mod.priority,
          }
        })
        created++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${DEXI_MODULES.length} modules: ${created} created, ${skipped} updated`,
      total: DEXI_MODULES.length,
      created,
      skipped,
    })
  } catch (error) {
    console.error('Failed to seed dexi modules:', error)
    return NextResponse.json({ error: 'Failed to seed modules' }, { status: 500 })
  }
}
