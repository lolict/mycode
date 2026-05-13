import { NextResponse } from 'next/server'
import { plugBoardRegistry, PRESET_NEURAL_NODES } from '@/lib/plugboard'
import { COMPATIBLE_RULES, DEFAULT_PLUGS, DEFAULT_SOCKETS, DEFAULT_CONNECTIONS } from '@/lib/plug-socket-registry'

// 神经网络信号模拟器 — 管理信号在插板系统中的流动

interface SignalTrace {
  id: string
  timestamp: number
  channel: string
  from: string
  to?: string
  payload: any
  path: string[]  // 信号经过的节点路径
  status: 'transit' | 'delivered' | 'failed' | 'blocked'
  latency: number  // 模拟延迟(ms)
}

interface NeuralTopology {
  nodes: Array<{
    id: string
    name: string
    type: string
    x: number
    y: number
    activation: number  // 0-1 当前激活度
    lastFired: number | null
  }>
  edges: Array<{
    from: string
    to: string
    channel: string
    weight: number
    active: boolean
  }>
}

// 生成神经拓扑
function buildNeuralTopology(): NeuralTopology {
  const nodes = [
    // 核心中继
    { id: 'nervous-center', name: '神经中枢', type: 'relay', x: 400, y: 100, activation: 1.0, lastFired: Date.now() },
    // 传感器节点
    { id: 'sensor-moral', name: '道德行为传感器', type: 'sensor', x: 150, y: 250, activation: 0, lastFired: null },
    { id: 'sensor-system', name: '系统事件传感器', type: 'sensor', x: 650, y: 250, activation: 0, lastFired: null },
    // 处理器节点
    { id: 'processor-dopamine', name: '多巴胺处理器', type: 'processor', x: 300, y: 400, activation: 0, lastFired: null },
    { id: 'processor-equity', name: '股权处理器', type: 'processor', x: 500, y: 400, activation: 0, lastFired: null },
    // 执行器节点
    { id: 'actuator-notify', name: '通知执行器', type: 'actuator', x: 200, y: 550, activation: 0, lastFired: null },
    { id: 'actuator-update', name: '更新执行器', type: 'actuator', x: 400, y: 550, activation: 0, lastFired: null },
    { id: 'actuator-reward', name: '奖赏执行器', type: 'actuator', x: 600, y: 550, activation: 0, lastFired: null },
    // 插板接口节点
    { id: 'plugboard-in', name: '插板输入接口', type: 'gateway', x: 50, y: 100, activation: 0, lastFired: null },
    { id: 'plugboard-out', name: '插板输出接口', type: 'gateway', x: 750, y: 100, activation: 0, lastFired: null },
  ]

  const edges = [
    // 输入 → 中枢
    { from: 'plugboard-in', to: 'nervous-center', channel: 'plug:connected', weight: 1.0, active: true },
    { from: 'plugboard-in', to: 'nervous-center', channel: 'plug:updated', weight: 0.8, active: true },
    // 中枢 → 传感器
    { from: 'nervous-center', to: 'sensor-moral', channel: 'action:*', weight: 1.0, active: true },
    { from: 'nervous-center', to: 'sensor-system', channel: 'system:*', weight: 0.6, active: true },
    // 传感器 → 处理器
    { from: 'sensor-moral', to: 'processor-dopamine', channel: 'dopamine:trigger', weight: 1.0, active: true },
    { from: 'sensor-moral', to: 'processor-equity', channel: 'equity:update', weight: 0.8, active: true },
    { from: 'sensor-system', to: 'processor-equity', channel: 'equity:recalculate', weight: 0.5, active: true },
    // 处理器 → 执行器
    { from: 'processor-dopamine', to: 'actuator-notify', channel: 'notify:dopamine', weight: 0.9, active: true },
    { from: 'processor-dopamine', to: 'actuator-reward', channel: 'reward:release', weight: 1.0, active: true },
    { from: 'processor-equity', to: 'actuator-update', channel: 'update:equity', weight: 1.0, active: true },
    { from: 'processor-equity', to: 'actuator-notify', channel: 'notify:level-up', weight: 0.7, active: true },
    // 执行器 → 输出
    { from: 'actuator-notify', to: 'plugboard-out', channel: 'output:notify', weight: 1.0, active: true },
    { from: 'actuator-update', to: 'plugboard-out', channel: 'output:state', weight: 1.0, active: true },
    { from: 'actuator-reward', to: 'plugboard-out', channel: 'output:reward', weight: 1.0, active: true },
  ]

  return { nodes, edges }
}

