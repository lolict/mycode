import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEXI_MODULES, DEXI_CATEGORIES, getDexiStats } from '@/lib/dexi-registry'

// GET /api/dexi/modules - 获取所有德系模块及统计
export async function GET() {
  try {
    // 从注册表获取模块定义
    const modules = DEXI_MODULES.map(m => ({
      code: m.code,
      name: m.name,
      fullName: m.fullName,
      category: m.category,
      categoryLabel: m.categoryLabel,
      description: m.description,
      icon: m.icon,
      color: m.color,
      features: m.features,
      status: m.status,
      priority: m.priority,
    }))

    const categories = DEXI_CATEGORIES
    const stats = getDexiStats()

    // 从数据库获取每个模块的记录数
    let recordCounts: Record<string, number> = {}
    try {
      const counts = await db.dexiRecord.groupBy({
        by: ['moduleCode'],
        _count: { id: true }
      })
      recordCounts = counts.reduce((acc, c) => {
        acc[c.moduleCode] = c._count.id
        return acc
      }, {} as Record<string, number>)
    } catch {
      // 数据库可能还没同步，忽略错误
    }

    return NextResponse.json({
      modules,
      categories,
      stats,
      recordCounts,
    })
  } catch (error) {
    console.error('获取德系模块失败:', error)
    return NextResponse.json({ error: '获取德系模块失败' }, { status: 500 })
  }
}

// POST /api/dexi/modules - 初始化模块到数据库
export async function POST() {
  try {
    let created = 0
    let skipped = 0

    for (const m of DEXI_MODULES) {
      const existing = await db.dexiModule.findUnique({ where: { code: m.code } })
      if (!existing) {
        await db.dexiModule.create({
          data: {
            code: m.code,
            name: m.name,
            fullName: m.fullName,
            category: m.category,
            description: m.description,
            icon: m.icon,
            color: m.color,
            features: JSON.stringify(m.features),
            status: m.status,
            priority: m.priority,
          }
        })
        created++
      } else {
        // 更新已有模块的信息
        await db.dexiModule.update({
          where: { code: m.code },
          data: {
            name: m.name,
            fullName: m.fullName,
            category: m.category,
            description: m.description,
            icon: m.icon,
            color: m.color,
            features: JSON.stringify(m.features),
            status: m.status,
            priority: m.priority,
          }
        })
        skipped++
      }
    }

    return NextResponse.json({
      message: '德系模块初始化完成',
      created,
      updated: skipped,
      total: DEXI_MODULES.length,
    })
  } catch (error) {
    console.error('初始化德系模块失败:', error)
    return NextResponse.json({ error: '初始化德系模块失败' }, { status: 500 })
  }
}
