/**
 * 志愿者节点系统 — 别人出服务器，我们出软件
 *
 * 原理：
 * 1. 志愿者在我们的平台上注册自己的服务器地址
 * 2. 系统自动检测节点是否在线
 * 3. 所有用户的数据请求可以路由到志愿者节点
 * 4. 志愿者获得多巴胺积分奖励（出服务器=做善事）
 *
 * 这就是 D4D 的"第四滴"——众人作为分身向上递归汇聚能量。
 *
 * 志愿者可以提供：
 * - API 代理（运行我们的 Next.js 程序）
 * - 数据中转（转发实时数据）
 * - 算力支持（帮忙渲染/计算）
 * - 存储支持（提供额外存储空间）
 */

import { db } from '@/lib/db'

// ============================================
// 节点类型定义
// ============================================

export interface VolunteerNode {
  id: string
  name: string
  url: string
  description?: string
  providedBy: string       // 志愿者名称
  contactInfo?: string     // 联系方式
  nodeType: 'api' | 'relay' | 'compute' | 'storage' | 'full'
  status: 'active' | 'offline' | 'pending' | 'rejected'
  lastHeartbeat: number | null
  uptime: number           // 在线率百分比
  region?: string          // 节点所在地区
  capabilities: string[]   // 节点能力
  registeredAt: number
}

export interface NodeHealthCheck {
  nodeId: string
  online: boolean
  responseTime: number     // 毫秒
  version?: string
  activeConnections?: number
  load?: number            // 负载百分比
  timestamp: number
}

// ============================================
// 志愿者节点管理器
// ============================================

class VolunteerNodeManager {
  private healthCheckIntervalId: NodeJS.Timeout | null = null
  private healthResults: Map<string, NodeHealthCheck> = new Map()

  /**
   * 注册新的志愿者节点
   *
   * 别人自愿填写自己的服务器地址，支持我们的平台
   */
  async registerNode(node: Omit<VolunteerNode, 'id' | 'status' | 'lastHeartbeat' | 'uptime' | 'registeredAt'>): Promise<VolunteerNode> {
    const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const newNode: VolunteerNode = {
      ...node,
      id,
      status: 'pending', // 需要验证后才能变成 active
      lastHeartbeat: null,
      uptime: 0,
      registeredAt: Date.now(),
    }

    // 验证节点是否可访问
    const health = await this.checkNodeHealth(newNode.url)
    if (health.online) {
      newNode.status = 'active'
      newNode.lastHeartbeat = Date.now()
    }

    // 存储到本地
    this.healthResults.set(id, health)

    return newNode
  }

  /**
   * 检查节点健康状态
   */
  async checkNodeHealth(url: string): Promise<NodeHealthCheck> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5秒超时
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        return {
          nodeId: '',
          online: true,
          responseTime,
          version: data.version,
          activeConnections: data.activeConnections,
          load: data.load,
          timestamp: Date.now(),
        }
      }

      return {
        nodeId: '',
        online: false,
        responseTime,
        timestamp: Date.now(),
      }
    } catch {
      return {
        nodeId: '',
        online: false,
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 获取所有活跃节点
   */
  getActiveNodes(): VolunteerNode[] {
    // 从健康检查结果中筛选在线节点
    const activeNodes: VolunteerNode[] = []
    for (const [nodeId, health] of this.healthResults) {
      if (health.online) {
        activeNodes.push({
          id: nodeId,
          name: '',
          url: '',
          providedBy: '',
          nodeType: 'full',
          status: 'active',
          lastHeartbeat: health.timestamp,
          uptime: 0,
          registeredAt: 0,
        })
      }
    }
    return activeNodes
  }

  /**
   * 获取最优节点 — 响应最快、负载最低
   */
  getBestNode(): VolunteerNode | null {
    const activeNodes = this.getActiveNodes()
    if (activeNodes.length === 0) return null

    // 按响应时间排序，选最快的
    let best = activeNodes[0]
    let bestTime = Infinity

    for (const node of activeNodes) {
      const health = this.healthResults.get(node.id)
      if (health && health.responseTime < bestTime) {
        bestTime = health.responseTime
        best = node
      }
    }

    return best
  }

  /**
   * 获取所有节点的健康状态
   */
  getHealthStatus(): Map<string, NodeHealthCheck> {
    return new Map(this.healthResults)
  }

  /**
   * 启动定期健康检查
   */
  startHealthCheck(interval = 60000): void {
    this.stopHealthCheck()
    this.healthCheckIntervalId = setInterval(async () => {
      await this.runHealthChecks()
    }, interval)
  }

  /**
   * 停止健康检查
   */
  stopHealthCheck(): void {
    if (this.healthCheckIntervalId) {
      clearInterval(this.healthCheckIntervalId)
      this.healthCheckIntervalId = null
    }
  }

  /**
   * 执行一轮健康检查
   */
  private async runHealthChecks(): Promise<void> {
    // 对所有已知节点做健康检查
    for (const [nodeId, _] of this.healthResults) {
      // TODO: 从持久化存储读取节点URL
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopHealthCheck()
    this.healthResults.clear()
  }
}

// ============================================
// 全局单例
// ============================================

let instance: VolunteerNodeManager | null = null

export function getVolunteerNodeManager(): VolunteerNodeManager {
  if (!instance) {
    instance = new VolunteerNodeManager()
  }
  return instance
}

export { VolunteerNodeManager }
