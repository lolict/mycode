/**
 * 错误隔离器 - 确保错误在最小范围内被隔离
 */

interface ErrorIsolatorStats {
  totalIsolations: number
  activeZones: number
  containedErrors: number
}

export class ErrorIsolator {
  private stats: ErrorIsolatorStats
  private maxZones: number
  private zoneTimeout: number

  constructor() {
    this.stats = {
      totalIsolations: 0,
      activeZones: 0,
      containedErrors: 0
    }
    this.maxZones = 50
    this.zoneTimeout = 5 * 60 * 1000
  }

  async execute<T>(fn: () => Promise<T> | T): Promise<T | null> {
    this.stats.totalIsolations++
    this.stats.activeZones++
    
    try {
      const result = await fn()
      return result
    } catch (error) {
      this.stats.containedErrors++
      return null
    } finally {
      this.stats.activeZones = Math.max(0, this.stats.activeZones - 1)
    }
  }

  getStats(): ErrorIsolatorStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats.totalIsolations = 0
    this.stats.activeZones = 0
    this.stats.containedErrors = 0
  }
}
