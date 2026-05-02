/**
 * 突触接收器 - 负责接收来自其他应用的信号
 */

interface SynapseReceiverStats {
  totalReceived: number
  successfulProcessed: number
  failedProcessed: number
  averageProcessingTime: number
}

interface SignalBuffer {
  appId: string
  channel: string
  signals: BufferedSignal[]
  maxSize: number
  processing: boolean
}

interface BufferedSignal extends SynapseSignal {
  receivedAt: Date
  processingAttempts: number
}

interface SignalHandler {
  appId: string
  channel: string
  handler: (signal: SynapseSignal) => Promise<SynapseResponse>
  priority: number
  enabled: boolean
}

export class SynapseReceiver {
  private stats: SynapseReceiverStats
  private buffers: Map<string, SignalBuffer>
  private handlers: Map<string, SignalHandler[]>
  private processors: Map<string, NodeJS.Timeout>

  constructor() {
    this.stats = {
      totalReceived: 0,
      successfulProcessed: 0,
      failedProcessed: 0,
      averageProcessingTime: 0
    }
    this.buffers = new Map()
    this.handlers = new Map()
    this.processors = new Map()
  }

  /**
   * 监听信号
   */
  async listen(appId: string, channel: string): Promise<SynapseSignal | null> {
    const bufferKey = this.getBufferKey(appId, channel)
    let buffer = this.buffers.get(bufferKey)

    if (!buffer) {
      buffer = this.createBuffer(appId, channel)
      this.buffers.set(bufferKey, buffer)
    }

    // 从缓冲区获取信号
    const signal = buffer.signals.shift()
    
    if (signal) {
      this.stats.totalReceived++
      return signal
    }

    return null
  }

