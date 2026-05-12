/**
 * withDigestive — API 路由的消化系统包装器
 *
 * 任何 API 路由用这个包装后，错误自动被消化系统处理：
 * - 错误不暴露给用户原始技术信息（大便不能从嘴里出来）
 * - 错误被分类、翻译成人话、持久化到数据库（肛门正常排便）
 * - 开发环境能看到原始错误（给医生看的X光片）
 *
 * 用法：
 * ```ts
 * export const POST = withDigestive(async (request, context) => {
 *   // 你的业务逻辑，正常写
 *   const result = await doSomething()
 *   return NextResponse.json(result)
 * }, { source: 'donate-api', operation: '捐款' })
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDigestiveSystem } from '../digestive'
import { persistError } from './persist'

interface DigestiveRouteContext {
  params: Promise<Record<string, string>>
}

interface WithDigestiveOptions {
  /** API来源标识 */
  source: string
  /** 操作描述（给人看的） */
  operation: string
  /** 默认错误状态码 */
  defaultErrorCode?: number
}

type DigestiveHandler = (
  request: NextRequest,
  context: DigestiveRouteContext
) => Promise<NextResponse>

/**
 * 包装 API 路由处理器，自动消化错误
 *
 * 就像给食物加上消化酶——吃进去的请求，如果有问题，自动消化排出，
 * 绝不让原始错误泄漏到上层。
 */
export function withDigestive(
  handler: DigestiveHandler,
  options: WithDigestiveOptions
): DigestiveHandler {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      const digestive = getDigestiveSystem()

      // 消化错误：分类 + 翻译 + 包装
      const digested = digestive.digest(error, {
        source: options.source,
        operation: options.operation,
        userId: undefined, // 从请求中提取
      })

      // 持久化到数据库——真正排便，不只是打印
      await persistError(digested)

      // 根据错误等级决定返回给用户的信息
      const statusCode = options.defaultErrorCode || 500
      const userMessage = digested.message
      const suggestion = digested.suggestion

      // 开发环境返回更多细节
      const responseBody: Record<string, any> = {
        error: userMessage,
        grade: digested.grade,
      }

      if (suggestion) {
        responseBody.suggestion = suggestion
      }

      if (process.env.NODE_ENV === 'development' && digested.raw) {
        responseBody.raw = digested.raw
        responseBody.source = digested.source
      }

      return NextResponse.json(responseBody, { status: statusCode })
    }
  }
}
