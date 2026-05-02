/**
 * 奖励放大器 - 计算和放大奖励值
 */

interface RewardAmplifierStats {
  totalCalculations: number
  totalAmplified: number
  averageMultiplier: number
}

interface RewardCalculation {
  baseValue: number
  multiplier: number
  finalValue: number
  factors: string[]
}

export class RewardAmplifier {
  private stats: RewardAmplifierStats
  private baseRewards: Map<string, number>
  private multipliers: Map<string, number>

  constructor() {
    this.stats = {
      totalCalculations: 0,
      totalAmplified: 0,
      averageMultiplier: 1.0
    }
    this.baseRewards = new Map()
    this.multipliers = new Map()
    this.initializeBaseRewards()
    this.initializeMultipliers()
  }

  /**
   * 计算奖励值
   */
  calculate<T>(
    result: T,
    context: string,
    options: {
      multiplier?: number
      share?: boolean
      persist?: boolean
    } = {}
  ): RewardCalculation {
    this.stats.totalCalculations++

    const baseValue = this.getBaseReward(result, context)
    const multiplier = this.calculateMultiplier(result, context, options)
    const finalValue = Math.round(baseValue * multiplier)
    const factors = this.getRewardFactors(result, context)

    if (multiplier > 1.0) {
      this.stats.totalAmplified++
    }

    // 更新平均倍数
    this.updateAverageMultiplier(multiplier)

    return {
      baseValue,
      multiplier,
      finalValue,
      factors
    }
  }

  /**
   * 获取基础奖励值
   */
  private getBaseReward<T>(result: T, context: string): number {
    // 基于上下文的基础奖励
    const contextReward = this.baseRewards.get(context) || 10

    // 基于结果类型的额外奖励
    let typeReward = 0
    
    if (typeof result === 'object' && result !== null) {
      typeReward = 20 // 对象结果奖励更高
    } else if (Array.isArray(result)) {
      typeReward = 15 // 数组结果
    } else if (typeof result === 'string') {
      typeReward = Math.min(result.length / 10, 30) // 基于字符串长度
    } else if (typeof result === 'number') {
      typeReward = Math.abs(result) / 10 // 基于数值
    }

    return Math.round(contextReward + typeReward)
  }

  /**
   * 计算奖励倍数
   */
  private calculateMultiplier<T>(
    result: T,
    context: string,
    options: {
      multiplier?: number
      share?: boolean
      persist?: boolean
    }
  ): number {
    let multiplier = 1.0

    // 基础倍数
    multiplier *= this.multipliers.get(context) || 1.0

    // 性能倍数
    multiplier *= this.getPerformanceMultiplier(result)

    // 质量倍数
    multiplier *= this.getQualityMultiplier(result)

    // 复杂度倍数
    multiplier *= this.getComplexityMultiplier(result)

    // 选项倍数
    if (options.multiplier) {
      multiplier *= options.multiplier
    }

    if (options.share) {
      multiplier *= 1.2 // 分享奖励
    }

    if (options.persist) {
      multiplier *= 1.5 // 持久化奖励
    }

    // 限制倍数范围
    return Math.max(0.1, Math.min(multiplier, 10.0))
  }

  /**
   * 获取性能倍数
   */
  private getPerformanceMultiplier<T>(result: T): number {
    // 基于结果大小和复杂度的性能评估
    if (typeof result === 'string') {
      if (result.length < 50) return 1.2
      if (result.length < 200) return 1.0
      return 0.8
    }

    if (Array.isArray(result)) {
      if (result.length < 10) return 1.1
      if (result.length < 50) return 1.0
      return 0.9
    }

    if (typeof result === 'object' && result !== null) {
      const size = Object.keys(result).length
      if (size < 5) return 1.1
      if (size < 20) return 1.0
      return 0.9
    }

    return 1.0
  }

  /**
   * 获取质量倍数
   */
  private getQualityMultiplier<T>(result: T): number {
    // 检查结果的质量指标
    if (result === null || result === undefined) {
      return 0.0
    }

    let qualityScore = 1.0

    // 检查完整性
    if (this.isCompleteResult(result)) {
      qualityScore += 0.2
    }

    // 检查准确性
    if (this.isAccurateResult(result)) {
      qualityScore += 0.3
    }

    // 检查有用性
    if (this.isUsefulResult(result)) {
      qualityScore += 0.2
    }

    return Math.min(qualityScore, 2.0)
  }

