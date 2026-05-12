/**
 * 错误封装器容器
 * 错误无法超出最小范围的文件源代码
 */

import { ErrorIsolator } from './isolator'

export class ErrorContainer {
  private static instance: ErrorContainer
  private isolator: ErrorIsolator

  private constructor() {
    this.isolator = new ErrorIsolator()
  }

  static getInstance(): ErrorContainer {
    if (!ErrorContainer.instance) {
      ErrorContainer.instance = new ErrorContainer()
    }
    return ErrorContainer.instance
  }

  async wrap<T>(
    fn: () => Promise<T> | T,
    context: string,
    options: {
      fallback?: T
      retry?: number
      timeout?: number
    } = {}
  ): Promise<T | null> {
    return this.isolator.execute(fn)
  }

  getStats() {
    return {
      isolators: this.isolator.getStats()
    }
  }
}
