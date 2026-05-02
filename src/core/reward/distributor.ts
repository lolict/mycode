/**
 * 奖励分发器 - 分发奖励到各个接收器
 */

interface RewardDistributorStats {
  totalDistributions: number
  totalRewarded: number
  receivers: Map<string, number>
}

interface RewardReceiver {
  id: string
  name: string
  type: 'user' | 'system' | 'component' | 'service'
  weight: number
  enabled: boolean
}

interface DistributionRecord {
  id: string
  reward: RewardCalculation
  receivers: string[]
  timestamp: Date
  distributed: boolean
}

export class RewardDistributor {
  private stats: RewardDistributorStats
  private receivers: Map<string, RewardReceiver>
  private distributionHistory: DistributionRecord[]

  constructor() {
    this.stats = {
      totalDistributions: 0,
      totalRewarded: 0,
      receivers: new Map()
    }
    this.receivers = new Map()
    this.distributionHistory = []
    this.initializeDefaultReceivers()
  }

  /**
   * 分发奖励
   */
  async distribute(calculation: RewardCalculation): Promise<boolean> {
    this.stats.totalDistributions++

    try {
      const eligibleReceivers = this.getEligibleReceivers()
      
      if (eligibleReceivers.length === 0) {
        return false
      }

      // 计算每个接收器的奖励份额
      const shares = this.calculateShares(calculation.finalValue, eligibleReceivers)
      
      // 分发奖励
      const distributionRecord: DistributionRecord = {
        id: this.generateDistributionId(),
        reward: calculation,
        receivers: eligibleReceivers.map(r => r.id),
        timestamp: new Date(),
        distributed: false
      }

      let successCount = 0
      
      for (const receiver of eligibleReceivers) {
        const share = shares.get(receiver.id) || 0
        
        if (await this.sendReward(receiver, share, calculation)) {
          successCount++
          this.updateReceiverStats(receiver.id, share)
        }
      }

      distributionRecord.distributed = successCount > 0
      this.recordDistribution(distributionRecord)

      if (successCount > 0) {
        this.stats.totalRewarded += calculation.finalValue
      }

      return successCount > 0
    } catch (error) {
      // 分发失败不应该抛出错误
      this.handleDistributionError(error, calculation)
      return false
    }
  }

  /**
   * 获取符合条件的接收器
   */
  private getEligibleReceivers(): RewardReceiver[] {
    return Array.from(this.receivers.values())
      .filter(receiver => receiver.enabled)
      .sort((a, b) => b.weight - a.weight)
  }

  /**
   * 计算奖励份额
   */
  private calculateShares(
    totalReward: number,
    receivers: RewardReceiver[]
  ): Map<string, number> {
    const shares = new Map<string, number>()
    const totalWeight = receivers.reduce((sum, r) => sum + r.weight, 0)

    for (const receiver of receivers) {
      const share = Math.round((receiver.weight / totalWeight) * totalReward)
      shares.set(receiver.id, share)
    }

    return shares
  }

  /**
   * 发送奖励到接收器
   */
  private async sendReward(
    receiver: RewardReceiver,
    amount: number,
    calculation: RewardCalculation
  ): Promise<boolean> {
    try {
      switch (receiver.type) {
        case 'user':
          return this.sendUserReward(receiver, amount, calculation)
        case 'system':
          return this.sendSystemReward(receiver, amount, calculation)
        case 'component':
          return this.sendComponentReward(receiver, amount, calculation)
        case 'service':
          return this.sendServiceReward(receiver, amount, calculation)
        default:
          return false
      }
    } catch {
      return false
    }
  }

  /**
   * 发送用户奖励
   */
  private async sendUserReward(
    receiver: RewardReceiver,
    amount: number,
    calculation: RewardCalculation
  ): Promise<boolean> {
    try {
      // 更新用户奖励余额
      this.updateUserBalance(receiver.id, amount)
      
      // 触发用户奖励事件
      this.triggerUserRewardEvent(receiver.id, amount, calculation)
      
      return true
    } catch {
      return false
    }
  }