  /**
   * 接收信号（由传输器调用）
   */
  async receive(signal: SynapseSignal): Promise<SynapseResponse> {
    this.stats.totalReceived++
    const startTime = Date.now()

    try {
      // 验证信号
      const validation = this.validateSignal(signal)
      if (!validation.valid) {
        throw new Error(validation.reason)
      }

      // 获取处理器
      const handler = this.getHandler(signal.target, signal.type)
      if (!handler) {
        throw new Error(`No handler found for signal type: ${signal.type}`)
      }

      // 处理信号
      const response = await handler.handler(signal)
      
      const processingTime = Date.now() - startTime
      this.updateAverageProcessingTime(processingTime)
      this.stats.successfulProcessed++

      return response
    } catch (error) {
      this.stats.failedProcessed++
      
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
   * 注册信号处理器
   */
  registerHandler(handler: SignalHandler): void {
    const key = this.getHandlerKey(handler.appId, handler.channel)
    const handlers = this.handlers.get(key) || []
    
    // 按优先级排序
    handlers.push(handler)
    handlers.sort((a, b) => b.priority - a.priority)
    
    this.handlers.set(key, handlers)
  }

  /**
   * 移除信号处理器
   */
  removeHandler(appId: string, channel: string, handlerId?: string): void {
    const key = this.getHandlerKey(appId, channel)
    const handlers = this.handlers.get(key)
    
    if (!handlers) {
      return
    }

    if (handlerId) {
      const index = handlers.findIndex(h => h.handler.toString() === handlerId)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      handlers.length = 0
    }

    if (handlers.length === 0) {
      this.handlers.delete(key)
    }
  }

  /**
   * 创建缓冲区
   */
  private createBuffer(appId: string, channel: string): SignalBuffer {
    const buffer: SignalBuffer = {
      appId,
      channel,
      signals: [],
      maxSize: 1000,
      processing: false
    }

    // 启动缓冲区处理器
    this.startBufferProcessor(buffer)

    return buffer
  }

  /**
   * 启动缓冲区处理器
   */
  private startBufferProcessor(buffer: SignalBuffer): void {
    const bufferKey = this.getBufferKey(buffer.appId, buffer.channel)
    
    if (this.processors.has(bufferKey)) {
      return
    }

    const processor = setInterval(() => {
      this.processBuffer(buffer)
    }, 50) // 每50ms处理一次

    this.processors.set(bufferKey, processor)
  }

  /**
   * 处理缓冲区
   */
  private async processBuffer(buffer: SignalBuffer): Promise<void> {
    if (buffer.processing || buffer.signals.length === 0) {
      return
    }

    buffer.processing = true

    try {
      const signalsToProcess = buffer.signals.splice(0, 10) // 每次处理10个信号
      
      for (const signal of signalsToProcess) {
        try {
          await this.processBufferedSignal(signal)
        } catch (error) {
          signal.processingAttempts++
          
          // 如果重试次数过多，丢弃信号
          if (signal.processingAttempts >= 3) {
            console.error(`Signal ${signal.id} failed after 3 attempts, discarding`)
          } else {
            // 重新加入队列
            buffer.signals.push(signal)
          }
        }
      }
    } finally {
      buffer.processing = false
    }
  }

  /**
   * 处理缓冲的信号
   */
  private async processBufferedSignal(signal: BufferedSignal): Promise<void> {
    const response = await this.receive(signal)
    
    // 发送响应（如果需要）
    if (signal.metadata.correlationId) {
      await this.sendResponse(signal, response)
    }
  }

  /**
   * 验证信号
   */
  private validateSignal(signal: SynapseSignal): { valid: boolean; reason?: string } {
    // 检查必要字段
    if (!signal.id || !signal.type || !signal.source || !signal.target) {
      return { valid: false, reason: 'Missing required fields' }
    }

    // 检查时间戳
    if (!signal.metadata.timestamp) {
      return { valid: false, reason: 'Missing timestamp' }
    }

    // 检查TTL
    if (signal.metadata.ttl) {
      const now = new Date()
      const signalAge = now.getTime() - signal.metadata.timestamp.getTime()
      if (signalAge > signal.metadata.ttl) {
        return { valid: false, reason: 'Signal expired' }
      }
    }

    return { valid: true }
  }

  /**
   * 获取处理器
   */
  private getHandler(appId: string, signalType: string): SignalHandler | null {
    const key = this.getHandlerKey(appId, signalType)
    const handlers = this.handlers.get(key) || []
    
    // 返回第一个启用的处理器
    return handlers.find(h => h.enabled) || null
  }

  /**
   * 发送响应
   */
  private async sendResponse(signal: SynapseSignal, response: SynapseResponse): Promise<void> {
    try {
      // 这里应该通过突触系统发送响应
      console.log(`Sending response for signal ${signal.id}:`, response)
    } catch (error) {
      console.error('Failed to send response:', error)
    }
  }

  /**
   * 获取缓冲区键
   */
  private getBufferKey(appId: string, channel: string): string {
    return `${appId}:${channel}`
  }

  /**
   * 获取处理器键
   */
  private getHandlerKey(appId: string, channel: string): string {
    return `${appId}:${channel}`
  }

  /**
   * 更新平均处理时间
   */
  private updateAverageProcessingTime(processingTime: number): void {
    const total = this.stats.successfulProcessed + this.stats.failedProcessed
    const current = this.stats.averageProcessingTime
    
    this.stats.averageProcessingTime = (current * (total - 1) + processingTime) / total
  }

  /**
   * 生成响应ID
   */
  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 清理过期缓冲区
   */
  cleanupExpiredBuffers(): void {
    const now = new Date()
    const expireTime = 5 * 60 * 1000 // 5分钟

    for (const [key, buffer] of this.buffers) {
      // 清理过期信号
      buffer.signals = buffer.signals.filter(signal => {
        const age = now.getTime() - signal.receivedAt.getTime()
        return age < expireTime
      })

      // 如果缓冲区为空且没有处理器，清理缓冲区
      if (buffer.signals.length === 0 && !buffer.processing) {
        const processor = this.processors.get(key)
        if (processor) {
          clearInterval(processor)
          this.processors.delete(key)
        }
        this.buffers.delete(key)
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): SynapseReceiverStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.totalReceived = 0
    this.stats.successfulProcessed = 0
    this.stats.failedProcessed = 0
    this.stats.averageProcessingTime = 0
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