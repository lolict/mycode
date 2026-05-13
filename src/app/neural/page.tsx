'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Brain, Radio, Zap, Activity, ArrowRight, RefreshCw,
  Network, Cable, Plug, Unplug, Send, Eye, Layers,
} from 'lucide-react'
import TabBar from '@/components/tab-bar'

// === Types ===

interface TopologyNode {
  id: string; name: string; type: string;
  x: number; y: number; activation: number; lastFired: number | null;
}

interface TopologyEdge {
  from: string; to: string; channel: string;
  weight: number; active: boolean;
}

interface SignalTrace {
  id: string; timestamp: number; channel: string; from: string;
  path: string[]; status: string; latency: number; payload: any;
}

interface ChannelStat {
  channel: string; count: number; avgLatency: number; lastActivity: number;
}

// === 颜色映射 ===

const NODE_TYPE_COLORS: Record<string, string> = {
  relay: '#3b82f6',
  sensor: '#10b981',
  processor: '#8b5cf6',
  actuator: '#f97316',
  gateway: '#64748b',
}

const NODE_TYPE_LABELS: Record<string, string> = {
  relay: '中继',
  sensor: '传感器',
  processor: '处理器',
  actuator: '执行器',
  gateway: '网关',
}

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  transit: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  blocked: 'bg-gray-100 text-gray-700',
}

