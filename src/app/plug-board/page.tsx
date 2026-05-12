'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Activity, Zap, Type, Layout, Database, Radio,
  Palette, Settings, Cable, Plug, Unplug, RefreshCw, CheckCircle2,
  XCircle, ArrowRight, Info
} from 'lucide-react'

// 型号图标映射
const TYPE_ICON_MAP: Record<string, any> = {
  vocab: Type, ui: Layout, data: Database, action: Zap,
  signal: Radio, style: Palette, config: Settings,
  vocab_display: Type, ui_render: Layout, data_input: Database,
  action_handler: Zap, signal_channel: Radio, style_apply: Palette, config_read: Settings,
}

// 型号颜色映射
const TYPE_COLOR_MAP: Record<string, string> = {
  vocab: '#eab308', ui: '#8b5cf6', data: '#3b82f6', action: '#f97316',
  signal: '#10b981', style: '#ec4899', config: '#64748b',
  vocab_display: '#eab308', ui_render: '#8b5cf6', data_input: '#3b82f6',
  action_handler: '#f97316', signal_channel: '#10b981', style_apply: '#ec4899', config_read: '#64748b',
}

interface PlugItem {
  id: string; code: string; name: string; description: string; plugTypeCode: string
  pinValues: any; provider: string; activeConnections: number; compatibleSocketTypes: any[]
}

interface SocketItem {
  id: string; code: string; name: string; description: string; socketTypeCode: string
  consumer: string; location: any; isRequired: boolean; allowMultiple: boolean
  connectedPlugs: any[]; compatiblePlugTypes: any[]
}

