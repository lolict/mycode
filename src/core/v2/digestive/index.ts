/**
 * 消化排泄系统 - Digestive System
 *
 * 人体比喻：
 * - 请求进入 = 吃饭
 * - 中间件处理 = 消化
 * - 成功结果 → 多巴胺系统 = 吸收营养
 * - 错误 → 捕获/分类/记录 = 排便
 * - 错误绝不向上泄漏 = 大便不能从嘴里出来
 *
 * 核心原则：错误在最接近发生的地方处理掉，
 * 消化不了再往上一层走，但绝不暴露给用户原始错误信息。
 */

// ============================================
// 错误分类 — 不是所有错误都一样
// ============================================

export enum ErrorGrade {
  /** 可忽略的噪音（就像放屁） */
  NOISE = 'noise',
  /** 已知问题，有现成方案（就像正常排便） */
  KNOWN = 'known',
  /** 需要人工干预的严重问题（就像拉肚子，需要看医生） */
  CRITICAL = 'critical',
}

export interface DigestedError {
  /** 错误ID */
  id: string
  /** 错误等级 */
  grade: ErrorGrade
  /** 人类可读的描述（不暴露技术细节） */
  message: string
  /** 原始错误（仅开发环境可见） */
  raw?: string
  /** 发生位置 */
  source: string
  /** 时间 */
  timestamp: number
  /** 是否已处理 */
  handled: boolean
  /** 恢复建议 */
  suggestion?: string
}

// ============================================
// 消化管道 — 错误处理的中间件链
// ============================================

export type DigestiveMiddleware = (
  error: unknown,
  context: DigestContext,
  next: () => DigestedError
) => DigestedError

export interface DigestContext {
  /** 发生源 */
  source: string
  /** 操作描述 */
  operation: string
  /** 用户ID（如果有的话） */
  userId?: string
  /** 附加数据 */
  extra?: Record<string, any>
}

// ============================================
// 消化系统核心
// ============================================

class DigestiveSystem {
  private middlewares: DigestiveMiddleware[] = []
  private errorLog: DigestedError[] = []
  private maxLog = 500

  constructor() {
    // 默认中间件：错误分类
    this.use(this.classifyMiddleware)
    // 默认中间件：错误转换
    this.use(this.transformMiddleware)
  }

  /**
   * 添加消化酶（中间件）
   * 食物从上到下经过每一段肠道
   */
  use(middleware: DigestiveMiddleware): this {
    this.middlewares.push(middleware)
    return this
  }

  /**
   * 消化错误 — 把原始错误变成无害的排泄物
   *
   * 吃饭（请求）→ 消化（中间件链）→ 排便（DigestedError）
   * 错误绝不以原始形态泄漏到上层
   */
  digest(error: unknown, context: DigestContext): DigestedError {
    // 从最后一个中间件开始，向前传递
    let index = this.middlewares.length - 1

    const next = (): DigestedError => {
      if (index < 0) {
        // 所有中间件都执行完了，返回基本消化结果
        return this.createBaseError(error, context)
      }
      const middleware = this.middlewares[index--]
      return middleware(error, context, next)
    }

    const result = next()
    this.logError(result)
    return result
  }

  /**
   * 安全执行 — 像吞咽一样，自动消化错误
   * 用法：const result = await digestive.safeExec(() => riskyOperation(), context)
   */
  async safeExec<T>(
    operation: () => Promise<T>,
    context: DigestContext,
    fallback?: T
  ): Promise<T | DigestedError> {
    try {
      const result = await operation()
      return result
    } catch (error) {
      const digested = this.digest(error, context)
      if (fallback !== undefined) return fallback
      return digested
    }
  }

  /**
   * 同步版本的安全执行
   */
  safeExecSync<T>(
    operation: () => T,
    context: DigestContext,
    fallback?: T
  ): T | DigestedError {
    try {
      return operation()
    } catch (error) {
      const digested = this.digest(error, context)
      if (fallback !== undefined) return fallback
      return digested
    }
  }

