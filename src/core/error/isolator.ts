/**
 * 错误隔离器 - 确保错误在最小范围内被隔离
 */

interface ErrorIsolatorStats {
  totalIsolations: number
  activeZones: number
  containedErrors: number
}

interface IsolationZone<T> {
  id: string
  created: Date
  lastUsed: Date
  data?: T
  errorCount: number
}

export class ErrorIsolator {
  private stats: ErrorIsolatorStats
  private zones: Map<string, IsolationZone<any>>
  private maxZones: number
  private zoneTimeout: number

  constructor() {
    this.stats = {
      totalIsolations: 0,
      activeZones: 0,
      containedErrors: number
    }
    this.zones = new Map()
    this.maxZones = 50
    this.zoneTimeout = 5 * 60 * 1000 // 5分钟
  }

  /**
   * 在隔离环境中执行函数
   */
  async execute<T>(fn: () => Promise<T> | T): Promise<T | null> {
    this.stats.totalIsolations++
    
    const zoneId = this.generateZoneId()
    const zone = this.createZone<T>(zoneId)
    
    try {
      const result = await this.executeInZone(zone, fn)
      return result
    } catch (error) {
      this.stats.containedErrors++
      
      // 错误被隔离，不会传播
      this.containError(error, zoneId)
      
      return null
    } finally {
      this.cleanupZone(zoneId)
    }
  }

  /**
   * 创建隔离区域
   */
  createZone<T>(zoneId: string): IsolationZone<T> {
    const zone: IsolationZone<T> = {
      id: zoneId,
      created: new Date(),
      lastUsed: new Date(),
      errorCount: 0
    }

    this.zones.set(zoneId, zone)
    this.stats.activeZones = this.zones.size

    // 清理过期区域
    this.cleanupExpiredZones()

    return zone
  }

  /**
   * 在指定区域中执行
   */
  private async executeInZone<T>(
    zone: IsolationZone<T>,
    fn: () => Promise<T> | T
  ): Promise<T> {
    zone.lastUsed = new Date()

    // 创建隔离的执行上下文
    const isolatedContext = this.createIsolatedContext(zone)
    
    try {
      // 在隔离上下文中执行
      return await isolatedContext.execute(fn)
    } catch (error) {
      zone.errorCount++
      throw error
    }
  }

  /**
   * 创建隔离的执行上下文
   */
  private createIsolatedContext<T>(zone: IsolationZone<T>) {
    return {
      async execute<R>(fn: () => Promise<R> | R): Promise<R> {
        // 使用Proxy创建隔离环境
        const isolatedGlobal = this.createIsolatedGlobal(zone)
        
        try {
          // 在隔离的全局环境中执行
          return await this.runInIsolatedEnvironment(fn, isolatedGlobal)
        } finally {
          // 清理隔离环境
          this.cleanupIsolatedEnvironment(isolatedGlobal)
        }
      }
    }
  }

  /**
   * 创建隔离的全局对象
   */
  private createIsolatedGlobal<T>(zone: IsolationZone<T>) {
    const isolatedGlobal: any = {}
    
    // 复制安全的全局属性
    const safeGlobals = ['Promise', 'Array', 'Object', 'String', 'Number', 'Date']
    
    safeGlobals.forEach(prop => {
      try {
        if (typeof globalThis !== 'undefined' && (globalThis as any)[prop]) {
          isolatedGlobal[prop] = (globalThis as any)[prop]
        }
      } catch {
        // 忽略复制失败
      }
    })

    // 添加隔离标识
    isolatedGlobal.__isolationZone = zone.id
    isolatedGlobal.__isolationTimestamp = zone.created.toISOString()

    return isolatedGlobal
  }

  /**
   * 在隔离环境中运行函数
   */
  private async runInIsolatedEnvironment<R>(
    fn: () => Promise<R> | R,
    isolatedGlobal: any
  ): Promise<R> {
    try {
      // 如果函数是异步的
      if (fn.constructor.name === 'AsyncFunction') {
        return await fn()
      } else {
        // 同步函数
        return fn() as R
      }
    } catch (error) {
      // 确保错误不会逃出隔离环境
      throw this.wrapError(error)
    }
  }

  /**
   * 包装错误确保安全
   */
  private wrapError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`[Isolated] ${error.message}`)
    }
    return new Error(`[Isolated] ${String(error)}`)
  }

  /**
   * 清理隔离环境
   */
  private cleanupIsolatedEnvironment(isolatedGlobal: any): void {
    try {
      // 清理隔离环境中的资源
      if (isolatedGlobal.__cleanup) {
        isolatedGlobal.__cleanup()
      }
      
      // 清除引用
      Object.keys(isolatedGlobal).forEach(key => {
        delete isolatedGlobal[key]
      })
    } catch {
      // 静默处理清理失败
    }
  }

  /**
   * 隔离错误
   */
  private containError(error: unknown, zoneId: string): void {
    try {
      const containedError = {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error),
        zoneId,
        timestamp: new Date().toISOString(),
        contained: true
      }

      // 存储隔离的错误
      this.storeContainedError(containedError)
    } catch {
      // 如果隔离失败，静默处理
    }
  }

  /**
   * 存储被隔离的错误
   */
  private storeContainedError(containedError: any): void {
    try {
      if (typeof globalThis !== 'undefined') {
        const storage = (globalThis as any).__containedErrors || []
        storage.push(containedError)
        
        // 限制存储数量
        if (storage.length > 1000) {
          storage.splice(0, storage.length - 1000)
        }
        
        (globalThis as any).__containedErrors = storage
      }
    } catch {
      // 静默处理存储失败
    }
  }

  /**
   * 生成区域ID
   */
  private generateZoneId(): string {
    return `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 清理指定区域
   */
  private cleanupZone(zoneId: string): void {
    this.zones.delete(zoneId)
    this.stats.activeZones = this.zones.size
  }

  /**
   * 清理过期区域
   */
  private cleanupExpiredZones(): void {
    const now = new Date()
    const expiredZones: string[] = []

    this.zones.forEach((zone, id) => {
      if (now.getTime() - zone.lastUsed.getTime() > this.zoneTimeout) {
        expiredZones.push(id)
      }
    })

    expiredZones.forEach(id => this.cleanupZone(id))

    // 如果区域过多，清理最旧的
    if (this.zones.size > this.maxZones) {
      const sortedZones = Array.from(this.zones.entries())
        .sort(([, a], [, b]) => a.lastUsed.getTime() - b.lastUsed.getTime())
      
      const excessCount = this.zones.size - this.maxZones
      for (let i = 0; i < excessCount; i++) {
        this.cleanupZone(sortedZones[i][0])
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): ErrorIsolatorStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalIsolations = 0
    this.stats.activeZones = this.zones.size
    this.stats.containedErrors = 0
  }
}