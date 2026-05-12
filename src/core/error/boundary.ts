/**
 * 错误边界 - 防止错误传播的第一道防线
 */

interface ErrorBoundaryStats {
  totalGuards: number
  preventedEscapes: number
  contexts: Map<string, number>
}

export class ErrorBoundary {
  private stats: ErrorBoundaryStats

  constructor() {
    this.stats = {
      totalGuards: 0,
      preventedEscapes: 0,
      contexts: new Map()
    }
  }

  /**
   * 守护函数执行，防止错误逃出
   */
  async guard<T>(
    fn: () => Promise<T> | T,
    context: string,
    options: {
      fallback?: T
      retry?: number
      timeout?: number
    } = {}
  ): Promise<T | null> {
    this.stats.totalGuards++
    this.stats.contexts.set(context, (this.stats.contexts.get(context) || 0) + 1)

    const maxRetries = options.retry || 0
    const timeout = options.timeout || 5000
    const fallback = options.fallback

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 使用超时控制
        const result = await this.withTimeout(fn(), timeout)
        return result
      } catch (error) {
        this.stats.preventedEscapes++
        
        // 记录错误但不让它逃出
        this.logError(error, context, attempt)
        
        if (attempt === maxRetries) {
          // 最后一次尝试失败，返回fallback或null
          return fallback !== undefined ? fallback : null
        }
        
        // 等待后重试
        await this.delay(Math.pow(2, attempt) * 100)
      }
    }

    return fallback !== undefined ? fallback : null
  }

  /**
   * 超时控制
   */
  private async withTimeout<T>(promise: Promise<T> | T, timeout: number): Promise<T> {
    if (promise instanceof Promise) {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        })
      ])
    }
    return promise
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 安全的错误日志（不会抛出错误）
   */
  private logError(error: unknown, context: string, attempt: number): void {
    try {
      const errorInfo = {
        message: error instanceof Error ? error.message : String(error),
        context,
        attempt,
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      }
      
      // 使用安全的日志方式，避免日志本身出错
      console.error('[ErrorBoundary]', JSON.stringify(errorInfo))
    } catch {
      // 如果日志也出错，则静默处理
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): ErrorBoundaryStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalGuards = 0
    this.stats.preventedEscapes = 0
    this.stats.contexts.clear()
  }
}