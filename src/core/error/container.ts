/**
 * 错误封装器容器
 * 错误无法超出最小范围的文件源代码
 */

import { ErrorBoundary } from './boundary'
import { ErrorTrap } from './trap'
import { ErrorIsolator } from './isolator'

export class ErrorContainer {
  private static instance: ErrorContainer
  private boundary: ErrorBoundary
  private trap: ErrorTrap
  private isolator: ErrorIsolator

  private constructor() {
    this.boundary = new ErrorBoundary()
    this.trap = new ErrorTrap()
    this.isolator = new ErrorIsolator()
  }

  static getInstance(): ErrorContainer {
    if (!ErrorContainer.instance) {
      ErrorContainer.instance = new ErrorContainer()
    }
    return ErrorContainer.instance
  }

  /**
   * 封装函数，确保错误无法逃出
   */
  async wrap<T>(
    fn: () => Promise<T> | T,
    context: string,
    options: {
      fallback?: T
      retry?: number
      timeout?: number
    } = {}
  ): Promise<T | null> {
    return this.isolator.execute(async () => {
      return this.trap.capture(async () => {
        return this.boundary.guard(fn, context, options)
      })
    })
  }

  /**
   * 创建安全的执行环境
   */
  createSafeZone<T>(zoneId: string) {
    return this.isolator.createZone<T>(zoneId)
  }

  /**
   * 获取错误统计（仅限内部使用）
   */
  getStats() {
    return {
      boundaries: this.boundary.getStats(),
      traps: this.trap.getStats(),
      isolators: this.isolator.getStats()
    }
  }
}