// 模拟信号传递路径
function traceSignal(channel: string, from: string): SignalTrace {
  const topology = buildNeuralTopology()

  // 根据信号频道找到匹配的边
  const matchedEdges = topology.edges.filter(e => {
    if (e.channel === channel) return true
    if (e.channel.endsWith('*') && channel.startsWith(e.channel.slice(0, -1))) return true
    return false
  })

  // 构建传递路径
  const path = [from]
  let currentNode = from
  const visited = new Set<string>([from])

  for (const edge of matchedEdges) {
    if (edge.from === currentNode && !visited.has(edge.to)) {
      path.push(edge.to)
      visited.add(edge.to)
      currentNode = edge.to
    }
  }

  // 如果没有匹配的路径，走默认路由
  if (path.length <= 1) {
    path.push('nervous-center')
    const outEdge = topology.edges.find(e => e.from === 'nervous-center')
    if (outEdge) path.push(outEdge.to)
  }

  const latency = path.length * (10 + Math.random() * 30)

  return {
    id: `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    channel,
    from,
    path,
    status: 'delivered',
    latency: Math.round(latency),
    payload: { channel, source: from },
  }
}

export async function GET() {
  const topology = buildNeuralTopology()

  // 生成当前活跃的信号追踪
  const activeChannels = [
    'action:donate', 'action:help', 'action:volunteer',
    'dopamine:trigger', 'equity:update', 'reward:release',
    'plug:connected', 'plug:updated', 'system:plug-in',
  ]

  const recentTraces = activeChannels.map(ch => traceSignal(ch, 'plugboard-in'))

  // 统计信号流量
  const channelStats = activeChannels.map(ch => ({
    channel: ch,
    count: Math.floor(Math.random() * 50),
    avgLatency: Math.round(20 + Math.random() * 80),
    lastActivity: Date.now() - Math.floor(Math.random() * 60000),
  }))

  // 获取插板系统信号连接
  const signalConnections = DEFAULT_CONNECTIONS.filter(c => c.signalChannel)

  return NextResponse.json({
    topology,
    recentTraces,
    channelStats,
    signalConnections,
    neuralNodes: PRESET_NEURAL_NODES,
    plugBoardStats: plugBoardRegistry.getStats(),
    compatibilityRules: COMPATIBLE_RULES.length,
    activePlugTypes: DEFAULT_PLUGS.map(p => p.plugTypeCode),
    activeSocketTypes: DEFAULT_SOCKETS.map(s => s.socketTypeCode),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { channel, from, payload, to } = body

    if (!channel || !from) {
      return NextResponse.json(
        { error: '缺少必要参数: channel, from' },
        { status: 400 }
      )
    }

    // 追踪信号
    const trace = traceSignal(channel, from)
    trace.to = to
    trace.payload = payload

    // 模拟激活拓扑节点
    const topology = buildNeuralTopology()
    for (const nodeId of trace.path) {
      const node = topology.nodes.find(n => n.id === nodeId)
      if (node) {
        node.activation = Math.min(1.0, node.activation + 0.3)
        node.lastFired = Date.now()
      }
    }

    return NextResponse.json({
      success: true,
      trace,
      activatedNodes: trace.path,
      message: `信号 ${channel} 从 ${from} 成功传递，经过 ${trace.path.length} 个节点`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: '信号传递失败' },
      { status: 500 }
    )
  }
}
