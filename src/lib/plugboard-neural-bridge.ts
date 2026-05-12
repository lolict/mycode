/**
 * 插板-神经联动引擎 (PlugBoard Neural Bridge)
 *
 * 让插板型号架构与活体神经系统真正连通运行：
 * - 插头插入插槽 → 神经信号 plug:connected
 * - 插头拔出插槽 → 神经信号 plug:disconnected
 * - 插头值变化   → 神经信号 plug:updated
 * - 插槽查询     → 神经信号 socket:query
 * - 兼容检查     → 神经信号 compatibility:checked
 * - 神经节点激活 → 驱动插板连接创建/断开
 *
 * 这就是"方便神经网络的全能应用"的核心实现：
 * 神经网络不是被动接收数据，而是主动驱动插板系统的运转。
 */

import { getNervousSystem, type NeuralSignal } from '@/core/v2/nervous'

// ============================================
// 信号频道定义
// ============================================

export const PLUGBOARD_CHANNELS = {
  // 插板事件
  PLUG_CONNECTED:    'plug:connected',
  PLUG_DISCONNECTED: 'plug:disconnected',
  PLUG_UPDATED:      'plug:updated',
  SOCKET_QUERY:      'socket:query',
  SOCKET_FILLED:     'socket:filled',
  SOCKET_EMPTIED:    'socket:emptied',

  // 兼容性事件
  COMPAT_CHECKED:    'compatibility:checked',
  COMPAT_PASSED:     'compatibility:passed',
  COMPAT_FAILED:     'compatibility:failed',

  // 神经节点事件
  NEURAL_ACTIVATED:  'neural:activated',
  NEURAL_DEACTIVATED:'neural:deactivated',
  NEURAL_SIGNAL_PASS:'neural:signal-pass',

  // 系统事件
  BOARD_INITIALIZED: 'board:initialized',
  BOARD_SYNCED:      'board:synced',
} as const

// ============================================
// 插板信号载荷类型
// ============================================

export interface PlugConnectedPayload {
  plugCode: string
  plugType: string
  socketCode: string
  socketType: string
  connectionId: string
  compatible: boolean
  warnings?: string[]
}

export interface PlugUpdatedPayload {
  plugCode: string
  plugType: string
  field: string
  oldValue: unknown
  newValue: unknown
}

export interface NeuralActivatedPayload {
  nodeCode: string
  nodeType: string
  layer: number
  activatedBy: string
  threshold: number
  inputValue: number
}

export interface CompatCheckedPayload {
  plugCode: string
  socketCode: string
  compatible: boolean
  errors: string[]
  warnings: string[]
  isDirectMatch: boolean
  priority: number
}

// ============================================
// 插板-神经联动引擎
// ============================================

class PlugBoardNeuralBridge {
  private nervous = getNervousSystem()
  private plugValues: Map<string, Record<string, unknown>> = new Map()
  private socketStates: Map<string, { filled: boolean; connectedPlugs: string[] }> = new Map()
  private neuralStates: Map<string, { active: boolean; lastActivation: number; fireCount: number }> = new Map()
  private initialized = false