  /**
   * 发送系统奖励
   */
  private async sendSystemReward(
    receiver: RewardReceiver,
    amount: number,
    calculation: RewardCalculation
  ): Promise<boolean> {
    try {
      // 更新系统性能指标
      this.updateSystemMetrics(receiver.id, amount, calculation)
      
      // 记录系统奖励
      this.recordSystemReward(receiver.id, amount, calculation)
      
      return true
    } catch {
      return false
    }
  }

  /**
   * 发送组件奖励
   */
  private async sendComponentReward(
    receiver: RewardReceiver,
    amount: number,
    calculation: RewardCalculation
  ): Promise<boolean> {
    try {
      // 更新组件健康度
      this.updateComponentHealth(receiver.id, amount, calculation)
      
      // 触发组件优化
      this.triggerComponentOptimization(receiver.id, amount)
      
      return true
    } catch {
      return false
    }
  }

  /**
   * 发送服务奖励
   */
  private async sendServiceReward(
    receiver: RewardReceiver,
    amount: number,
    calculation: RewardCalculation
  ): Promise<boolean> {
    try {
      // 更新服务等级
      this.updateServiceLevel(receiver.id, amount)
      
      // 记录服务奖励
      this.recordServiceReward(receiver.id, amount, calculation)
      
      return true
    } catch {
      return false
    }
  }

