/**
 * 神经系统 - Nervous System
 *
 * 像家里的电线一样：拉到哪里都能用，插上插头就通电。
 * 所有模块通过标准接口（插头）接入，不需要知道电线怎么走的。
 *
 * 通信层级：
 * - Event Bus（组件间，同页面内）     = 房间内插座
 * - PostMessage Bridge（iframe间）    = 墙内电线
 * - API Channel（前后端间）           = 进户总电闸
 * - WebRTC Channel（设备间，未来）    = 邻居家拉线
 */

// ============================================
// 标准"插头"接口 - 任何模块只要实现这个就能接入
// ============================================

export interface NeuralPlug {
  /** 模块ID，唯一标识 */
  id: string
  /** 模块名称 */
  name: string
  /** 模块类型 */
  type: 'organ' | 'app' | 'widget' | 'service' | 'bridge'
  /** 能接收的信号频道 */
  channels: string[]
  /** 收到信号时的处理函数 */
  onSignal: SignalHandler
  /** 模块状态 */
  status: 'active' | 'sleeping' | 'dead'
}

export type SignalHandler = (signal: NeuralSignal) => void | Promise<NeuralSignal | void>

export interface NeuralSignal {
  /** 信号ID */
  id: string
  /** 频道名 */
  channel: string
  /** 发送者ID */
  from: string
  /** 目标（空=广播） */
  to?: string
  /** 信号内容 */
  payload: any
  /** 优先级 1-10，10最高 */
  priority: number
  /** 时间戳 */
  timestamp: number
}

// ============================================
// 神经中枢 - 管理所有信号路由
// ============================================

class NervousCenter {
  private plugs: Map<string, NeuralPlug> = new Map()
  private channelSubscribers: Map<string, Set<string>> = new Map()
  private signalHistory: NeuralSignal[] = []
  private maxHistory = 200

  /**
   * 插上插头 — 模块接入神经系统
   * 就像把电器插头插进插座，通电即可用
   */
  plugIn(plug: NeuralPlug): () => void {
    this.plugs.set(plug.id, plug)

    // 订阅频道
    for (const channel of plug.channels) {
      if (!this.channelSubscribers.has(channel)) {
        this.channelSubscribers.set(channel, new Set())
      }
      this.channelSubscribers.get(channel)!.add(plug.id)
    }

    // 通知其他模块有新成员加入
    this.broadcast({
      channel: 'system:plug-in',
      from: 'nervous-system',
      payload: { plugId: plug.id, plugName: plug.name, plugType: plug.type },
      priority: 1,
    })

    // 返回拔插头函数
    return () => this.unplug(plug.id)
  }

  /**
   * 拔掉插头 — 模块离开神经系统
   */
  unplug(plugId: string): void {
    const plug = this.plugs.get(plugId)
    if (!plug) return

    // 取消频道订阅
    for (const channel of plug.channels) {
      this.channelSubscribers.get(channel)?.delete(plugId)
    }

    this.plugs.delete(plugId)

    this.broadcast({
      channel: 'system:unplug',
      from: 'nervous-system',
      payload: { plugId },
      priority: 1,
    })
  }

  /**
   * 发射信号 — 向特定频道发送信号
   * 信号会路由到所有订阅了该频道的模块
   */
  emit(signal: Omit<NeuralSignal, 'id' | 'timestamp'>): void {
    const fullSignal: NeuralSignal = {
      ...signal,
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    }

    this.recordSignal(fullSignal)

    // 定向发送
    if (fullSignal.to) {
      const target = this.plugs.get(fullSignal.to)
      if (target && target.status === 'active') {
        this.deliverSignal(target, fullSignal)
      }
      return
    }

    // 广播到频道订阅者
    const subscribers = this.channelSubscribers.get(fullSignal.channel)
    if (!subscribers) return

    for (const plugId of subscribers) {
      if (plugId === fullSignal.from) continue // 不发给自己
      const plug = this.plugs.get(plugId)
      if (plug && plug.status === 'active') {
        this.deliverSignal(plug, fullSignal)
      }
    }
  }

  /**
   * 广播 — 向所有活跃模块发送信号
   */
  broadcast(signal: Omit<NeuralSignal, 'id' | 'timestamp' | 'to'>): void {
    const fullSignal: NeuralSignal = {
      ...signal,
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    }

    this.recordSignal(fullSignal)

    for (const [plugId, plug] of this.plugs) {
      if (plugId === fullSignal.from || plug.status !== 'active') continue
      this.deliverSignal(plug, fullSignal)
    }
  }

  /**
   * 投递信号到具体模块
   */
  private deliverSignal(plug: NeuralPlug, signal: NeuralSignal): void {
    try {
      const result = plug.onSignal(signal)
      // 如果返回了响应信号，继续传递
      if (result instanceof Promise) {
        result.then((response) => {
          if (response && typeof response === 'object' && 'channel' in (response as object)) {
            this.emit(response as NeuralSignal)
          }
        }).catch(() => {
          // 信号传递失败，记录但不崩溃
        })
      } else if (result !== undefined && result !== null && typeof result === 'object' && 'channel' in (result as object)) {
        this.emit(result as NeuralSignal)
      }
    } catch {
      // 单个模块处理失败不影响其他模块
    }
  }

  /**
   * 记录信号历史（用于调试和回放）
   */
  private recordSignal(signal: NeuralSignal): void {
    this.signalHistory.push(signal)
    if (this.signalHistory.length > this.maxHistory) {
      this.signalHistory.shift()
    }
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      activePlugs: Array.from(this.plugs.values())
        .filter(p => p.status === 'active')
        .map(p => ({ id: p.id, name: p.name, type: p.type, channels: p.channels })),
      totalPlugs: this.plugs.size,
      channels: Array.from(this.channelSubscribers.keys()),
      recentSignals: this.signalHistory.slice(-20),
    }
  }

  /**
   * 获取指定模块
   */
  getPlug(plugId: string): NeuralPlug | undefined {
    return this.plugs.get(plugId)
  }

  /**
   * 更新模块状态
   */
  setPlugStatus(plugId: string, status: NeuralPlug['status']): void {
    const plug = this.plugs.get(plugId)
    if (plug) plug.status = status
  }
}

// ============================================
// 全局单例 — 整个应用共用一个神经中枢
// ============================================

let instance: NervousCenter | null = null

export function getNervousSystem(): NervousCenter {
  if (!instance) {
    instance = new NervousCenter()
  }
  return instance
}

export { NervousCenter }