  /**
   * 初始化联动引擎 — 将插板系统接入神经系统
   */
  init(): void {
    if (this.initialized) return

    // 将联动引擎自身作为神经插头接入
    this.nervous.plugIn({
      id: 'plugboard-bridge',
      name: '插板-神经联动引擎',
      type: 'organ',
      channels: [
        PLUGBOARD_CHANNELS.PLUG_CONNECTED,
        PLUGBOARD_CHANNELS.PLUG_DISCONNECTED,
        PLUGBOARD_CHANNELS.PLUG_UPDATED,
        PLUGBOARD_CHANNELS.NEURAL_ACTIVATED,
        PLUGBOARD_CHANNELS.COMPAT_CHECKED,
        // 也监听活体系统的信号
        'action:donate',
        'action:create',
        'action:help',
        'action:share',
        'action:volunteer',
        'action:complete',
        'dopamine:released',
        'moral:score-updated',
      ],
      onSignal: (signal) => this.handleSignal(signal),
      status: 'active',
    })

    // 广播初始化完成
    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.BOARD_INITIALIZED,
      from: 'plugboard-bridge',
      payload: { timestamp: Date.now(), version: '1.0.0' },
      priority: 8,
    })

    this.initialized = true
  }

  /**
   * 处理接收到的神经信号
   */
  private handleSignal(signal: NeuralSignal): void {
    switch (signal.channel) {
      // 活体系统的行为信号 → 可能触发插板变化
      case 'action:complete':
        this.onActionComplete(signal.payload)
        break
      case 'moral:score-updated':
        this.onMoralScoreUpdated(signal.payload)
        break
      case 'dopamine:released':
        this.onDopamineReleased(signal.payload)
        break

      // 插板内部信号 → 驱动神经节点
      case PLUGBOARD_CHANNELS.PLUG_CONNECTED:
        this.onPlugConnected(signal.payload)
        break
      case PLUGBOARD_CHANNELS.PLUG_DISCONNECTED:
        this.onPlugDisconnected(signal.payload)
        break
      case PLUGBOARD_CHANNELS.PLUG_UPDATED:
        this.onPlugUpdated(signal.payload)
        break
      case PLUGBOARD_CHANNELS.NEURAL_ACTIVATED:
        this.onNeuralActivated(signal.payload)
        break
    }
  }

  // ============================================
  // 主动发射：插板事件 → 神经信号
  // ============================================

  /**
   * 通知：插头已连接到插槽
   */
  notifyPlugConnected(payload: PlugConnectedPayload): void {
    // 更新插槽状态
    const socketState = this.socketStates.get(payload.socketCode) || { filled: false, connectedPlugs: [] }
    socketState.connectedPlugs.push(payload.plugCode)
    socketState.filled = true
    this.socketStates.set(payload.socketCode, socketState)

    // 初始化插头值
    this.plugValues.set(payload.plugCode, {})

    // 发射神经信号
    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.PLUG_CONNECTED,
      from: 'plugboard-bridge',
      payload,
      priority: 6,
    })

    // 检查是否需要激活神经节点
    this.checkNeuralActivation(payload.plugCode, payload.socketCode)
  }

  /**
   * 通知：插头已断开
   */
  notifyPlugDisconnected(plugCode: string, socketCode: string): void {
    // 更新插槽状态
    const socketState = this.socketStates.get(socketCode)
    if (socketState) {
      socketState.connectedPlugs = socketState.connectedPlugs.filter(p => p !== plugCode)
      socketState.filled = socketState.connectedPlugs.length > 0
    }

    // 清理插头值
    this.plugValues.delete(plugCode)

    // 发射神经信号
    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.PLUG_DISCONNECTED,
      from: 'plugboard-bridge',
      payload: { plugCode, socketCode, timestamp: Date.now() },
      priority: 6,
    })
  }

  /**
   * 通知：插头值变化
   */
  notifyPlugUpdated(payload: PlugUpdatedPayload): void {
    // 更新存储的值
    const values = this.plugValues.get(payload.plugCode) || {}
    values[payload.field] = payload.newValue
    this.plugValues.set(payload.plugCode, values)

    // 发射神经信号
    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.PLUG_UPDATED,
      from: 'plugboard-bridge',
      payload,
      priority: 4,
    })
  }

  /**
   * 通知：兼容性检查完成
   */
  notifyCompatChecked(payload: CompatCheckedPayload): void {
    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.COMPAT_CHECKED,
      from: 'plugboard-bridge',
      payload,
      priority: 5,
    })

    // 根据结果发射更具体的信号
    this.nervous.emit({
      channel: payload.compatible
        ? PLUGBOARD_CHANNELS.COMPAT_PASSED
        : PLUGBOARD_CHANNELS.COMPAT_FAILED,
      from: 'plugboard-bridge',
      payload,
      priority: 5,
    })
  }

  // ============================================
  // 响应处理：神经信号 → 插板行为
  // ============================================

  /**
   * 善行完成 → 可能激活行为插头/更新词汇插头
   */
  private onActionComplete(payload: any): void {
    // 更新"善行"词汇插头的值
    this.notifyPlugUpdated({
      plugCode: 'vocab_good_deed',
      plugType: 'vocab',
      field: 'value',
      oldValue: payload.previousValue,
      newValue: payload.actionName || '善行',
    })
  }

  /**
   * 道德评分更新 → 可能触发UI插头重渲染
   */
  private onMoralScoreUpdated(payload: any): void {
    // 通知UI插槽需要更新显示
    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.PLUG_UPDATED,
      from: 'plugboard-bridge',
      payload: {
        plugCode: 'ui_five_dim_radar',
        plugType: 'ui',
        field: 'props.scores',
        oldValue: payload.oldScores,
        newValue: payload.newScores,
      },
      priority: 5,
    })
  }

  /**
   * 多巴胺释放 → 激活神经节点
   */
  private onDopamineReleased(payload: any): void {
    const nodeCode = 'neural_relay'
    const state = this.neuralStates.get(nodeCode) || { active: false, lastActivation: 0, fireCount: 0 }

    state.active = true
    state.lastActivation = Date.now()
    state.fireCount++
    this.neuralStates.set(nodeCode, state)

    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.NEURAL_ACTIVATED,
      from: 'plugboard-bridge',
      payload: {
        nodeCode,
        nodeType: 'relay',
        layer: 1,
        activatedBy: 'dopamine',
        threshold: 0.5,
        inputValue: payload.amount || 1.0,
      } as NeuralActivatedPayload,
      priority: 7,
    })
  }

  /**
   * 插头连接 → 检查并激活神经节点
   */
  private onPlugConnected(payload: PlugConnectedPayload): void {
    // 如果是信号插头连接到信号插槽，激活对应的神经节点
    if (payload.plugType === 'signal' && payload.compatible) {
      this.activateNeuralNode('neural_relay', payload.plugCode)
    }
  }

  /**
   * 插头断开 → 检查并可能停用神经节点
   */
  private onPlugDisconnected(payload: any): void {
    // 检查相关的神经节点是否还有连接
    const relayState = this.neuralStates.get('neural_relay')
    if (relayState && relayState.fireCount > 0) {
      relayState.fireCount--
      if (relayState.fireCount === 0) {
        relayState.active = false
        this.nervous.emit({
          channel: PLUGBOARD_CHANNELS.NEURAL_DEACTIVATED,
          from: 'plugboard-bridge',
          payload: { nodeCode: 'neural_relay', reason: 'no more connections' },
          priority: 5,
        })
      }
    }
  }

  /**
   * 插头值更新 → 信号通过神经节点传递
   */
  private onPlugUpdated(payload: PlugUpdatedPayload): void {
    // 词汇插头更新 → 信号通过中继节点传递
    if (payload.plugType === 'vocab') {
      this.passThroughNeural('neural_relay', payload)
    }
  }

  /**
   * 神经节点激活 → 可能驱动其他插板操作
   */
  private onNeuralActivated(payload: NeuralActivatedPayload): void {
    // 执行器节点激活 → 可以触发行为插头
    if (payload.nodeType === 'actuator') {
      this.nervous.emit({
        channel: PLUGBOARD_CHANNELS.NEURAL_SIGNAL_PASS,
        from: 'plugboard-bridge',
        payload: {
          fromNode: payload.activatedBy,
          toNode: payload.nodeCode,
          signalStrength: payload.inputValue / payload.threshold,
          timestamp: Date.now(),
        },
        priority: 6,
      })
    }
  }

  // ============================================
  // 神经节点管理
  // ============================================

  private checkNeuralActivation(plugCode: string, socketCode: string): void {
    // 检查连接是否需要激活神经节点
    const isSignalConnection = plugCode.includes('signal') || socketCode.includes('signal')
    if (isSignalConnection) {
      this.activateNeuralNode('neural_relay', plugCode)
    }
  }

  private activateNeuralNode(nodeCode: string, activatedBy: string): void {
    const state = this.neuralStates.get(nodeCode) || { active: false, lastActivation: 0, fireCount: 0 }
    const wasActive = state.active

    state.active = true
    state.lastActivation = Date.now()
    state.fireCount++
    this.neuralStates.set(nodeCode, state)

    if (!wasActive) {
      this.nervous.emit({
        channel: PLUGBOARD_CHANNELS.NEURAL_ACTIVATED,
        from: 'plugboard-bridge',
        payload: {
          nodeCode,
          nodeType: nodeCode.includes('relay') ? 'relay' : nodeCode.includes('sensor') ? 'sensor' : 'actuator',
          layer: 1,
          activatedBy,
          threshold: 0.5,
          inputValue: 1.0,
        } as NeuralActivatedPayload,
        priority: 7,
      })
    }
  }

  private passThroughNeural(nodeCode: string, payload: any): void {
    const state = this.neuralStates.get(nodeCode)
    if (!state?.active) return

    this.nervous.emit({
      channel: PLUGBOARD_CHANNELS.NEURAL_SIGNAL_PASS,
      from: 'plugboard-bridge',
      payload: {
        nodeCode,
        inputPayload: payload,
        passthrough: true,
        timestamp: Date.now(),
      },
      priority: 4,
    })
  }

  // ============================================
  // 查询接口
  // ============================================

  /**
   * 获取联动引擎状态
   */
  getStatus() {
    return {
      initialized: this.initialized,
      plugCount: this.plugValues.size,
      socketCount: this.socketStates.size,
      neuralNodes: Array.from(this.neuralStates.entries()).map(([code, state]) => ({
        code,
        ...state,
      })),
      filledSockets: Array.from(this.socketStates.entries())
        .filter(([, state]) => state.filled)
        .map(([code]) => code),
      nervousStatus: this.nervous.getStatus(),
    }
  }

  /**
   * 获取插头当前值
   */
  getPlugValue(plugCode: string): Record<string, unknown> | undefined {
    return this.plugValues.get(plugCode)
  }

  /**
   * 获取插槽当前状态
   */
  getSocketState(socketCode: string): { filled: boolean; connectedPlugs: string[] } | undefined {
    return this.socketStates.get(socketCode)
  }

  /**
   * 获取神经节点状态
   */
  getNeuralState(nodeCode: string): { active: boolean; lastActivation: number; fireCount: number } | undefined {
    return this.neuralStates.get(nodeCode)
  }

  /**
   * 获取信号历史
   */
  getSignalHistory() {
    return this.nervous.getStatus().recentSignals
  }
}