  /**
   * 更新用户余额
   */
  private updateUserBalance(userId: string, amount: number): void {
    try {
      if (typeof globalThis !== 'undefined') {
        const balances: Record<string, number> = (globalThis as any).__userBalances || {}
        balances[userId] = (balances[userId] || 0) + amount
        ;(globalThis as any).__userBalances = balances
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 触发用户奖励事件
   */
  private triggerUserRewardEvent(
    userId: string,
    amount: number,
    calculation: RewardCalculation
  ): void {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const event = new CustomEvent('userReward', {
          detail: { userId, amount, calculation }
        })
        window.dispatchEvent(event)
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 更新系统指标
   */
  private updateSystemMetrics(
    systemId: string,
    amount: number,
    calculation: RewardCalculation
  ): void {
    try {
      if (typeof globalThis !== 'undefined') {
        const metrics: Record<string, any> = (globalThis as any).__systemMetrics || {}
        metrics[systemId] = {
          totalRewards: (metrics[systemId]?.totalRewards || 0) + amount,
          lastReward: new Date(),
          performance: Math.min((metrics[systemId]?.performance || 0.5) + 0.01, 1.0)
        }
        ;(globalThis as any).__systemMetrics = metrics
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 记录系统奖励
   */
  private recordSystemReward(
    systemId: string,
    amount: number,
    calculation: RewardCalculation
  ): void {
    try {
      const record = {
        systemId,
        amount,
        calculation,
        timestamp: new Date()
      }

      const records = (globalThis as any).__systemRewardRecords || []
      records.push(record)
      
      if (records.length > 1000) {
        records.splice(0, records.length - 1000)
      }
      
      (globalThis as any).__systemRewardRecords = records
    } catch {
      // 静默处理
    }
  }

  /**
   * 更新组件健康度
   */
  private updateComponentHealth(
    componentId: string,
    amount: number,
    calculation: RewardCalculation
  ): void {
    try {
      if (typeof globalThis !== 'undefined') {
        const health: Record<string, any> = (globalThis as any).__componentHealth || {}
        health[componentId] = {
          score: Math.min((health[componentId]?.score || 0.5) + amount / 1000, 1.0),
          lastReward: new Date(),
          totalRewards: (health[componentId]?.totalRewards || 0) + amount
        }
        ;(globalThis as any).__componentHealth = health
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 触发组件优化
   */
  private triggerComponentOptimization(componentId: string, amount: number): void {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const event = new CustomEvent('componentOptimization', {
          detail: { componentId, amount }
        })
        window.dispatchEvent(event)
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 更新服务等级
   */
  private updateServiceLevel(serviceId: string, amount: number): void {
    try {
      if (typeof globalThis !== 'undefined') {
        const levels: Record<string, number> = (globalThis as any).__serviceLevels || {}
        const currentLevel = levels[serviceId] || 1
        const newLevel = Math.min(currentLevel + Math.floor(amount / 100), 10)
        levels[serviceId] = newLevel
        ;(globalThis as any).__serviceLevels = levels
      }
    } catch {
      // 静默处理
    }
  }

  /**
   * 记录服务奖励
   */
  private recordServiceReward(
    serviceId: string,
    amount: number,
    calculation: RewardCalculation
  ): void {
    try {
      const record = {
        serviceId,
        amount,
        calculation,
        timestamp: new Date()
      }

      const records = (globalThis as any).__serviceRewardRecords || []
      records.push(record)
      
      if (records.length > 1000) {
        records.splice(0, records.length - 1000)
      }
      
      (globalThis as any).__serviceRewardRecords = records
    } catch {
      // 静默处理
    }
  }

  /**
   * 更新接收器统计
   */
  private updateReceiverStats(receiverId: string, amount: number): void {
    const current = this.stats.receivers.get(receiverId) || 0
    this.stats.receivers.set(receiverId, current + amount)
  }

  /**
   * 记录分发
   */
  private recordDistribution(record: DistributionRecord): void {
    this.distributionHistory.push(record)
    
    // 限制历史记录数量
    if (this.distributionHistory.length > 1000) {
      this.distributionHistory.splice(0, this.distributionHistory.length - 1000)
    }
  }

  /**
   * 处理分发错误
   */
  private handleDistributionError(error: unknown, calculation: RewardCalculation): void {
    try {
      const errorRecord = {
        error: error instanceof Error ? error.message : String(error),
        calculation,
        timestamp: new Date()
      }

      const errors = (globalThis as any).__distributionErrors || []
      errors.push(errorRecord)
      
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100)
      }
      
      (globalThis as any).__distributionErrors = errors
    } catch {
      // 静默处理
    }
  }

  /**
   * 生成分发ID
   */
  private generateDistributionId(): string {
    return `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 初始化默认接收器
   */
  private initializeDefaultReceivers(): void {
    // 系统接收器
    this.addReceiver({
      id: 'system_core',
      name: 'System Core',
      type: 'system',
      weight: 0.3,
      enabled: true
    })

    // 组件接收器
    this.addReceiver({
      id: 'component_ui',
      name: 'UI Components',
      type: 'component',
      weight: 0.2,
      enabled: true
    })

    // 服务接收器
    this.addReceiver({
      id: 'service_api',
      name: 'API Services',
      type: 'service',
      weight: 0.25,
      enabled: true
    })

    // 用户接收器
    this.addReceiver({
      id: 'user_default',
      name: 'Default User',
      type: 'user',
      weight: 0.25,
      enabled: true
    })
  }

  /**
   * 添加接收器
   */
  addReceiver(receiver: RewardReceiver): void {
    this.receivers.set(receiver.id, receiver)
  }

  /**
   * 移除接收器
   */
  removeReceiver(receiverId: string): void {
    this.receivers.delete(receiverId)
  }

  /**
   * 启用/禁用接收器
   */
  toggleReceiver(receiverId: string, enabled: boolean): void {
    const receiver = this.receivers.get(receiverId)
    if (receiver) {
      receiver.enabled = enabled
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): RewardDistributorStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalDistributions = 0
    this.stats.totalRewarded = 0
    this.stats.receivers.clear()
  }
}

interface RewardCalculation {
  baseValue: number
  multiplier: number
  finalValue: number
  factors: string[]
}