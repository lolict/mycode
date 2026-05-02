/**
 * 奖励边界 - 强化正确行为的第一道防线
 */

interface RewardBoundaryStats {
  totalEnhancements: number
  successfulRewards: number
  contexts: Map<string, number>
}

interface RewardZone {
  id: string
  rules: RewardRule[]
  created: Date
  rewardCount: number
}

export class RewardBoundary {
  private stats: RewardBoundaryStats
  private zones: Map<string, RewardZone>

  constructor() {
    this.stats = {
      totalEnhancements: 0,
      successfulRewards: 0,
      contexts: new Map()
    }
    this.zones = new Map()
  }

  /**
   * 增强函数执行，添加奖励机制
   */
  async enhance<T>(
    fn: () => Promise<T> | T,
    context: string,
    zoneId?: string
  ): Promise<T | null> {
    this.stats.totalEnhancements++
    this.stats.contexts.set(context, (this.stats.contexts.get(context) || 0) + 1)

    try {
      const startTime = Date.now()
      const result = await fn()
      const executionTime = Date.now() - startTime

      // 检查是否值得奖励
      if (this.shouldReward(result, context, executionTime)) {
        this.stats.successfulRewards++
        
        // 触发奖励事件
        this.triggerRewardEvent({
          context,
          result,
          executionTime,
          zoneId,
          timestamp: new Date()
        })
      }

      return result
    } catch (error) {
      // 即使出错也尝试提供学习奖励
      this.triggerLearningReward({
        context,
        error: error instanceof Error ? error.message : String(error),
        zoneId,
        timestamp: new Date()
      })
      
      throw error
    }
  }

  /**
   * 判断是否应该奖励
   */
  private shouldReward<T>(
    result: T,
    context: string,
    executionTime: number
  ): boolean {
    // 基本奖励条件
    if (result === null || result === undefined) {
      return false
    }

    // 性能奖励
    if (executionTime < 100) { // 快速执行
      return true
    }

    // 质量奖励
    if (this.isHighQualityResult(result)) {
      return true
    }

    // 上下文奖励
    if (this.isRewardableContext(context)) {
      return true
    }

    return false
  }

  /**
   * 检查结果质量
   */
  private isHighQualityResult<T>(result: T): boolean {
    // 检查结果的大小和复杂度
    if (typeof result === 'object' && result !== null) {
      const size = JSON.stringify(result).length
      return size > 100 && size < 10000 // 适中大小
    }

    if (typeof result === 'string') {
      return result.length > 10 && result.length < 1000
    }

    if (Array.isArray(result)) {
      return result.length > 0 && result.length < 100
    }

    return true
  }

  /**
   * 检查上下文是否值得奖励
   */
  private isRewardableContext(context: string): boolean {
    const rewardableContexts = [
      'api_call',
      'database_query',
      'user_interaction',
      'data_processing',
      'calculation',
      'validation'
    ]

    return rewardableContexts.some(rc => context.includes(rc))
  }

  /**
   * 触发奖励事件
   */
  private triggerRewardEvent(event: RewardEvent): void {
    try {
      // 使用安全的事件系统
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const customEvent = new CustomEvent('reward', {
          detail: { event }
        })
        window.dispatchEvent(customEvent)
      }

      // 存储奖励记录
      this.storeRewardRecord(event)
    } catch {
      // 静默处理事件失败
    }
  }

  /**
   * 触发学习奖励（从错误中学习）
   */
  private triggerLearningReward(event: LearningRewardEvent): void {
    try {
      // 学习奖励权重较低
      const learningEvent = {
        ...event,
        type: 'learning',
        weight: 0.3
      }

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const customEvent = new CustomEvent('learningReward', {
          detail: { event: learningEvent }
        })
        window.dispatchEvent(customEvent)
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 存储奖励记录
   */
  private storeRewardRecord(event: RewardEvent): void {
    try {
      if (typeof globalThis !== 'undefined') {
        const records = (globalThis as any).__rewardRecords || []
        records.push(event)
        
        // 限制记录数量
        if (records.length > 1000) {
          records.splice(0, records.length - 1000)
        }
        
        (globalThis as any).__rewardRecords = records
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 创建奖励区域
   */
  createZone(zoneId: string, rules: RewardRule[]): RewardZone {
    const zone: RewardZone = {
      id: zoneId,
      rules,
      created: new Date(),
      rewardCount: 0
    }

    this.zones.set(zoneId, zone)
    return zone
  }

  /**
   * 获取区域奖励规则
   */
  getZoneRules(zoneId: string): RewardRule[] {
    const zone = this.zones.get(zoneId)
    return zone ? zone.rules : []
  }

  /**
   * 获取统计信息
   */
  getStats(): RewardBoundaryStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalEnhancements = 0
    this.stats.successfulRewards = 0
    this.stats.contexts.clear()
  }
}

interface RewardEvent {
  context: string
  result: any
  executionTime: number
  zoneId?: string
  timestamp: Date
}

interface LearningRewardEvent {
  context: string
  error: string
  zoneId?: string
  timestamp: Date
}

interface RewardRule {
  condition: (result: any) => boolean
  multiplier: number
  type: 'success' | 'performance' | 'quality'
}