// ============================================
// 全局单例
// ============================================

let bridgeInstance: PlugBoardNeuralBridge | null = null

export function getPlugBoardNeuralBridge(): PlugBoardNeuralBridge {
  if (!bridgeInstance) {
    bridgeInstance = new PlugBoardNeuralBridge()
  }
  return bridgeInstance
}

// ============================================
// React Hook — 组件中使用插板-神经联动
// ============================================

export function usePlugBoardNeural() {
  const bridge = getPlugBoardNeuralBridge()

  return {
    /** 初始化联动引擎 */
    init: () => bridge.init(),
    /** 通知插头连接 */
    notifyPlugConnected: (payload: PlugConnectedPayload) => bridge.notifyPlugConnected(payload),
    /** 通知插头断开 */
    notifyPlugDisconnected: (plugCode: string, socketCode: string) => bridge.notifyPlugDisconnected(plugCode, socketCode),
    /** 通知插头值更新 */
    notifyPlugUpdated: (payload: PlugUpdatedPayload) => bridge.notifyPlugUpdated(payload),
    /** 通知兼容性检查完成 */
    notifyCompatChecked: (payload: CompatCheckedPayload) => bridge.notifyCompatChecked(payload),
    /** 获取引擎状态 */
    getStatus: () => bridge.getStatus(),
    /** 获取插头值 */
    getPlugValue: (plugCode: string) => bridge.getPlugValue(plugCode),
    /** 获取插槽状态 */
    getSocketState: (socketCode: string) => bridge.getSocketState(socketCode),
    /** 获取神经节点状态 */
    getNeuralState: (nodeCode: string) => bridge.getNeuralState(nodeCode),
    /** 获取信号历史 */
    getSignalHistory: () => bridge.getSignalHistory(),
  }
}