export default function NeuralNetworkPage() {
  const [topology, setTopology] = useState<{ nodes: TopologyNode[]; edges: TopologyEdge[] } | null>(null)
  const [traces, setTraces] = useState<SignalTrace[]>([])
  const [channelStats, setChannelStats] = useState<ChannelStat[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null)
  const [pulseEffects, setPulseEffects] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/plugboard/neural')
      if (res.ok) {
        const data = await res.json()
        setTopology(data.topology)
        setTraces(data.recentTraces || [])
        setChannelStats(data.channelStats || [])
      }
    } catch (err) {
      console.error('加载神经拓扑失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // 每5秒刷新一次
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleSendSignal = async (channel: string) => {
    setSending(true)
    try {
      const res = await fetch('/api/plugboard/neural', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, from: 'manual-test', payload: { test: true } }),
      })
      if (res.ok) {
        const data = await res.json()
        // 激活脉冲效果
        if (data.activatedNodes) {
          setPulseEffects(new Set(data.activatedNodes))
          setTimeout(() => setPulseEffects(new Set()), 2000)
        }
        // 刷新数据
        await loadData()
      }
    } catch (err) {
      console.error('发送信号失败:', err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    return new Date(ts).toLocaleString('zh-CN')
  }

  // === 拓扑图渲染 ===

  function renderTopologySVG() {
    if (!topology) return null
    const { nodes, edges } = topology
    const width = 800
    const height = 650

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ minHeight: 400 }}>
        {/* 背景网格 */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" rx="8" />

        {/* 边（连接线） */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from)
          const toNode = nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode) return null

          const isActive = pulseEffects.has(edge.from) && pulseEffects.has(edge.to)
          const strokeColor = isActive ? NODE_TYPE_COLORS[fromNode.type] || '#3b82f6' : '#cbd5e1'
          const strokeWidth = isActive ? 2.5 : 1

          return (
            <g key={`edge-${i}`}>
              <line
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={edge.active ? 'none' : '5,5'}
                markerEnd="url(#arrowhead)"
                className="transition-all duration-300"
              />
              {/* 信号流动动画点 */}
              {isActive && (
                <circle r="4" fill={strokeColor} filter="url(#glow)">
                  <animateMotion
                    dur="0.5s"
                    repeatCount="2"
                    path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                  />
                </circle>
              )}
              {/* 频道标签 */}
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 8}
                textAnchor="middle"
                className="text-[8px] fill-gray-400"
              >
                {edge.channel}
              </text>
            </g>
          )
        })}

        {/* 节点 */}
        {nodes.map(node => {
          const color = NODE_TYPE_COLORS[node.type] || '#64748b'
          const isPulsing = pulseEffects.has(node.id)
          const isSelected = selectedNode?.id === node.id
          const nodeRadius = node.type === 'relay' ? 28 : 22

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => setSelectedNode(node)}
            >
              {/* 脉冲动画 */}
              {isPulsing && (
                <circle
                  cx={node.x} cy={node.y} r={nodeRadius + 15}
                  fill="none" stroke={color} strokeWidth="2" opacity="0.3"
                >
                  <animate attributeName="r" from={nodeRadius} to={nodeRadius + 20} dur="0.5s" repeatCount="2" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="0.5s" repeatCount="2" />
                </circle>
              )}

              {/* 激活度光晕 */}
              {node.activation > 0.1 && (
                <circle
                  cx={node.x} cy={node.y} r={nodeRadius + 5}
                  fill={color} opacity={node.activation * 0.15}
                />
              )}

              {/* 节点主体 */}
              <circle
                cx={node.x} cy={node.y} r={nodeRadius}
                fill="white"
                stroke={isSelected ? color : '#e2e8f0'}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all duration-200"
              />

              {/* 类型图标 */}
              <text
                x={node.x} y={node.y + 2}
                textAnchor="middle" dominantBaseline="middle"
                className="text-sm"
                fill={color}
              >
                {node.type === 'relay' ? '🔄' :
                 node.type === 'sensor' ? '📡' :
                 node.type === 'processor' ? '🧠' :
                 node.type === 'actuator' ? '⚡' : '🔌'}
              </text>

              {/* 名称 */}
              <text
                x={node.x} y={node.y + nodeRadius + 14}
                textAnchor="middle"
                className="text-[10px] font-medium fill-gray-700"
              >
                {node.name.length > 6 ? node.name.slice(0, 6) + '...' : node.name}
              </text>

              {/* 类型标签 */}
              <text
                x={node.x} y={node.y + nodeRadius + 24}
                textAnchor="middle"
                className="text-[8px] fill-gray-400"
              >
                {NODE_TYPE_LABELS[node.type] || node.type}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  // === 信号测试按钮组 ===

  const testSignals = [
    { channel: 'action:donate', label: '捐款信号', icon: '💰', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
    { channel: 'action:help', label: '互助信号', icon: '🤝', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { channel: 'action:volunteer', label: '志愿信号', icon: '🙋', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { channel: 'action:share', label: '分享信号', icon: '📢', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { channel: 'system:plug-in', label: '接入信号', icon: '🔌', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { channel: 'dopamine:trigger', label: '多巴胺触发', icon: '✨', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">神经网络加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-6">
              <Network className="h-4 w-4" />
              <span>插板型号线号 · 神经信号实时监控</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
              神经网络
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              插头插入插槽 → 神经信号通过频道传递 → 节点激活 → 多巴胺分泌 → 股权更新
              <br />
              <span className="text-purple-200">每个插板连接都是一条神经通路</span>
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* 实时统计 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '神经节点', count: topology?.nodes.length || 0, icon: Brain, color: 'from-purple-400 to-purple-500' },
            { label: '信号通道', count: topology?.edges.length || 0, icon: Cable, color: 'from-blue-400 to-blue-500' },
            { label: '信号追踪', count: traces.length, icon: Radio, color: 'from-green-400 to-green-500' },
            { label: '活跃频道', count: channelStats.filter(c => c.count > 0).length, icon: Activity, color: 'from-orange-400 to-orange-500' },
          ].map(stat => (
            <Card key={stat.label} className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="p-3 text-center">
                <stat.icon className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="topology">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="topology" className="py-2.5 text-xs sm:text-sm">拓扑图</TabsTrigger>
            <TabsTrigger value="signals" className="py-2.5 text-xs sm:text-sm">信号流</TabsTrigger>
            <TabsTrigger value="test" className="py-2.5 text-xs sm:text-sm">信号测试</TabsTrigger>
            <TabsTrigger value="stats" className="py-2.5 text-xs sm:text-sm">统计</TabsTrigger>
          </TabsList>

          {/* 拓扑图 Tab */}
          <TabsContent value="topology">
            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Network className="h-5 w-5 text-purple-600" />
                    神经拓扑图
                  </CardTitle>
                  <CardDescription>点击节点查看详情，发送信号查看脉冲传递效果</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderTopologySVG()}
                  {/* 图例 */}
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                    {Object.entries(NODE_TYPE_LABELS).map(([type, label]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_TYPE_COLORS[type] }} />
                        <span>{label}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-0.5 bg-gray-300" />
                      <span>信号通道</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-0.5 bg-gray-300 border-dashed" />
                      <span>未激活</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 选中节点详情 */}
              {selectedNode && (
                <Card className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: (NODE_TYPE_COLORS[selectedNode.type] || '#64748b') + '20' }}>
                        <span className="text-xl">
                          {selectedNode.type === 'relay' ? '🔄' :
                           selectedNode.type === 'sensor' ? '📡' :
                           selectedNode.type === 'processor' ? '🧠' :
                           selectedNode.type === 'actuator' ? '⚡' : '🔌'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs bg-purple-50 px-2 py-0.5 rounded font-mono text-purple-700">
                            {selectedNode.id}
                          </code>
                          <Badge style={{ backgroundColor: NODE_TYPE_COLORS[selectedNode.type], color: 'white' }}
                            className="text-xs border-0">
                            {NODE_TYPE_LABELS[selectedNode.type]}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{selectedNode.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>激活度: {(selectedNode.activation * 100).toFixed(0)}%</span>
                          <span>最后触发: {selectedNode.lastFired ? formatTime(selectedNode.lastFired) : '从未'}</span>
                          <span>位置: ({selectedNode.x}, {selectedNode.y})</span>
                        </div>
                        {/* 连接的边 */}
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1">信号通道:</p>
                          <div className="flex flex-wrap gap-1">
                            {topology?.edges
                              .filter(e => e.from === selectedNode.id || e.to === selectedNode.id)
                              .map((edge, i) => (
                                <Badge key={i} variant="outline" className="text-xs py-0">
                                  {edge.from === selectedNode.id ? '→' : '←'}
                                  {edge.channel}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 信号流 Tab */}
          <TabsContent value="signals">
            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Radio className="h-5 w-5 text-green-600" />
                      信号追踪
                    </CardTitle>
                    <CardDescription>每条信号从插板接口到执行器的完整传递路径</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    刷新
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {traces.map(trace => (
                      <div key={trace.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">{trace.channel}</Badge>
                            <Badge className={`${STATUS_COLORS[trace.status]} text-xs border-0`}>{trace.status}</Badge>
                          </div>
                          <span className="text-xs text-gray-400">{trace.latency}ms</span>
                        </div>
                        {/* 传递路径 */}
                        <div className="flex items-center gap-1 flex-wrap text-xs">
                          {trace.path.map((nodeId, i) => {
                            const node = topology?.nodes.find(n => n.id === nodeId)
                            return (
                              <span key={i} className="flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded bg-gray-100 font-mono"
                                  style={{ borderLeft: `3px solid ${node ? NODE_TYPE_COLORS[node.type] : '#64748b'}` }}>
                                  {node?.name || nodeId}
                                </span>
                                {i < trace.path.length - 1 && (
                                  <ArrowRight className="h-3 w-3 text-gray-300" />
                                )}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 信号测试 Tab */}
          <TabsContent value="test">
            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5 text-orange-600" />
                    信号测试面板
                  </CardTitle>
                  <CardDescription>模拟发送不同类型的神经信号，观察在拓扑中的传递效果</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {testSignals.map(sig => (
                      <Button
                        key={sig.channel}
                        variant="outline"
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${sig.color} border-transparent transition-all`}
                        onClick={() => handleSendSignal(sig.channel)}
                        disabled={sending}
                      >
                        <span className="text-2xl">{sig.icon}</span>
                        <span className="text-sm font-medium">{sig.label}</span>
                        <code className="text-[10px] opacity-60 font-mono">{sig.channel}</code>
                      </Button>
                    ))}
                  </div>

                  {pulseEffects.size > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                      <Activity className="h-4 w-4 animate-pulse" />
                      信号传递中... 已激活 {pulseEffects.size} 个节点
                    </div>
                  )}

                  {/* 快捷说明 */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 text-xs text-gray-600">
                      <p className="font-medium text-gray-800 mb-2">信号传递流程说明</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">🔌 插板输入</Badge>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="outline" className="text-xs">🔄 神经中枢</Badge>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="outline" className="text-xs">📡 传感器</Badge>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="outline" className="text-xs">🧠 处理器</Badge>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="outline" className="text-xs">⚡ 执行器</Badge>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="outline" className="text-xs">🔌 插板输出</Badge>
                      </div>
                      <p className="mt-2 text-gray-500">
                        每个插板连接都是一条神经通路：词汇插头→词汇插槽触发vocab:updated信号，
                        信号插头→信号插槽建立持久监听，行为插头→行为插槽绑定可执行动作。
                        所有信号通过神经中枢路由，实现插板型号线号的全能互联。
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 统计 Tab */}
          <TabsContent value="stats">
            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-600" />
                    频道流量统计
                  </CardTitle>
                  <CardDescription>各信号频道的消息量和平均延迟</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {channelStats.sort((a, b) => b.count - a.count).map(stat => (
                      <div key={stat.channel} className="flex items-center gap-3">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded min-w-[140px]">
                          {stat.channel}
                        </code>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (stat.count / 50) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-[50px] text-right">{stat.count}条</span>
                        <span className="text-xs text-gray-400 min-w-[60px] text-right">{stat.avgLatency}ms</span>
                        <span className="text-xs text-gray-400 min-w-[60px] text-right">{formatTime(stat.lastActivity)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 节点激活度排行 */}
              {topology && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      节点激活度
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topology.nodes
                        .sort((a, b) => b.activation - a.activation)
                        .map(node => (
                          <div key={node.id} className="flex items-center gap-3">
                            <span className="text-sm">{node.type === 'relay' ? '🔄' :
                              node.type === 'sensor' ? '📡' :
                              node.type === 'processor' ? '🧠' :
                              node.type === 'actuator' ? '⚡' : '🔌'}</span>
                            <span className="text-sm font-medium text-gray-800 min-w-[100px]">{node.name}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${node.activation * 100}%`,
                                  backgroundColor: NODE_TYPE_COLORS[node.type] || '#64748b',
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium min-w-[40px] text-right"
                              style={{ color: NODE_TYPE_COLORS[node.type] }}>
                              {(node.activation * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <TabBar />
    </div>
  )
}
