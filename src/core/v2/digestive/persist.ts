/**
 * 消化系统持久化层 — 排泄物存入数据库
 *
 * 内存中的错误记录就像肠道里的粪便，迟早要排出体外。
 * 这个模块负责把消化后的错误写入数据库，永久保存。
 *
 * 不再只是 console.error 打印一下就没了，
 * 而是真正有"肛门"——错误被分类、包装、排入数据库，不会倒流。
 */

import { db } from '@/lib/db'
import type { DigestedError } from './index'

/**
 * 将消化后的错误持久化到数据库
 * 就像排便——排出去的不会回来，但记录在案
 */
export async function persistError(error: DigestedError): Promise<void> {
  try {
    await db.errorLog.create({
      data: {
        id: error.id,
        grade: error.grade,
        message: error.message,
        raw: error.raw,
        source: error.source,
        handled: error.handled,
        suggestion: error.suggestion,
      },
    })

    // 标记为已处理
    error.handled = true
  } catch (persistError) {
    // 持久化本身失败时，不能让系统崩溃
    // 就像肛门堵了，不能让大便倒流回胃里
    if (process.env.NODE_ENV === 'development') {
      console.error('[消化系统] 排泄持久化失败:', persistError)
    }
  }
}

/**
 * 批量持久化错误
 */
export async function persistErrors(errors: DigestedError[]): Promise<void> {
  if (errors.length === 0) return

  try {
    await db.errorLog.createMany({
      data: errors.map(e => ({
        id: e.id,
        grade: e.grade,
        message: e.message,
        raw: e.raw,
        source: e.source,
        handled: e.handled,
        suggestion: e.suggestion,
      })),
    })

    for (const e of errors) {
      e.handled = true
    }
  } catch (persistError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[消化系统] 批量排泄持久化失败:', persistError)
    }
  }
}

/**
 * 查询错误日志
 */
export async function queryErrorLog(options?: {
  grade?: string
  source?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}
  if (options?.grade) where.grade = options.grade
  if (options?.source) where.source = { contains: options.source }

  return db.errorLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  })
}

/**
 * 标记错误已处理
 */
export async function markErrorHandled(errorId: string): Promise<void> {
  await db.errorLog.update({
    where: { id: errorId },
    data: { handled: true },
  })
}