  /**
   * 获取复杂度倍数
   */
  private getComplexityMultiplier<T>(result: T): number {
    // 基于处理复杂度的奖励
    let complexity = 1.0

    if (typeof result === 'object' && result !== null) {
      const keys = Object.keys(result)
      complexity += keys.length * 0.05
    }

    if (Array.isArray(result)) {
      complexity += result.length * 0.03
    }

    if (typeof result === 'string') {
      complexity += result.length * 0.001
    }

    return Math.min(complexity, 2.0)
  }

  /**
   * 检查结果完整性
   */
  private isCompleteResult<T>(result: T): boolean {
    if (typeof result === 'object' && result !== null) {
      const keys = Object.keys(result)
      return keys.length > 0 && !keys.some(key => result[key as keyof T] === undefined)
    }

    if (Array.isArray(result)) {
      return result.length > 0 && result.every(item => item !== undefined)
    }

    return result !== null && result !== undefined
  }

  /**
   * 检查结果准确性
   */
  private isAccurateResult<T>(result: T): boolean {
    // 简单的准确性检查
    if (typeof result === 'number') {
      return !isNaN(result) && isFinite(result)
    }

    if (typeof result === 'string') {
      return result.trim().length > 0
    }

    if (Array.isArray(result)) {
      return result.length > 0
    }

    return true
  }

  /**
   * 检查结果有用性
   */
  private isUsefulResult<T>(result: T): boolean {
    // 基于结果大小和内容的实用性检查
    if (typeof result === 'string') {
      return result.length > 5 && result.length < 10000
    }

    if (Array.isArray(result)) {
      return result.length > 0 && result.length < 1000
    }

    if (typeof result === 'object' && result !== null) {
      const keys = Object.keys(result)
      return keys.length > 0 && keys.length < 100
    }

    return true
  }

  /**
   * 获取奖励因子
   */
  private getRewardFactors<T>(result: T, context: string): string[] {
    const factors: string[] = []

    // 基础因子
    factors.push('base')
    factors.push(context)

    // 类型因子
    if (typeof result === 'string') factors.push('string')
    else if (typeof result === 'number') factors.push('number')
    else if (typeof result === 'boolean') factors.push('boolean')
    else if (Array.isArray(result)) factors.push('array')
    else if (typeof result === 'object' && result !== null) factors.push('object')

    // 质量因子
    if (this.isCompleteResult(result)) factors.push('complete')
    if (this.isAccurateResult(result)) factors.push('accurate')
    if (this.isUsefulResult(result)) factors.push('useful')

    return factors
  }

  /**
   * 更新平均倍数
   */
  private updateAverageMultiplier(multiplier: number): void {
    const total = this.stats.totalCalculations
    const current = this.stats.averageMultiplier
    
    this.stats.averageMultiplier = (current * (total - 1) + multiplier) / total
  }

  /**
   * 初始化基础奖励
   */
  private initializeBaseRewards(): void {
    this.baseRewards.set('api_call', 20)
    this.baseRewards.set('database_query', 25)
    this.baseRewards.set('user_interaction', 15)
    this.baseRewards.set('data_processing', 18)
    this.baseRewards.set('calculation', 10)
    this.baseRewards.set('validation', 12)
    this.baseRewards.set('file_operation', 22)
    this.baseRewards.set('network_request', 20)
  }

  /**
   * 初始化倍数映射
   */
  private initializeMultipliers(): void {
    this.multipliers.set('api_call', 1.2)
    this.multipliers.set('database_query', 1.3)
    this.multipliers.set('user_interaction', 1.1)
    this.multipliers.set('data_processing', 1.15)
    this.multipliers.set('calculation', 1.0)
    this.multipliers.set('validation', 1.05)
    this.multipliers.set('file_operation', 1.25)
    this.multipliers.set('network_request', 1.2)
  }

  /**
   * 获取统计信息
   */
  getStats(): RewardAmplifierStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalCalculations = 0
    this.stats.totalAmplified = 0
    this.stats.averageMultiplier = 1.0
  }
}