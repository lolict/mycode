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
  providedBy: string
  contactInfo?: string
  nodeType: 'api' | 'relay' | 'compute' | 'storage' | 'full'
  status: 'active' | 'offline' | 'pending' | 'rejected'
  lastHeartbeat: number | null
  uptime: number
  region?: string
  capabilities: string[]
  registeredAt: number
}

export interface NodeHealthCheck {
  nodeId: string
  online: boolean
  responseTime: number
  version?: string
  activeConnections?: number
  load?: number
  timestamp: number
}

// ============================================
// 志愿者节点管理器
// ============================================

class VolunteerNodeManager {
  private healthCheckIntervalId: NodeJS.Timeout | null = null
  private healthResults: Map<string, NodeHealthCheck> = new Map()
  private nodesCache: Map<string, VolunteerNode> = new Map()

  /**
   * 注册新的志愿者节点
   */
  async registerNode(node: Omit<VolunteerNode, 'id' | 'status' | 'lastHeartbeat' | 'uptime' | 'registeredAt'>): Promise<VolunteerNode> {
    const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const newNode: VolunteerNode = {
      ...node,
      id,
      status: 'pending',
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

    // 持久化到数据库
    try {
      await db.volunteerNode.create({
        data: {
          id: newNode.id,
          name: newNode.name,
          url: newNode.url,
          description: newNode.description,
          providedBy: newNode.providedBy,
          contactInfo: newNode.contactInfo,
          nodeType: newNode.nodeType,
          status: newNode.status,
          lastHeartbeat: newNode.lastHeartbeat ? new Date(newNode.lastHeartbeat) : null,
          uptime: newNode.uptime,
          region: newNode.region,
          capabilities: JSON.stringify(newNode.capabilities),
        },
      })
    } catch (error) {
      console.error('志愿者节点持久化失败:', error)
    }

    // 更新缓存
    this.nodesCache.set(id, newNode)
    this.healthResults.set(id, health)

    return newNode
  }

  /**
   * 检查节点健康状态
   */
  async checkNodeHealth(url: string): Promise<NodeHealthCheck> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${url}/api/cloud/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
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
   * 获取所有节点（从数据库读取）
   */
  async getAllNodes(): Promise<VolunteerNode[]> {
    try {
      const dbNodes = await db.volunteerNode.findMany({
        orderBy: { registeredAt: 'desc' },
      })

      return dbNodes.map(n => ({
        id: n.id,
        name: n.name,
        url: n.url,
        description: n.description || undefined,
        providedBy: n.providedBy,
        contactInfo: n.contactInfo || undefined,
        nodeType: n.nodeType as VolunteerNode['nodeType'],
        status: n.status as VolunteerNode['status'],
        lastHeartbeat: n.lastHeartbeat ? new Date(n.lastHeartbeat).getTime() : null,
        uptime: n.uptime,
        region: n.region || undefined,
        capabilities: n.capabilities ? JSON.parse(n.capabilities) : [],
        registeredAt: new Date(n.registeredAt).getTime(),
      }))
    } catch {
      // 数据库查询失败，返回缓存
      return Array.from(this.nodesCache.values())
    }
  }

  /**
   * 获取所有活跃节点
   */
  async getActiveNodes(): Promise<VolunteerNode[]> {
    const allNodes = await this.getAllNodes()
    return allNodes.filter(n => n.status === 'active')
  }

  /**
   * 获取最优节点 — 响应最快、负载最低
   */
  async getBestNode(): Promise<VolunteerNode | null> {
    const activeNodes = await this.getActiveNodes()
    if (activeNodes.length === 0) return null

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
   * 移除节点
   */
  async removeNode(nodeId: string): Promise<boolean> {
    try {
      await db.volunteerNode.delete({ where: { id: nodeId } })
      this.nodesCache.delete(nodeId)
      this.healthResults.delete(nodeId)
      return true
    } catch {
      return false
    }
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
    const nodes = await this.getAllNodes()

    for (const node of nodes) {
      const health = await this.checkNodeHealth(node.url)
      health.nodeId = node.id
      this.healthResults.set(node.id, health)

      // 更新数据库状态
      const newStatus = health.online ? 'active' : 'offline'
      if (node.status !== newStatus) {
        try {
          await db.volunteerNode.update({
            where: { id: node.id },
            data: {
              status: newStatus,
              lastHeartbeat: health.online ? new Date() : undefined,
            },
          })
        } catch {
          // 更新失败不影响健康检查
        }
      }
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopHealthCheck()
    this.healthResults.clear()
    this.nodesCache.clear()
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