export default function PlugBoardPage() {
  const [plugs, setPlugs] = useState<PlugItem[]>([])
  const [sockets, setSockets] = useState<SocketItem[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initResult, setInitResult] = useState<any>(null)
  const [activeView, setActiveView] = useState<'overview' | 'plugs' | 'sockets' | 'connections'>('overview')

  useEffect(() => {
    loadBoard()
  }, [])

  async function loadBoard() {
    try {
      const res = await fetch('/api/plug-board/init')
      if (res.ok) {
        const data = await res.json()
        setInitialized(data.initialized)
        if (data.initialized) {
          await loadDetails()
        }
      }
    } catch (error) {
      console.error('加载插板失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadDetails() {
    try {
      const [plugsRes, socketsRes] = await Promise.all([
        fetch('/api/plug-board/plugs'),
        fetch('/api/plug-board/sockets'),
      ])
      if (plugsRes.ok) {
        const data = await plugsRes.json()
        setPlugs(data.plugs || [])
      }
      if (socketsRes.ok) {
        const data = await socketsRes.json()
        setSockets(data.sockets || [])
      }
    } catch (error) {
      console.error('加载详情失败:', error)
    }
  }

  async function initBoard() {
    try {
      const res = await fetch('/api/plug-board/init', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setInitResult(data.results)
        setInitialized(true)
        await loadDetails()
      }
    } catch (error) {
      console.error('初始化失败:', error)
    }
  }

  async function disconnect(connectionId: string) {
    try {
      await fetch(`/api/plug-board/connect?connectionId=${connectionId}`, { method: 'DELETE' })
      await loadDetails()
    } catch (error) {
      console.error('断开失败:', error)
    }
  }

  async function connect(plugCode: string, socketCode: string) {
    try {
      const res = await fetch('/api/plug-board/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plugCode, socketCode }),
      })
      const data = await res.json()
      if (res.ok) {
        await loadDetails()
      } else {
        alert(data.error || '连接失败')
      }
    } catch (error) {
      console.error('连接失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Activity className="h-12 w-12 animate-spin text-slate-500" />
      </div>
    )
  }

  // 统计
  const plugTypeStats = new Map<string, number>()
  plugs.forEach(p => plugTypeStats.set(p.plugTypeCode, (plugTypeStats.get(p.plugTypeCode) || 0) + 1))
  const socketTypeStats = new Map<string, number>()
  sockets.forEach(s => socketTypeStats.set(s.socketTypeCode, (socketTypeStats.get(s.socketTypeCode) || 0) + 1))
  const totalConnections = sockets.reduce((sum, s) => sum + s.connectedPlugs.length, 0)
  const unconnectedSockets = sockets.filter(s => s.connectedPlugs.length === 0 && s.isRequired)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-700 via-gray-700 to-zinc-700 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/apps">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-1" />
                应用中心
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Cable className="h-7 w-7" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">插板系统</h1>
            <p className="text-white/80">插头·插槽·型号·兼容·连接 — 神经系统通用路由基座</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 未初始化提示 */}
        {!initialized && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-8 text-center">
              <Plug className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-amber-800 mb-2">插板系统尚未初始化</h3>
              <p className="text-amber-700 mb-4">点击下方按钮初始化插头型号、插槽型号、兼容规则和默认插头/插槽</p>
              <Button onClick={initBoard} className="bg-amber-600 hover:bg-amber-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                初始化插板系统
              </Button>
              {initResult && (
                <div className="mt-4 text-sm text-amber-700">
                  型号{initResult.plugTypes}+{initResult.socketTypes} / 规则{initResult.rules} /
                  插头{initResult.plugs} / 插槽{initResult.sockets} / 连接{initResult.connections}
                  {initResult.errors.length > 0 && <p className="text-red-600 mt-1">错误: {initResult.errors.join('; ')}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {initialized && (
          <>
            {/* 导航标签 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'overview', label: '总览', icon: Cable },
                { id: 'plugs', label: '插头', icon: Plug },
                { id: 'sockets', label: '插槽', icon: Info },
                { id: 'connections', label: '连接', icon: ArrowRight },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                    activeView === tab.id ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 border hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 总览 */}
            {activeView === 'overview' && (
              <div className="space-y-6">
                {/* 统计卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <Type className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                      <p className="text-xl font-bold">{plugTypeStats.size}</p>
                      <p className="text-xs text-gray-500">插头型号</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Layout className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                      <p className="text-xl font-bold">{socketTypeStats.size}</p>
                      <p className="text-xs text-gray-500">插槽型号</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Plug className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-xl font-bold">{plugs.length}</p>
                      <p className="text-xs text-gray-500">插头实例</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                    <CardContent className="p-4 text-center">
                      <Cable className="h-5 w-5 text-green-500 mx-auto mb-1" />
                      <p className="text-xl font-bold">{totalConnections}</p>
                      <p className="text-xs text-gray-500">活跃连接</p>
                    </CardContent>
                  </Card>
                  <Card className={`bg-gradient-to-br ${unconnectedSockets.length > 0 ? 'from-red-50 to-white border-red-200' : 'from-emerald-50 to-white border-emerald-200'}`}>
                    <CardContent className="p-4 text-center">
                      {unconnectedSockets.length > 0 ? (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                      )}
                      <p className="text-xl font-bold">{unconnectedSockets.length}</p>
                      <p className="text-xs text-gray-500">未连接必需槽</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 型号矩阵图 — 插头型号×插槽型号 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cable className="h-5 w-5" />
                      型号兼容矩阵
                    </CardTitle>
                    <CardDescription>行=插头型号，列=插槽型号，✓=可直接插入，◇=需转接</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr>
                            <th className="border p-2 bg-gray-50 text-left">插头\插槽</th>
                            {['vocab_display', 'ui_render', 'data_input', 'action_handler', 'signal_channel', 'style_apply', 'config_read'].map(st => (
                              <th key={st} className="border p-2 bg-gray-50 text-center" style={{ color: TYPE_COLOR_MAP[st] }}>
                                {st.replace('_', '<br/>')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {['vocab', 'ui', 'data', 'action', 'signal', 'style', 'config'].map(pt => (
                            <tr key={pt}>
                              <td className="border p-2 font-medium" style={{ color: TYPE_COLOR_MAP[pt] }}>{pt}</td>
                              {['vocab_display', 'ui_render', 'data_input', 'action_handler', 'signal_channel', 'style_apply', 'config_read'].map(st => {
                                const isDirect = pt === st.split('_')[0]
                                const isCross = !isDirect && (
                                  (pt === 'vocab' && st === 'config_read') ||
                                  (pt === 'config' && st === 'data_input') ||
                                  (pt === 'data' && st === 'config_read') ||
                                  (pt === 'action' && st === 'signal_channel')
                                )
                                return (
                                  <td key={st} className={`border p-2 text-center ${isDirect ? 'bg-green-50' : isCross ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                    {isDirect ? '✓' : isCross ? '◇' : '—'}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>✓ = 直接兼容（同型号）</span>
                      <span>◇ = 跨型号兼容（需转接）</span>
                      <span>— = 不兼容</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 设计哲学 */}
                <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Cable className="h-5 w-5 text-slate-600" />
                      插板设计哲学
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        <strong>一切皆插头/插槽</strong>：词汇是插头，UI是插头，数据是插头，行为是插头，信号是插头，样式是插头，配置是插头。
                        对应地，每个显示位是插槽，每个渲染位是插槽，每个输入位是插槽，每个处理位是插槽。类型相同就能插入——这就是"型号"的含义。
                      </p>
                      <p>
                        <strong>型号匹配才能插入</strong>：就像物理世界——两孔插头不能插三孔插座，除非用转接头。
                        系统定义了7种插头型号和7种插槽型号，只有兼容规则允许的组合才能建立连接。
                        跨型号连接需要"转接头"（transform规则），低优先级的兼容只在没有直接匹配时使用。
                      </p>
                      <p>
                        <strong>神经系统通用路由</strong>：当插头插入插槽，连接会注册到神经系统的一个信号频道。
                        插头值变化时，信号沿频道传播到所有关注该插槽的模块。这使得任何模块都不需要知道数据从哪来——只需要知道自己的插槽里插了什么型号的插头。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 插头列表 */}
            {activeView === 'plugs' && (
              <div className="space-y-3">
                {plugs.map(p => {
                  const PlugIcon = TYPE_ICON_MAP[p.plugTypeCode] || Plug
                  return (
                    <Card key={p.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (TYPE_COLOR_MAP[p.plugTypeCode] || '#64748b') + '20' }}>
                            <PlugIcon className="h-5 w-5" style={{ color: TYPE_COLOR_MAP[p.plugTypeCode] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{p.code}</code>
                              <Badge className="text-xs" style={{ backgroundColor: (TYPE_COLOR_MAP[p.plugTypeCode] || '#64748b') + '20', color: TYPE_COLOR_MAP[p.plugTypeCode] }}>
                                {p.plugTypeCode}
                              </Badge>
                              <Badge variant="outline" className="text-xs">×{p.activeConnections}</Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                            {p.pinValues && (
                              <div className="mt-2 text-xs bg-gray-50 rounded p-2 font-mono">
                                {Object.entries(p.pinValues).map(([k, v]) => (
                                  <span key={k} className="mr-3"><span className="text-gray-400">{k}:</span> <span className="text-gray-700">{String(v)}</span></span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* 插槽列表 */}
            {activeView === 'sockets' && (
              <div className="space-y-3">
                {sockets.map(s => {
                  const SocketIcon = TYPE_ICON_MAP[s.socketTypeCode] || Info
                  return (
                    <Card key={s.id} className={`hover:shadow-md transition-shadow ${s.isRequired && s.connectedPlugs.length === 0 ? 'border-red-300' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (TYPE_COLOR_MAP[s.socketTypeCode] || '#64748b') + '20' }}>
                            <SocketIcon className="h-5 w-5" style={{ color: TYPE_COLOR_MAP[s.socketTypeCode] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{s.code}</code>
                              <Badge className="text-xs" style={{ backgroundColor: (TYPE_COLOR_MAP[s.socketTypeCode] || '#64748b') + '20', color: TYPE_COLOR_MAP[s.socketTypeCode] }}>
                                {s.socketTypeCode}
                              </Badge>
                              {s.isRequired && <Badge className="bg-red-100 text-red-700 text-xs">必需</Badge>}
                              {s.allowMultiple && <Badge className="bg-blue-100 text-blue-700 text-xs">允许多插</Badge>}
                              <Badge variant="outline" className="text-xs">{s.connectedPlugs.length}个连接</Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-800">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.description}</p>
                            {/* 当前插入的插头 */}
                            {s.connectedPlugs.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {s.connectedPlugs.map((cp: any) => (
                                  <div key={cp.id} className="flex items-center gap-2 text-xs bg-green-50 rounded px-2 py-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span className="font-medium">{cp.plugName}</span>
                                    <span className="text-gray-400">({cp.plugTypeCode})</span>
                                    <button onClick={() => disconnect(cp.id)} className="ml-auto text-red-400 hover:text-red-600">
                                      <Unplug className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* 连接视图 */}
            {activeView === 'connections' && (
              <div className="space-y-3">
                {sockets.filter(s => s.connectedPlugs.length > 0).map(s => (
                  s.connectedPlugs.map((cp: any) => (
                    <Card key={cp.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <Badge style={{ backgroundColor: (TYPE_COLOR_MAP[cp.plugTypeCode] || '#64748b') + '20', color: TYPE_COLOR_MAP[cp.plugTypeCode] }}>
                              {cp.plugCode}
                            </Badge>
                            <span className="text-xs text-gray-400">({cp.plugTypeCode})</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="outline" style={{ borderColor: TYPE_COLOR_MAP[s.socketTypeCode], color: TYPE_COLOR_MAP[s.socketTypeCode] }}>
                              {s.code}
                            </Badge>
                            <span className="text-xs text-gray-400">({s.socketTypeCode})</span>
                          </div>
                          <button onClick={() => disconnect(cp.id)} className="text-red-400 hover:text-red-600 p-1">
                            <Unplug className="h-4 w-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ))}
                {sockets.filter(s => s.connectedPlugs.length > 0).length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-400">
                      <Cable className="h-8 w-8 mx-auto mb-2" />
                      暂无连接
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
