/**
 * 助残众筹平台核心系统集成
 * 将错误封装器、奖励器和突触系统集成到现有平台中
 */

import { ErrorContainer } from '../error/container'

export class PlatformCoreIntegration {
  private errorContainer: ErrorContainer

  constructor() {
    this.errorContainer = ErrorContainer.getInstance()
  }

  async wrapSafely<T>(fn: () => Promise<T> | T, context: string): Promise<T | null> {
    return this.errorContainer.wrap(fn, context)
  }

  getStats() {
    return {
      error: this.errorContainer.getStats(),
      timestamp: new Date()
    }
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const test = await this.errorContainer.wrap(() => 'healthy', 'health_check')
      return {
        status: test === 'healthy' ? 'healthy' : 'degraded',
        details: { errorContainer: test === 'healthy', timestamp: new Date() }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : String(error), timestamp: new Date() }
      }
    }
  }
}

export default PlatformCoreIntegration
