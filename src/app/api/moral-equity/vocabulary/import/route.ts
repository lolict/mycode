import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateVocabImportDoc, DEFAULT_VOCABULARY } from '@/lib/moral-vocabulary'

// POST /api/moral-equity/vocabulary/import — 导入词汇资源
// 支持JSON文档导入
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { document, source = 'json', fileName } = body

    if (!document) {
      return NextResponse.json({ error: '缺少document参数' }, { status: 400 })
    }

    // 确保默认词汇已初始化
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

    // 解析并校验文档
    let parsedDoc: any
    if (typeof document === 'string') {
      try {
        parsedDoc = JSON.parse(document)
      } catch {
        return NextResponse.json({ error: 'JSON解析失败，请检查格式' }, { status: 400 })
      }
    } else {
      parsedDoc = document
    }

    const validation = validateVocabImportDoc(parsedDoc)
    if (!validation.valid || !validation.data) {
      return NextResponse.json({
        error: '文档校验失败',
        errors: validation.errors,
      }, { status: 400 })
    }

    const importDoc = validation.data

    // 创建导入日志
    const importLog = await db.vocabImportLog.create({
      data: {
        source,
        fileName: fileName || null,
        recordCount: importDoc.vocabularies.length,
        successCount: 0,
        failCount: 0,
        errors: null,
        importedBy: 'admin',
        status: 'processing',
      }
    })

    // 逐条导入
    let successCount = 0
    let failCount = 0
    const importErrors: string[] = []
    const existingKeys = new Set(
      (await db.moralVocabulary.findMany({ select: { vocabKey: true } })).map(v => v.vocabKey)
    )

    for (const item of importDoc.vocabularies) {
      try {
        if (existingKeys.has(item.vocabKey)) {
          // 更新已有词汇
          await db.moralVocabulary.update({
            where: { vocabKey: item.vocabKey },
            data: {
              customValue: item.customValue,
              isCustomized: true,
              ...(item.category ? { category: item.category } : {}),
              ...(item.description ? { description: item.description } : {}),
            }
          })
        } else {
          // 创建新词汇（允许导入文档中包含系统默认词库中没有的键）
          await db.moralVocabulary.create({
            data: {
              vocabKey: item.vocabKey,
              defaultValue: item.customValue,
              customValue: item.customValue,
              category: item.category || 'system_term',
              description: item.description || '通过导入文档添加',
              scope: 'global',
              isCustomized: true,
            }
          })
        }
        successCount++
      } catch (e: any) {
        failCount++
        importErrors.push(`${item.vocabKey}: ${e.message}`)
      }
    }

    // 更新导入日志
    await db.vocabImportLog.update({
      where: { id: importLog.id },
      data: {
        successCount,
        failCount,
        errors: importErrors.length > 0 ? JSON.stringify(importErrors) : null,
        status: failCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed'),
      }
    })

    return NextResponse.json({
      success: true,
      importLog: {
        id: importLog.id,
        source,
        fileName,
        total: importDoc.vocabularies.length,
        successCount,
        failCount,
        errors: importErrors,
      },
      document: {
        version: importDoc.version,
        description: importDoc.description,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('导入词汇失败:', error)
    return NextResponse.json({ error: '导入词汇失败' }, { status: 500 })
  }
}
