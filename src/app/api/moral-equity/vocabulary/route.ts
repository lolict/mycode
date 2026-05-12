import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_VOCABULARY, VOCAB_CATEGORIES, getVocabDisplay, validateVocabImportDoc, generateVocabExportDoc } from '@/lib/moral-vocabulary'

// GET /api/moral-equity/vocabulary — 获取词汇列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const scope = searchParams.get('scope')

    // 确保默认词汇已初始化
    await ensureVocabInitialized()

    const where: any = {}
    if (category) where.category = category
    if (scope) where.scope = scope

    const vocabularies = await db.moralVocabulary.findMany({
      where,
      orderBy: [{ category: 'asc' }, { vocabKey: 'asc' }],
    })

    // 为每条词汇附加当前显示值
    const result = vocabularies.map(v => ({
      ...v,
      displayValue: getVocabDisplay(v),
    }))

    // 统计
    const stats = {
      total: vocabularies.length,
      customized: vocabularies.filter(v => v.isCustomized).length,
      byCategory: VOCAB_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        count: vocabularies.filter(v => v.category === c.id).length,
        customized: vocabularies.filter(v => v.category === c.id && v.isCustomized).length,
      })),
    }

    return NextResponse.json({
      vocabularies: result,
      categories: VOCAB_CATEGORIES,
      stats,
    })
  } catch (error) {
    console.error('获取词汇列表失败:', error)
    return NextResponse.json({ error: '获取词汇列表失败' }, { status: 500 })
  }
}

// PUT /api/moral-equity/vocabulary — 更新词汇
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { vocabKey, customValue } = body

    if (!vocabKey) {
      return NextResponse.json({ error: '缺少vocabKey' }, { status: 400 })
    }

    const existing = await db.moralVocabulary.findUnique({ where: { vocabKey } })
    if (!existing) {
      return NextResponse.json({ error: '词汇不存在' }, { status: 404 })
    }

    // 如果customValue为空或与默认值相同，则重置为默认
    const isReset = !customValue || customValue.trim() === '' || customValue === existing.defaultValue
    const updated = await db.moralVocabulary.update({
      where: { vocabKey },
      data: {
        customValue: isReset ? null : customValue.trim(),
        isCustomized: !isReset,
      }
    })

    return NextResponse.json({
      vocabulary: {
        ...updated,
        displayValue: getVocabDisplay(updated),
      },
      reset: isReset,
    })
  } catch (error) {
    console.error('更新词汇失败:', error)
    return NextResponse.json({ error: '更新词汇失败' }, { status: 500 })
  }
}

// POST /api/moral-equity/vocabulary — 批量更新词汇
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { updates } = body as { updates: Array<{ vocabKey: string; customValue: string }> }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: '缺少updates数组' }, { status: 400 })
    }

    if (updates.length > 100) {
      return NextResponse.json({ error: '单次批量更新不能超过100条' }, { status: 400 })
    }

    const results = []
    for (const update of updates) {
      const existing = await db.moralVocabulary.findUnique({ where: { vocabKey: update.vocabKey } })
      if (!existing) continue

      const isReset = !update.customValue || update.customValue.trim() === '' || update.customValue === existing.defaultValue
      const updated = await db.moralVocabulary.update({
        where: { vocabKey: update.vocabKey },
        data: {
          customValue: isReset ? null : update.customValue.trim(),
          isCustomized: !isReset,
        }
      })

      results.push({
        vocabKey: updated.vocabKey,
        displayValue: getVocabDisplay(updated),
        isCustomized: updated.isCustomized,
      })
    }

    return NextResponse.json({ updated: results.length, results })
  } catch (error) {
    console.error('批量更新词汇失败:', error)
    return NextResponse.json({ error: '批量更新词汇失败' }, { status: 500 })
  }
}

// DELETE /api/moral-equity/vocabulary — 重置所有词汇为默认
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = { isCustomized: true }
    if (category) where.category = category

    const result = await db.moralVocabulary.updateMany({
      where,
      data: { customValue: null, isCustomized: false },
    })

    return NextResponse.json({
      reset: result.count,
      message: category ? `已重置${category}分类下的所有词汇` : '已重置所有自定义词汇',
    })
  } catch (error) {
    console.error('重置词汇失败:', error)
    return NextResponse.json({ error: '重置词汇失败' }, { status: 500 })
  }
}

// 确保默认词汇已初始化到数据库
async function ensureVocabInitialized() {
  const count = await db.moralVocabulary.count()
  if (count === 0) {
    for (const vocab of DEFAULT_VOCABULARY) {
      await db.moralVocabulary.create({
        data: {
          vocabKey: vocab.vocabKey,
          defaultValue: vocab.defaultValue,
          category: vocab.category,
          description: vocab.description,
          scope: vocab.scope,
          moduleCode: vocab.moduleCode || null,
          isCustomized: false,
        }
      })
    }
  }
}
