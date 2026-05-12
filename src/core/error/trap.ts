/**
 * 错误陷阱 - 捕获和转化错误
 */

interface ErrorTrapStats {
  totalCaptures: number
  transformedErrors: number
  errorTypes: Map<string, number>
}

export class ErrorTrap {
  private stats: ErrorTrapStats

  constructor() {
    this.stats = {
      totalCaptures: 0,
      transformedErrors: 0,
      errorTypes: new Map()
    }
  }

  /**
   * 捕获并转化错误
   */
  async capture<T>(fn: () => Promise<T> | T): Promise<T | null> {
    this.stats.totalCaptures++

    try {
      const result = await fn()
      return result
    } catch (error) {
      this.stats.transformedErrors++
      
      // 记录错误类型
      const errorType = error instanceof Error ? error.constructor.name : 'Unknown'
      this.stats.errorTypes.set(errorType, (this.stats.errorTypes.get(errorType) || 0) + 1)

      // 转化错误为安全格式
      const safeError = this.transformError(error)
      
      // 安全处理错误，不抛出
      this.handleSafeError(safeError)
      
      return null
    }
  }

  /**
   * 转化错误为安全格式
   */
  private transformError(error: unknown): SafeError {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        code: this.extractErrorCode(error),
        timestamp: new Date().toISOString(),
        safe: true
      }
    }

    return {
      name: 'UnknownError',
      message: String(error),
      code: 'UNKNOWN',
      timestamp: new Date().toISOString(),
      safe: true
    }
  }

  /**
   * 提取错误代码
   */
  private extractErrorCode(error: Error): string {
    // 尝试从错误中提取代码
    if ('code' in error && typeof error.code === 'string') {
      return error.code
    }
    
    // 根据错误名称推断代码
    const errorCodeMap: Record<string, string> = {
      'ValidationError': 'VALIDATION',
      'NetworkError': 'NETWORK',
      'TimeoutError': 'TIMEOUT',
      'DatabaseError': 'DATABASE',
      'AuthenticationError': 'AUTH',
      'AuthorizationError': 'PERMISSION'
    }

    return errorCodeMap[error.name] || 'UNKNOWN'
  }

  /**
   * 安全处理错误
   */
  private handleSafeError(error: SafeError): void {
    try {
      // 将错误发送到安全存储
      this.storeError(error)
      
      // 触发错误事件（安全方式）
      this.emitErrorEvent(error)
    } catch {
      // 如果错误处理失败，静默处理
    }
  }

  /**
   * 安全存储错误
   */
  private storeError(error: SafeError): void {
    try {
      // 在内存中存储最近的错误（限制数量）
      const maxErrors = 100
      const errors = this.getStoredErrors()
      
      errors.push(error)
      
      if (errors.length > maxErrors) {
        errors.splice(0, errors.length - maxErrors)
      }
      
      // 存储到全局安全位置
      if (typeof globalThis !== 'undefined') {
        (globalThis as any).__errorTrapStorage = errors
      }
    } catch {
      // 静默处理存储失败
    }
  }

  /**
   * 获取存储的错误
   */
  private getStoredErrors(): SafeError[] {
    try {
      if (typeof globalThis !== 'undefined') {
        return (globalThis as any).__errorTrapStorage || []
      }
    } catch {
      // 静默处理
    }
    return []
  }

  /**
   * 安全触发错误事件
   */
  private emitErrorEvent(error: SafeError): void {
    try {
      // 使用自定义事件系统
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const event = new CustomEvent('safeError', {
          detail: { error: error }
        })
        window.dispatchEvent(event)
      }
    } catch {
      // 静默处理事件触发失败
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): ErrorTrapStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalCaptures = 0
    this.stats.transformedErrors = 0
    this.stats.errorTypes.clear()
  }
}

interface SafeError {
  name: string
  message: string
  code: string
  timestamp: string
  safe: boolean
}