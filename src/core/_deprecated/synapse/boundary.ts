/**
 * 突触边界 - 控制应用间通信的边界
 */

interface SynapseBoundaryStats {
  totalConnections: number
  activeConnections: number
  signalTransfers: number
  blockedTransfers: number
}

interface ConnectionRule {
  fromApp: string
  toApp: string
  allowedSignalTypes: string[]
  maxFrequency: number // 每秒最大信号数
  priority: number
}

export class SynapseBoundary {
  private stats: SynapseBoundaryStats
  private connections: Map<string, SynapseConnection>
  private rules: Map<string, ConnectionRule>
  private signalFrequency: Map<string, number[]>
  private maxHistorySize: number

  constructor() {
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      signalTransfers: 0,
      blockedTransfers: 0
    }
    this.connections = new Map()
    this.rules = new Map()
    this.signalFrequency = new Map()
    this.maxHistorySize = 100
    this.initializeDefaultRules()
  }

  /**
   * 创建连接
   */
  createConnection(
    fromApp: string,
    toApp: string,
    protocol: SynapseProtocol
  ): SynapseConnection {
    // 检查是否允许连接
    if (!this.isConnectionAllowed(fromApp, toApp)) {
      throw new Error(`Connection from ${fromApp} to ${toApp} is not allowed`)
    }

    const connectionId = this.generateConnectionId(fromApp, toApp)
    
    const connection: SynapseConnection = {
      id: connectionId,
      fromApp,
      toApp,
      protocol,
      status: 'active',
      created: new Date(),
      lastUsed: new Date()
    }

    this.connections.set(connectionId, connection)
    this.stats.totalConnections++
    this.stats.activeConnections++

    return connection
  }

  /**
   * 检查连接是否允许
   */
  private isConnectionAllowed(fromApp: string, toApp: string): boolean {
    const ruleKey = `${fromApp}->${toApp}`
    const rule = this.rules.get(ruleKey)
    
    // 如果没有规则，默认允许
    if (!rule) {
      return true
    }

    return rule.fromApp === fromApp && rule.toApp === toApp
  }

  /**
   * 验证信号传输
   */
  validateSignalTransfer(
    connection: SynapseConnection,
    signal: SynapseSignal
  ): { allowed: boolean; reason?: string } {
    // 检查连接状态
    if (connection.status !== 'active') {
      this.stats.blockedTransfers++
      return { allowed: false, reason: 'Connection is not active' }
    }

    // 检查信号类型
    const ruleKey = `${connection.fromApp}->${connection.toApp}`
    const rule = this.rules.get(ruleKey)
    
    if (rule && !rule.allowedSignalTypes.includes(signal.type)) {
      this.stats.blockedTransfers++
      return { allowed: false, reason: `Signal type ${signal.type} not allowed` }
    }

    // 检查频率限制
    if (!this.checkFrequencyLimit(connection, rule)) {
      this.stats.blockedTransfers++
      return { allowed: false, reason: 'Frequency limit exceeded' }
    }

    // 检查TTL
    if (signal.metadata.ttl) {
      const now = new Date()
      const signalAge = now.getTime() - signal.metadata.timestamp.getTime()
      if (signalAge > signal.metadata.ttl) {
        this.stats.blockedTransfers++
        return { allowed: false, reason: 'Signal expired' }
      }
    }

    this.stats.signalTransfers++
    connection.lastUsed = new Date()
    
    return { allowed: true }
  }

  /**
   * 检查频率限制
   */
  private checkFrequencyLimit(
    connection: SynapseConnection,
    rule?: ConnectionRule
  ): boolean {
    if (!rule || rule.maxFrequency <= 0) {
      return true
    }

    const now = Date.now()
    const connectionKey = connection.id
    const timestamps = this.signalFrequency.get(connectionKey) || []

    // 清理1秒前的记录
    const oneSecondAgo = now - 1000
    const recentTimestamps = timestamps.filter(t => t > oneSecondAgo)
    
    // 检查是否超过频率限制
    if (recentTimestamps.length >= rule.maxFrequency) {
      return false
    }

    // 添加当前时间戳
    recentTimestamps.push(now)
    this.signalFrequency.set(connectionKey, recentTimestamps)

    return true
  }

  /**
   * 关闭连接
   */
  closeConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      return false
    }

    connection.status = 'inactive'
    this.stats.activeConnections--
    
    // 清理频率记录
    this.signalFrequency.delete(connectionId)

    return true
  }

  /**
   * 获取连接
   */
  getConnection(connectionId: string): SynapseConnection | null {
    return this.connections.get(connectionId) || null
  }

  /**
   * 获取应用的所有连接
   */
  getAppConnections(appId: string): SynapseConnection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.fromApp === appId || conn.toApp === appId
    )
  }

  /**
   * 添加连接规则
   */
  addRule(rule: ConnectionRule): void {
    const ruleKey = `${rule.fromApp}->${rule.toApp}`
    this.rules.set(ruleKey, rule)
  }

  /**
   * 移除连接规则
   */
  removeRule(fromApp: string, toApp: string): boolean {
    const ruleKey = `${fromApp}->${toApp}`
    return this.rules.delete(ruleKey)
  }

  /**
   * 获取连接规则
   */
  getRule(fromApp: string, toApp: string): ConnectionRule | null {
    const ruleKey = `${fromApp}->${toApp}`
    return this.rules.get(ruleKey) || null
  }

  /**
   * 清理过期连接
   */
  cleanupExpiredConnections(): void {
    const now = new Date()
    const expireTime = 30 * 60 * 1000 // 30分钟

    for (const [id, connection] of this.connections) {
      if (connection.status === 'active') {
        const idleTime = now.getTime() - connection.lastUsed.getTime()
        if (idleTime > expireTime) {
          this.closeConnection(id)
        }
      }
    }
  }

  /**
   * 生成连接ID
   */
  private generateConnectionId(fromApp: string, toApp: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${fromApp}_to_${toApp}_${timestamp}_${random}`
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    // 允许所有应用间的基本通信
    this.addRule({
      fromApp: '*',
      toApp: '*',
      allowedSignalTypes: ['data', 'event', 'request', 'response'],
      maxFrequency: 100,
      priority: 1
    })

    // 高优先级通信规则
    this.addRule({
      fromApp: 'system',
      toApp: '*',
      allowedSignalTypes: ['command', 'alert', 'system_event'],
      maxFrequency: 1000,
      priority: 10
    })

    // 用户界面通信规则
    this.addRule({
      fromApp: 'ui',
      toApp: 'api',
      allowedSignalTypes: ['user_action', 'request', 'query'],
      maxFrequency: 50,
      priority: 5
    })
  }

  /**
   * 获取统计信息
   */
  getStats(): SynapseBoundaryStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalConnections = this.connections.size
    this.stats.activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.status === 'active').length
    this.stats.signalTransfers = 0
    this.stats.blockedTransfers = 0
  }
}

interface SynapseProtocol {
  type: 'sync' | 'async' | 'stream'
  reliability: 'best_effort' | 'at_least_once' | 'exactly_once'
  encoding: 'json' | 'binary' | 'text'
  compression: boolean
  encryption: boolean
}

interface SynapseConnection {
  id: string
  fromApp: string
  toApp: string
  protocol: SynapseProtocol
  status: 'active' | 'inactive' | 'error'
  created: Date
  lastUsed: Date
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