  /**
   * 分类中间件 — 判断错误的严重程度
   */
  private classifyMiddleware: DigestiveMiddleware = (error, context, next) => {
    const result = next()

    // 根据错误类型自动分级
    if (error instanceof TypeError || error instanceof ReferenceError) {
      result.grade = ErrorGrade.CRITICAL
    } else if (error instanceof Error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
        result.grade = ErrorGrade.KNOWN
        result.suggestion = '请检查网络连接后重试'
      } else if (msg.includes('permission') || msg.includes('unauthorized')) {
        result.grade = ErrorGrade.KNOWN
        result.suggestion = '您可能没有权限执行此操作'
      } else if (msg.includes('not found') || msg.includes('404')) {
        result.grade = ErrorGrade.NOISE
        result.suggestion = '请求的资源不存在'
      }
    }

    return result
  }

  /**
   * 转换中间件 — 把技术错误翻译成人类可读的信息
   * 大便不能原样展示，要包装好再扔掉
   */
  private transformMiddleware: DigestiveMiddleware = (error, context, next) => {
    const result = next()

    // 生成用户友好的消息
    if (error instanceof Error) {
      result.raw = error.message
      result.message = this.humanizeErrorMessage(error.message, context.operation)
    } else {
      result.raw = String(error)
      result.message = `${context.operation}时发生了未知错误`
    }

    return result
  }

  /**
   * 把技术错误翻译成人话
   */
  private humanizeErrorMessage(rawMessage: string, operation: string): string {
    // 常见错误的翻译表
    const translations: Record<string, string> = {
      'fetch failed': '网络请求失败，请检查网络连接',
      'Network request failed': '网络连接失败，请稍后重试',
      'Failed to fetch': '无法连接服务器，请稍后重试',
      'timeout': '操作超时，请稍后重试',
      'Unauthorized': '登录已过期，请重新登录',
      'Forbidden': '您没有权限执行此操作',
      'Not Found': '请求的资源不存在',
      'Internal Server Error': '服务器遇到了问题，请稍后重试',
      'Prisma Client could not be found': '数据库连接异常，请联系管理员',
      'Unique constraint failed': '该记录已存在，请勿重复提交',
    }

    for (const [key, value] of Object.entries(translations)) {
      if (rawMessage.includes(key)) return value
    }

    return `${operation}失败，请稍后重试`
  }

  /**
   * 创建基础错误对象
   */
  private createBaseError(error: unknown, context: DigestContext): DigestedError {
    return {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      grade: ErrorGrade.KNOWN,
      message: `${context.operation}时发生了错误`,
      raw: error instanceof Error ? error.message : String(error),
      source: context.source,
      timestamp: Date.now(),
      handled: false,
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: DigestedError): void {
    this.errorLog.push(error)
    if (this.errorLog.length > this.maxLog) {
      this.errorLog.shift()
    }

    // 在开发环境打印详细错误
    if (process.env.NODE_ENV === 'development') {
      const prefix = error.grade === ErrorGrade.CRITICAL ? '🚨' :
                     error.grade === ErrorGrade.KNOWN ? '⚠️' : '💨'
      console.error(`${prefix} [${error.source}] ${error.message}`)
      if (error.raw) console.error(`   原始错误: ${error.raw}`)
    }
  }

  /**
   * 获取错误日志
   */
  getErrorLog(options?: { grade?: ErrorGrade; source?: string; limit?: number }): DigestedError[] {
    let log = [...this.errorLog]

    if (options?.grade) {
      log = log.filter(e => e.grade === options.grade)
    }
    if (options?.source) {
      log = log.filter(e => e.source === options.source)
    }

    return log.slice(-(options?.limit || 50))
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    const gradeCount = {
      [ErrorGrade.NOISE]: 0,
      [ErrorGrade.KNOWN]: 0,
      [ErrorGrade.CRITICAL]: 0,
    }

    for (const err of this.errorLog) {
      gradeCount[err.grade]++
    }

    return {
      totalErrors: this.errorLog.length,
      byGrade: gradeCount,
      unhandled: this.errorLog.filter(e => !e.handled).length,
      recentCritical: this.errorLog
        .filter(e => e.grade === ErrorGrade.CRITICAL)
        .slice(-5),
    }
  }

  /**
   * 清理日志
   */
  clearLog(): void {
    this.errorLog = []
  }
}

// ============================================
// 全局单例
// ============================================

let instance: DigestiveSystem | null = null

export function getDigestiveSystem(): DigestiveSystem {
  if (!instance) {
    instance = new DigestiveSystem()
  }
  return instance
}

export { DigestiveSystem }
