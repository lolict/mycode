/**
 * 神经突触中转器容器
 * 应用间通信的器官服务层
 */

import { SynapseBoundary } from './boundary'
import { SynapseTransmitter } from './transmitter'
import { SynapseReceiver } from './receiver'
import { SynapseRouter } from './router'

export class SynapseContainer {
  private static instance: SynapseContainer
  private boundary: SynapseBoundary
  private transmitter: SynapseTransmitter
  public receiver: SynapseReceiver
  private router: SynapseRouter

  private constructor() {
    this.boundary = new SynapseBoundary()
    this.transmitter = new SynapseTransmitter()
    this.receiver = new SynapseReceiver()
    this.router = new SynapseRouter()
  }

  static getInstance(): SynapseContainer {
    if (!SynapseContainer.instance) {
      SynapseContainer.instance = new SynapseContainer()
    }
    return SynapseContainer.instance
  }

  /**
   * 创建应用间连接
   */
  connect(
    fromApp: string,
    toApp: string,
    protocol: SynapseProtocol
  ): SynapseConnection {
    return this.boundary.createConnection(fromApp, toApp, protocol)
  }

  /**
   * 传输信号
   */
  async transmit(
    connection: SynapseConnection,
    signal: SynapseSignal
  ): Promise<SynapseResponse> {
    return this.transmitter.send(connection, signal)
  }

  /**
   * 接收信号
   */
  async receive(
    appId: string,
    channel: string
  ): Promise<SynapseSignal | null> {
    return this.receiver.listen(appId, channel)
  }

  /**
   * 路由信号到目标应用
   */
  async route(signal: SynapseSignal): Promise<SynapseResponse[]> {
    return this.router.route(signal)
  }

  /**
   * 获取突触统计
   */
  getStats() {
    return {
      boundary: this.boundary.getStats(),
      transmitter: this.transmitter.getStats(),
      receiver: this.receiver.getStats(),
      router: this.router.getStats()
    }
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

interface SynapseResponse {
  id: string
  signalId: string
  status: 'success' | 'error' | 'timeout'
  payload?: any
  error?: string
  timestamp: Date
}