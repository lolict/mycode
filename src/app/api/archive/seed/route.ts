import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { SEED_CATEGORIES, SEED_ARCHIVES, SEED_RELATIONS } from '@/lib/seed-archive'

// POST /api/archive/seed - Seed the archive with all creative ideas
export async function POST() {
  try {
    // 清空现有数据
    await prisma.archiveRelation.deleteMany()
    await prisma.creativeArchive.deleteMany()
    await prisma.archiveCategory.deleteMany()

    // 创建分类
    const categoryMap: Record<string, string> = {}
    for (const cat of SEED_CATEGORIES) {
      const created = await prisma.archiveCategory.create({
        data: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          layer: cat.layer,
          sortOrder: cat.sortOrder
        }
      })
      categoryMap[cat.layer] = created.id
    }

    // 创建归档条目
    const archiveMap: Record<string, string> = {}
    for (const archive of SEED_ARCHIVES) {
      const created = await prisma.creativeArchive.create({
        data: {
          title: archive.title,
          content: archive.content,
          summary: archive.summary,
          layer: archive.layer,
          status: archive.status,
          priority: archive.priority,
          completion: archive.completion,
          featureVector: JSON.stringify(archive.featureVector),
          tags: JSON.stringify(archive.tags),
          source: archive.source,
          categoryId: categoryMap[archive.layer] || null
        }
      })
      archiveMap[archive.title] = created.id
    }

    // 创建关系
    const relationResults = []
    for (const rel of SEED_RELATIONS) {
      const fromId = archiveMap[rel.from]
      const toId = archiveMap[rel.to]
      if (!fromId || !toId) {
        console.warn(`跳过关系: ${rel.from} -> ${rel.to} (未找到归档ID)`)
        continue
      }
      try {
        const created = await prisma.archiveRelation.create({
          data: {
            fromId,
            toId,
            relationType: rel.relationType,
            distance: rel.distance,
            description: rel.description
          }
        })
        relationResults.push(created)
      } catch (err) {
        console.warn(`创建关系失败: ${rel.from} -> ${rel.to}`, err)
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        categories: SEED_CATEGORIES.length,
        archives: SEED_ARCHIVES.length,
        relations: relationResults.length
      }
    })
  } catch (error) {
    console.error('种子数据创建失败:', error)
    return NextResponse.json({ error: '种子数据创建失败' }, { status: 500 })
  }
}
