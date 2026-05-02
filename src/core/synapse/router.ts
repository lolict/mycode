/**
 * 突触路由器 - 负责路由信号到正确的目标应用
 */

interface SynapseRouterStats {
  totalRoutes: number
  successfulRoutes: number
  failedRoutes: number
  averageRoutingTime: number
}

interface RouteRule {
  id: string
  name: string
  condition: (signal: SynapseSignal) => boolean
  targets: string[]
  priority: number
  enabled: boolean
  loadBalancing: 'round_robin' | 'random' | 'weighted'
  weights?: number[]
}

interface RoutingCache {
  signalPattern: string
  targets: string[]
  timestamp: Date
  ttl: number
}

export class SynapseRouter {
  private stats: SynapseRouterStats
  private rules: RouteRule[]
  private cache: Map<string, RoutingCache>
  private roundRobinCounters: Map<string, number>

  constructor() {
    this.stats = {
      totalRoutes: 0,
      successfulRoutes: 0,
      failedRoutes: 0,
      averageRoutingTime: 0
    }
    this.rules = []
    this.cache = new Map()
    this.roundRobinCounters = new Map()
    this.initializeDefaultRules()
  }

  /**
   * 路由信号到目标应用
   */
  async route(signal: SynapseSignal): Promise<SynapseResponse[]> {
    this.stats.totalRoutes++
    const startTime = Date.now()

    try {
      // 获取目标应用列表
      const targets = await this.resolveTargets(signal)
      
      if (targets.length === 0) {
        throw new Error('No targets found for signal')
      }

      // 并行发送到所有目标
      const responses = await Promise.allSettled(
        targets.map(target => this.sendToTarget(signal, target))
      )

      const successfulResponses: SynapseResponse[] = []
      const failedResponses: SynapseResponse[] = []

      responses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResponses.push(result.value)
        } else {
          failedResponses.push({
            id: this.generateResponseId(),
            signalId: signal.id,
            status: 'error',
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            timestamp: new Date()
          })
        }
      })

      const routingTime = Date.now() - startTime
      this.updateAverageRoutingTime(routingTime)
      this.stats.successfulRoutes++

      return [...successfulResponses, ...failedResponses]
    } catch (error) {
      this.stats.failedRoutes++
      
      return [{
        id: this.generateResponseId(),
        signalId: signal.id,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      }]
    }
  }

  /**
   * 解析目标应用
   */
  private async resolveTargets(signal: SynapseSignal): Promise<string[]> {
    // 检查缓存
    const cacheKey = this.generateCacheKey(signal)
    const cached = this.cache.get(cacheKey)
    
    if (cached && this.isCacheValid(cached)) {
      return cached.targets
    }

    // 应用路由规则
    const matchedRules = this.rules
      .filter(rule => rule.enabled && rule.condition(signal))
      .sort((a, b) => b.priority - a.priority)

    if (matchedRules.length === 0) {
      return []
    }

    // 使用第一个匹配的规则
    const rule = matchedRules[0]
    const targets = this.selectTargets(rule, signal)

    // 缓存结果
    this.cache.set(cacheKey, {
      signalPattern: cacheKey,
      targets,
      timestamp: new Date(),
      ttl: 60000 // 1分钟
    })

    return targets
  }

  /**
   * 选择目标应用
   */
  private selectTargets(rule: RouteRule, signal: SynapseSignal): string[] {
    switch (rule.loadBalancing) {
      case 'round_robin':
        return this.selectRoundRobin(rule)
      case 'random':
        return this.selectRandom(rule)
      case 'weighted':
        return this.selectWeighted(rule)
      default:
        return rule.targets
    }
  }

  /**
   * 轮询选择
   */
  private selectRoundRobin(rule: RouteRule): string[] {
    const counter = this.roundRobinCounters.get(rule.id) || 0
    const target = rule.targets[counter % rule.targets.length]
    
    this.roundRobinCounters.set(rule.id, counter + 1)
    
    return [target]
  }

  /**
   * 随机选择
   */
  private selectRandom(rule: RouteRule): string[] {
    const randomIndex = Math.floor(Math.random() * rule.targets.length)
    return [rule.targets[randomIndex]]
  }

  /**
   * 权重选择
   */
  private selectWeighted(rule: RouteRule): string[] {
    if (!rule.weights || rule.weights.length !== rule.targets.length) {
      return this.selectRandom(rule)
    }

    const totalWeight = rule.weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < rule.targets.length; i++) {
      random -= rule.weights![i]
      if (random <= 0) {
        return [rule.targets[i]]
      }
    }

    return [rule.targets[rule.targets.length - 1]]
  }

  /**
   * 发送到目标应用
   */
  private async sendToTarget(
    signal: SynapseSignal,
    target: string
  ): Promise<SynapseResponse> {
    try {
      // 创建目标信号
      const targetSignal: SynapseSignal = {
        ...signal,
        id: this.generateSignalId(),
        target,
        metadata: {
          priority: signal.metadata.priority,
          timestamp: signal.metadata.timestamp,
          ttl: signal.metadata.ttl,
          correlationId: signal.metadata.correlationId,
          routed: true,
          originalTarget: signal.target,
          routingTimestamp: new Date()
        } as any
      }

      // 这里应该通过突触系统发送信号
      // 模拟发送
      await this.simulateSend(targetSignal)

      return {
        id: this.generateResponseId(),
        signalId: signal.id,
        status: 'success',
        payload: { routed: true, target },
        timestamp: new Date()
      }
    } catch (error) {
      return {
        id: this.generateResponseId(),
        signalId: signal.id,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      }
    }
  }

  /**
   * 模拟发送信号
   */
  private async simulateSend(signal: SynapseSignal): Promise<void> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
    
    // 模拟成功率95%
    if (Math.random() > 0.95) {
      throw new Error('Network simulation error')
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(signal: SynapseSignal): string {
    return `${signal.type}:${signal.source}:${signal.target}`
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cache: RoutingCache): boolean {
    const now = new Date()
    const age = now.getTime() - cache.timestamp.getTime()
    return age < cache.ttl
  }

  /**
   * 添加路由规则
   */
  addRule(rule: Omit<RouteRule, 'id'>): string {
    const newRule: RouteRule = {
      ...rule,
      id: this.generateRuleId()
    }

    this.rules.push(newRule)
    this.sortRulesByPriority()

    return newRule.id
  }

  /**
   * 移除路由规则
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId)
    if (index > -1) {
      this.rules.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 启用/禁用路由规则
   */
  toggleRule(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.enabled = enabled
      return true
    }
    return false
  }

  /**
   * 按优先级排序规则
   */
  private sortRulesByPriority(): void {
    this.rules.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(): void {
    const now = new Date()
    
    for (const [key, cache] of this.cache) {
      const age = now.getTime() - cache.timestamp.getTime()
      if (age > cache.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    // 系统信号路由
    this.addRule({
      name: 'System Signals',
      condition: (signal) => signal.type.startsWith('system_'),
      targets: ['system_core'],
      priority: 100,
      enabled: true,
      loadBalancing: 'round_robin'
    })

    // 用户交互路由
    this.addRule({
      name: 'User Interactions',
      condition: (signal) => signal.type.startsWith('user_'),
      targets: ['ui_handler', 'event_processor'],
      priority: 90,
      enabled: true,
      loadBalancing: 'round_robin'
    })

    // API请求路由
    this.addRule({
      name: 'API Requests',
      condition: (signal) => signal.type.startsWith('api_'),
      targets: ['api_gateway', 'request_handler'],
      priority: 80,
      enabled: true,
      loadBalancing: 'weighted',
      weights: [0.7, 0.3]
    })

    // 数据处理路由
    this.addRule({
      name: 'Data Processing',
      condition: (signal) => signal.type.startsWith('data_'),
      targets: ['data_processor', 'cache_manager'],
      priority: 70,
      enabled: true,
      loadBalancing: 'random'
    })

    // 默认路由
    this.addRule({
      name: 'Default Route',
      condition: () => true,
      targets: ['default_handler'],
      priority: 1,
      enabled: true,
      loadBalancing: 'round_robin'
    })
  }

  /**
   * 更新平均路由时间
   */
  private updateAverageRoutingTime(routingTime: number): void {
    const total = this.stats.totalRoutes
    const current = this.stats.averageRoutingTime
    
    this.stats.averageRoutingTime = (current * (total - 1) + routingTime) / total
  }

  /**
   * 生成规则ID
   */
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成信号ID
   */
  private generateSignalId(): string {
    return `routed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成响应ID
   */
  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取统计信息
   */
  getStats(): SynapseRouterStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalRoutes = 0
    this.stats.successfulRoutes = 0
    this.stats.failedRoutes = 0
    this.stats.averageRoutingTime = 0
  }

  /**
   * 获取所有规则
   */
  getRules(): RouteRule[] {
    return [...this.rules]
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // 模拟缓存命中率
    }
  }
}

interface SynapseSignal {
  id: string
  type: string
  source: string
  target: string
  payload: any
  metadata: {
    priority: number
    timestamp: Date
    ttl?: number
    correlationId?: string
  }
}

interface SynapseResponse {
  id: string
  signalId: string
  status: 'success' | 'error' | 'timeout'
  payload?: any
  error?: string
  timestamp: Date
}