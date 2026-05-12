'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Type, Layout, Database, Zap, Radio, Palette, Settings,
  Cable, Plug, Unplug, RefreshCw, CheckCircle2,
  XCircle, ArrowRight, Info, Activity, Brain, ChevronDown, ChevronUp,
} from 'lucide-react'

// === Types ===

interface PortDef {
  name: string
  dataType: string
  required: boolean
  description: string
}

interface PlugBoardInterface {
  version: string
  type: string
  inputs: PortDef[]
  outputs: PortDef[]
  config: { key: string; dataType: string; required: boolean; description: string }[]
  compatibility: string[]
}

interface PlugModelItem {
  code: string
  name: string
  plugType: string
  version: string
  description: string
  interfaceSpec: PlugBoardInterface
  tags?: string[]
  dependencies?: string[]
  author?: string
}

interface SlotModelItem {
  code: string
  name: string
  slotType: string
  version: string
  description: string
  interfaceSpec: PlugBoardInterface
  capacity: number
  requiredType?: string
  tags?: string[]
}

interface VocabModel {
  code: string
  name: string
  category: string
  vocabulary: Record<string, string>
  plugSpec: PlugBoardInterface
  slotSpec: PlugBoardInterface
  neuralMap?: Record<string, string[]>
  version: string
}

interface UIModel {
  code: string
  name: string
  uiType: string
  template: Record<string, unknown>
  plugSpec: PlugBoardInterface
  slotSpec: PlugBoardInterface
  version: string
}

interface PlugInstance {
  id: string; code: string; name: string; description: string; plugTypeCode: string
  pinValues: any; provider: string; activeConnections: number; compatibleSocketTypes: any[]
}

interface SocketInstance {
  id: string; code: string; name: string; description: string; socketTypeCode: string
  consumer: string; location: any; isRequired: boolean; allowMultiple: boolean
  connectedPlugs: any[]; compatiblePlugTypes: any[]
}

interface CompatRule {
  plugTypeCode: string; socketTypeCode: string; transform?: string;
  priority: number; description: string;
}

interface CompatibilityResult {
  plugCode: string; slotCode: string; compatible: boolean; typeMatch: boolean;
  interfaceCompatible: boolean; errors: string[]; warnings: string[];
}

interface NeuralNodeItem {
  code: string; name: string; description?: string;
  nodeType: string; activationFunction: string; threshold: number;
  inputs?: Record<string, unknown>; outputs?: Record<string, unknown>;
}

// === Constants ===

const TYPE_ICON_MAP: Record<string, any> = {
  vocab: Type, ui: Layout, data: Database, action: Zap,
  signal: Radio, style: Palette, config: Settings,
  vocab_display: Type, ui_render: Layout, data_input: Database,
  action_handler: Zap, signal_channel: Radio, style_apply: Palette, config_read: Settings,
}

const TYPE_COLOR_MAP: Record<string, string> = {
  vocab: '#eab308', ui: '#8b5cf6', data: '#3b82f6', action: '#f97316',
  signal: '#10b981', style: '#ec4899', config: '#64748b',
  vocab_display: '#eab308', ui_render: '#8b5cf6', data_input: '#3b82f6',
  action_handler: '#f97316', signal_channel: '#10b981', style_apply: '#ec4899', config_read: '#64748b',
}

const PLUG_TYPE_NAMES: Record<string, string> = {
  vocab: '词汇插头', ui: 'UI插头', data: '数据插头', action: '行为插头',
  signal: '信号插头', style: '样式插头', config: '配置插头',
}
const SOCKET_TYPE_NAMES: Record<string, string> = {
  vocab_display: '词汇插槽', ui_render: 'UI插槽', data_input: '数据插槽',
  action_handler: '行为插槽', signal_channel: '信号插槽', style_apply: '样式插槽', config_read: '配置插槽',
}

// === Sub-Components ===

function PortBadge({ port, direction }: { port: PortDef; direction: 'in' | 'out' }) {
  const color = direction === 'in' ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      <span className="opacity-60">{direction === 'in' ? '→' : '←'}</span>
      {port.name}
      <span className="opacity-50">({port.dataType})</span>
      {port.required && <span className="text-red-400">*</span>}
    </span>
  )
}

function PlugTypeCard({ pt }: { pt: { code: string; name: string; description: string; pinCount: number; pinDefs: any[]; icon: string; color: string } }) {
  const [expanded, setExpanded] = useState(false)
  const IconComp = TYPE_ICON_MAP[pt.code] || Plug
  return (
    <Card className="transition-all hover:shadow-md" style={{ borderLeftColor: pt.color, borderLeftWidth: '4px' }}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: pt.color + '20' }}>
            <IconComp className="h-5 w-5" style={{ color: pt.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{pt.code}</code>
              <Badge className="text-xs border-0" style={{ backgroundColor: pt.color + '20', color: pt.color }}>
                {pt.pinCount}引脚
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-800">{pt.name}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{pt.description}</p>
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1">
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? '收起引脚' : '查看引脚'}
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {pt.pinDefs.map(pin => (
                  <div key={pin.name} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
                    <Badge variant="outline" className="text-xs py-0">{pin.type}</Badge>
                    <span className="font-medium">{pin.name}</span>
                    <span className="text-gray-400 flex-1">{pin.description}</span>
                    {pin.required && <span className="text-red-400">*</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompatMatrix({ rules }: { rules: CompatRule[] }) {
  const plugTypes = ['vocab', 'ui', 'data', 'action', 'signal', 'style', 'config']
  const socketTypes = ['vocab_display', 'ui_render', 'data_input', 'action_handler', 'signal_channel', 'style_apply', 'config_read']
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Cable className="h-5 w-5" />
          型号兼容矩阵
        </CardTitle>
        <CardDescription>行=插头型号，列=插槽型号，✓=可直接插入，◇=需转接，—=不兼容</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50 text-left">插头\插槽</th>
                {socketTypes.map(st => (
                  <th key={st} className="border p-2 bg-gray-50 text-center whitespace-nowrap" style={{ color: TYPE_COLOR_MAP[st] }}>
                    {st.replace('_', '_')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plugTypes.map(pt => (
                <tr key={pt}>
                  <td className="border p-2 font-medium whitespace-nowrap" style={{ color: TYPE_COLOR_MAP[pt] }}>{pt}</td>
                  {socketTypes.map(st => {
                    const rule = rules.find(r => r.plugTypeCode === pt && r.socketTypeCode === st)
                    const isDirect = pt === st.split('_')[0]
                    return (
                      <td key={st} className={`border p-2 text-center ${isDirect ? 'bg-green-50' : rule ? 'bg-amber-50' : 'bg-gray-50'}`}>
                        {isDirect ? '✓' : rule ? '◇' : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>✓ = 直接兼容（同型号，优先级100）</span>
          <span>◇ = 跨型号兼容（需转接，优先级10-30）</span>
          <span>— = 不兼容</span>
        </div>
      </CardContent>
    </Card>
  )
}

function NeuralSignalViz({ nodes }: { nodes: NeuralNodeItem[] }) {
  return (
    <div className="space-y-3">
      {nodes.map(node => {
        const IconComp = node.nodeType === 'sensor' ? Radio : node.nodeType === 'actuator' ? Zap : node.nodeType === 'processor' ? Brain : Activity
        return (
          <Card key={node.code} className="border-purple-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-purple-50">
                  <IconComp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs bg-purple-50 px-2 py-0.5 rounded font-mono text-purple-700">{node.code}</code>
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">{node.nodeType}</Badge>
                    <Badge variant="outline" className="text-xs">{node.activationFunction} σ={node.threshold}</Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{node.name}</p>
                  {node.description && <p className="text-xs text-gray-500">{node.description}</p>}
                  <div className="flex gap-4 mt-2">
                    {node.inputs && (
                      <div className="text-xs">
                        <span className="text-gray-400">输入频道: </span>
                        {Object.entries(node.inputs).map(([k, v]) => (
                          <span key={k} className="inline-flex items-center gap-1 mr-2">
                            <Badge variant="secondary" className="text-xs py-0">{k}</Badge>
                            <span className="text-gray-500">{JSON.stringify(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {node.outputs && (
                      <div className="text-xs">
                        <span className="text-gray-400">输出频道: </span>
                        {Object.entries(node.outputs).map(([k, v]) => (
                          <span key={k} className="inline-flex items-center gap-1 mr-2">
                            <Badge variant="secondary" className="text-xs py-0">{k}</Badge>
                            <span className="text-gray-500">{JSON.stringify(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ConnectionVisualization({ plug, slot, result }: { plug: PlugModelItem | null; slot: SlotModelItem | null; result: CompatibilityResult | null }) {
  if (!plug || !slot) return null
  const compatible = result?.compatible ?? false
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center justify-center gap-4 w-full">
        <div className={`flex-shrink-0 rounded-xl border-2 p-4 text-center min-w-[140px] transition-all ${
          compatible ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="text-2xl mb-1">🔌</div>
          <div className="text-sm font-bold">{plug.name}</div>
          <div className="text-xs text-muted-foreground">{plug.plugType}</div>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
          <div className={`h-1 w-full rounded-full transition-all ${compatible ? 'bg-emerald-400' : 'bg-gray-300'}`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 ${
            compatible ? 'bg-emerald-400 text-white' : 'bg-gray-300 text-white'
          }`}>
            {compatible ? '✓' : '✗'}
          </div>
        </div>
        <div className={`flex-shrink-0 rounded-xl border-2 p-4 text-center min-w-[140px] transition-all ${
          compatible ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="text-2xl mb-1">🔲</div>
          <div className="text-sm font-bold">{slot.name}</div>
          <div className="text-xs text-muted-foreground">{slot.slotType}</div>
        </div>
      </div>
      {result && (
        <div className="w-full space-y-2">
          {result.compatible ? (
            <Alert><AlertTitle>兼容 ✓</AlertTitle><AlertDescription>插头与插槽接口匹配，可以安全连接。</AlertDescription></Alert>
          ) : (
            <Alert variant="destructive"><AlertTitle>不兼容 ✗</AlertTitle><AlertDescription><ul className="list-disc pl-4 space-y-1">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul></AlertDescription></Alert>
          )}
          {result.warnings.length > 0 && (
            <Alert><AlertTitle>警告</AlertTitle><AlertDescription><ul className="list-disc pl-4 space-y-1">{result.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></AlertDescription></Alert>
          )}
        </div>
      )}
    </div>
  )
}

// === Main Page ===

export default function PlugBoardPage() {
  const [plugs, setPlugs] = useState<PlugModelItem[]>([])
  const [slots, setSlots] = useState<SlotModelItem[]>([])
  const [vocabModels, setVocabModels] = useState<VocabModel[]>([])
  const [uiModels, setUIModels] = useState<UIModel[]>([])
  const [plugInstances, setPlugInstances] = useState<PlugInstance[]>([])
  const [socketInstances, setSocketInstances] = useState<SocketInstance[]>([])
  const [compatRules, setCompatRules] = useState<CompatRule[]>([])
  const [neuralNodes, setNeuralNodes] = useState<NeuralNodeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Compatibility check state
  const [selectedPlug, setSelectedPlug] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null)
  const [checking, setChecking] = useState(false)

  const loadRegistryData = useCallback(async () => {
    try {
      const [plugsRes, slotsRes, vocabRes, uiRes] = await Promise.all([
        fetch('/api/plugboard/plugs'),
        fetch('/api/plugboard/slots'),
        fetch('/api/plugboard/vocab-models'),
        fetch('/api/plugboard/ui-models'),
      ])
      if (plugsRes.ok) { const d = await plugsRes.json(); setPlugs(d.plugs || []) }
      if (slotsRes.ok) { const d = await slotsRes.json(); setSlots(d.slots || []) }
      if (vocabRes.ok) { const d = await vocabRes.json(); setVocabModels(d.vocabModels || []) }
      if (uiRes.ok) { const d = await uiRes.json(); setUIModels(d.uiModels || []) }
    } catch (err) {
      console.error('Registry load error:', err)
    }
  }, [])

  const loadInstanceData = useCallback(async () => {
    try {
      const [plugsRes, socketsRes] = await Promise.all([
        fetch('/api/plugboard/instances/plugs'),
        fetch('/api/plugboard/instances/sockets'),
      ])
      if (plugsRes.ok) { const d = await plugsRes.json(); setPlugInstances(d.plugs || []) }
      if (socketsRes.ok) { const d = await socketsRes.json(); setSocketInstances(d.sockets || []) }
    } catch (err) {
      console.error('Instance load error:', err)
    }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        // Load registry data (always available)
        await loadRegistryData()

        // Load static data from registry endpoints
        const rulesRes = await fetch('/api/plugboard/rules')
        if (rulesRes.ok) { const d = await rulesRes.json(); setCompatRules(d.rules || []) }

        const neuralRes = await fetch('/api/plugboard/neural-nodes')
        if (neuralRes.ok) { const d = await neuralRes.json(); setNeuralNodes(d.nodes || []) }

        // Check if DB is initialized
        const initRes = await fetch('/api/plugboard/init')
        if (initRes.ok) {
          const d = await initRes.json()
          setInitialized(d.initialized)
          if (d.initialized) {
            await loadInstanceData()
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [loadRegistryData, loadInstanceData])

  async function handleInit() {
    try {
      const res = await fetch('/api/plugboard/init', { method: 'POST' })
      if (res.ok) {
        setInitialized(true)
        await loadInstanceData()
      }
    } catch (err) {
      console.error('Init error:', err)
    }
  }

  async function handleCompatibilityCheck() {
    if (!selectedPlug || !selectedSlot) return
    setChecking(true)
    try {
      const res = await fetch(`/api/plugboard/compatibility?plugCode=${encodeURIComponent(selectedPlug)}&slotCode=${encodeURIComponent(selectedSlot)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '检查失败')
      setCompatResult(data)
    } catch {
      setCompatResult(null)
    } finally {
      setChecking(false)
    }
  }

  async function handleConnect(plugCode: string, socketCode: string) {
    try {
      const res = await fetch('/api/plugboard/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plugCode, socketCode }),
      })
      if (res.ok) await loadInstanceData()
      else { const d = await res.json(); alert(d.error || '连接失败') }
    } catch (err) { console.error('Connect error:', err) }
  }

  async function handleDisconnect(connectionId: string) {
    try {
      await fetch(`/api/plugboard/connect?connectionId=${connectionId}`, { method: 'DELETE' })
      await loadInstanceData()
    } catch (err) { console.error('Disconnect error:', err) }
  }

  const selectedPlugModel = plugs.find(p => p.code === selectedPlug) || null
  const selectedSlotModel = slots.find(s => s.code === selectedSlot) || null

  // Stats
  const totalConnections = socketInstances.reduce((sum, s) => sum + s.connectedPlugs.length, 0)
  const unconnectedRequired = socketInstances.filter(s => s.connectedPlugs.length === 0 && s.isRequired)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>加载错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-6">
              <Cable className="h-4 w-4" />
              <span>统一插板型号架构系统</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              插板型号架构
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              通用插件化模块系统 — 7种插头型号 + 7种插槽型号 + 11条兼容规则
              <br />
              <span className="text-emerald-200 font-semibold">插头</span>和
              <span className="text-cyan-200 font-semibold">插槽</span>型号匹配才能插入，跨型号需转接
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: '插头型号', count: 7, icon: Plug, color: 'from-amber-400 to-amber-500' },
            { label: '插槽型号', count: 7, icon: Info, color: 'from-rose-400 to-rose-500' },
            { label: '兼容规则', count: compatRules.length || 11, icon: Cable, color: 'from-emerald-400 to-emerald-500' },
            { label: '插头实例', count: plugInstances.length, icon: Zap, color: 'from-blue-400 to-blue-500' },
            { label: '插槽实例', count: socketInstances.length, icon: Layout, color: 'from-purple-400 to-purple-500' },
            { label: '活跃连接', count: totalConnections, icon: Activity, color: 'from-teal-400 to-teal-500' },
          ].map(stat => (
            <Card key={stat.label} className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="p-3 text-center">
                {loading ? (
                  <Skeleton className="h-7 w-12 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                )}
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                  <stat.icon className="h-3 w-3" />
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Init banner if not initialized */}
        {!initialized && !loading && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-6 text-center">
              <Plug className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-amber-800 mb-2">插板系统尚未初始化</h3>
              <p className="text-amber-700 mb-4 text-sm">初始化将写入7种插头型号、7种插槽型号、11条兼容规则、17个默认插头、9个默认插槽、9个默认连接</p>
              <Button onClick={handleInit} className="bg-amber-600 hover:bg-amber-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                初始化插板系统
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tab Sections */}
        <Tabs defaultValue="types">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 h-auto">
            <TabsTrigger value="types" className="py-2.5 text-xs sm:text-sm">型号</TabsTrigger>
            <TabsTrigger value="rules" className="py-2.5 text-xs sm:text-sm">兼容规则</TabsTrigger>
            <TabsTrigger value="instances" className="py-2.5 text-xs sm:text-sm">实例</TabsTrigger>
            <TabsTrigger value="models" className="py-2.5 text-xs sm:text-sm">型号库</TabsTrigger>
            <TabsTrigger value="compat" className="py-2.5 text-xs sm:text-sm">兼容检查</TabsTrigger>
            <TabsTrigger value="neural" className="py-2.5 text-xs sm:text-sm">神经</TabsTrigger>
          </TabsList>

          {/* Types Tab - 7 plug types + 7 socket types */}
          <TabsContent value="types">
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Plug className="h-5 w-5 text-amber-500" />
                  7种插头型号
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {PLUG_TYPE_LIST.map(pt => <PlugTypeCard key={pt.code} pt={pt} />)}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-rose-500" />
                  7种插槽型号
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {SOCKET_TYPE_LIST.map(st => <PlugTypeCard key={st.code} pt={st} />)}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rules Tab - Compat matrix + rules list */}
          <TabsContent value="rules">
            <div className="space-y-6 mt-4">
              <CompatMatrix rules={compatRules} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cable className="h-5 w-5" />
                    兼容规则详情（{compatRules.length}条）
                  </CardTitle>
                  <CardDescription>7条直接匹配规则 + 4条跨型号转接规则</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {compatRules.map((rule, i) => {
                      const isDirect = rule.priority === 100
                      return (
                        <div key={i} className={`flex items-center gap-3 rounded-lg p-3 text-sm ${isDirect ? 'bg-green-50' : 'bg-amber-50'}`}>
                          <Badge className={`text-xs border-0 ${isDirect ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isDirect ? '直接' : '转接'}
                          </Badge>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge style={{ backgroundColor: (TYPE_COLOR_MAP[rule.plugTypeCode] || '#64748b') + '20', color: TYPE_COLOR_MAP[rule.plugTypeCode] }}>
                              {rule.plugTypeCode}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <Badge variant="outline" style={{ borderColor: TYPE_COLOR_MAP[rule.socketTypeCode], color: TYPE_COLOR_MAP[rule.socketTypeCode] }}>
                              {rule.socketTypeCode}
                            </Badge>
                          </div>
                          <span className="text-gray-600 flex-1">{rule.description}</span>
                          <Badge variant="outline" className="text-xs">优先级{rule.priority}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Instances Tab - Plug & Socket instances from DB */}
          <TabsContent value="instances">
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Plug className="h-5 w-5 text-blue-500" />
                  插头实例（{plugInstances.length}）
                </h3>
                {!initialized ? (
                  <Card><CardContent className="p-8 text-center text-gray-400">请先初始化插板系统</CardContent></Card>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {plugInstances.map(p => {
                      const PlugIcon = TYPE_ICON_MAP[p.plugTypeCode] || Plug
                      return (
                        <Card key={p.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: (TYPE_COLOR_MAP[p.plugTypeCode] || '#64748b') + '20' }}>
                                <PlugIcon className="h-4 w-4" style={{ color: TYPE_COLOR_MAP[p.plugTypeCode] }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{p.code}</code>
                                  <Badge className="text-xs border-0" style={{ backgroundColor: (TYPE_COLOR_MAP[p.plugTypeCode] || '#64748b') + '20', color: TYPE_COLOR_MAP[p.plugTypeCode] }}>
                                    {p.plugTypeCode}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">×{p.activeConnections}</Badge>
                                </div>
                                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                                {p.pinValues && (
                                  <div className="mt-1 text-xs bg-gray-50 rounded px-2 py-1 font-mono">
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
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-500" />
                  插槽实例（{socketInstances.length}）
                </h3>
                {!initialized ? (
                  <Card><CardContent className="p-8 text-center text-gray-400">请先初始化插板系统</CardContent></Card>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {socketInstances.map(s => {
                      const SocketIcon = TYPE_ICON_MAP[s.socketTypeCode] || Info
                      return (
                        <Card key={s.id} className={`hover:shadow-md transition-shadow ${s.isRequired && s.connectedPlugs.length === 0 ? 'border-red-300' : ''}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: (TYPE_COLOR_MAP[s.socketTypeCode] || '#64748b') + '20' }}>
                                <SocketIcon className="h-4 w-4" style={{ color: TYPE_COLOR_MAP[s.socketTypeCode] }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{s.code}</code>
                                  <Badge className="text-xs border-0" style={{ backgroundColor: (TYPE_COLOR_MAP[s.socketTypeCode] || '#64748b') + '20', color: TYPE_COLOR_MAP[s.socketTypeCode] }}>
                                    {s.socketTypeCode}
                                  </Badge>
                                  {s.isRequired && <Badge className="bg-red-100 text-red-700 text-xs border-0">必需</Badge>}
                                  {s.allowMultiple && <Badge className="bg-blue-100 text-blue-700 text-xs border-0">允许多插</Badge>}
                                </div>
                                <p className="text-sm font-medium text-gray-800">{s.name}</p>
                                {s.connectedPlugs.length > 0 && (
                                  <div className="mt-1 space-y-0.5">
                                    {s.connectedPlugs.map((cp: any) => (
                                      <div key={cp.id} className="flex items-center gap-2 text-xs bg-green-50 rounded px-2 py-0.5">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <span className="font-medium">{cp.plugName}</span>
                                        <span className="text-gray-400">({cp.plugTypeCode})</span>
                                        <button onClick={() => handleDisconnect(cp.id)} className="ml-auto text-red-400 hover:text-red-600">
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
              </div>
            </div>
          </TabsContent>

          {/* Models Tab - Vocab + UI + Slot + Plug model definitions */}
          <TabsContent value="models">
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Type className="h-5 w-5 text-amber-500" />
                  词汇型号（{vocabModels.length}）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vocabModels.map(model => (
                    <Card key={model.code} className="transition-all hover:shadow-md border-amber-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-amber-50 text-amber-700 border-0">词汇型</Badge>
                          <span className="text-xs text-muted-foreground">v{model.version}</span>
                        </div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>分类: {model.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {Object.entries(model.vocabulary).map(([word, meaning]) => (
                            <div key={word} className="rounded-md bg-amber-50 px-2 py-1 text-xs">
                              <span className="font-bold text-amber-800">{word}</span>
                              <span className="text-amber-600 ml-1">{meaning}</span>
                            </div>
                          ))}
                        </div>
                        {model.neuralMap && (
                          <>
                            <Separator />
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(model.neuralMap).map(([key, values]) => (
                                <Badge key={key} variant="outline" className="text-xs">{key} → {values.join(', ')}</Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Layout className="h-5 w-5 text-teal-500" />
                  UI型号（{uiModels.length}）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uiModels.map(model => {
                    const uiTypeColors: Record<string, string> = {
                      card: 'bg-teal-50 text-teal-700', form: 'bg-violet-50 text-violet-700',
                      list: 'bg-cyan-50 text-cyan-700', chart: 'bg-orange-50 text-orange-700',
                    }
                    return (
                      <Card key={model.code} className="transition-all hover:shadow-md border-teal-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge className={`${uiTypeColors[model.uiType] || 'bg-gray-50 text-gray-700'} border-0`}>{model.uiType.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">v{model.version}</span>
                          </div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="rounded-md bg-teal-50 p-2 text-xs text-teal-700">
                            {model.template && typeof model.template === 'object' && 'sections' in model.template && Array.isArray((model.template as Record<string, unknown>).sections)
                              ? ((model.template as Record<string, unknown>).sections as string[]).map(s => <Badge key={s} variant="secondary" className="mr-1 mb-1 text-xs">{s}</Badge>)
                              : model.template && typeof model.template === 'object' && 'fields' in model.template && Array.isArray((model.template as Record<string, unknown>).fields)
                                ? ((model.template as Record<string, unknown>).fields as string[]).map(s => <Badge key={s} variant="secondary" className="mr-1 mb-1 text-xs">{s}</Badge>)
                                : JSON.stringify(model.template)
                            }
                          </div>
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">插头输出</p>
                            <div className="flex flex-wrap gap-1">{model.plugSpec.outputs.map(p => <PortBadge key={p.name} port={p} direction="out" />)}</div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">插槽输入</p>
                            <div className="flex flex-wrap gap-1">{model.slotSpec.inputs.map(p => <PortBadge key={p.name} port={p} direction="in" />)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Plug className="h-5 w-5 text-emerald-500" />
                  插头型号（{plugs.length}）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plugs.map(plug => (
                    <Card key={plug.code} className="transition-all hover:shadow-md border-emerald-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-emerald-50 text-emerald-700 border-0">{plug.plugType.toUpperCase()}</Badge>
                          <span className="text-xs text-muted-foreground">v{plug.version}</span>
                        </div>
                        <CardTitle className="text-base">{plug.name}</CardTitle>
                        <CardDescription className="text-xs">{plug.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><p className="text-xs font-semibold text-muted-foreground mb-1">输入</p><div className="flex flex-wrap gap-1">{plug.interfaceSpec.inputs.map(p => <PortBadge key={p.name} port={p} direction="in" />)}</div></div>
                        <div><p className="text-xs font-semibold text-muted-foreground mb-1">输出</p><div className="flex flex-wrap gap-1">{plug.interfaceSpec.outputs.map(p => <PortBadge key={p.name} port={p} direction="out" />)}</div></div>
                        {plug.tags && plug.tags.length > 0 && <div className="flex flex-wrap gap-1 pt-1">{plug.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-rose-500" />
                  插槽型号（{slots.length}）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map(slot => (
                    <Card key={slot.code} className="transition-all hover:shadow-md border-rose-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-rose-50 text-rose-700 border-0">{slot.slotType.replace('_', ' ').toUpperCase()}</Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">容量:{slot.capacity}</span>
                            <span className="text-xs text-muted-foreground">v{slot.version}</span>
                          </div>
                        </div>
                        <CardTitle className="text-base">{slot.name}</CardTitle>
                        <CardDescription className="text-xs">{slot.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {slot.requiredType && <div className="text-xs"><span className="font-semibold text-muted-foreground">要求: </span><Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs">{slot.requiredType}</Badge></div>}
                        <div><p className="text-xs font-semibold text-muted-foreground mb-1">输入</p><div className="flex flex-wrap gap-1">{slot.interfaceSpec.inputs.map(p => <PortBadge key={p.name} port={p} direction="in" />)}</div></div>
                        <div><p className="text-xs font-semibold text-muted-foreground mb-1">输出</p><div className="flex flex-wrap gap-1">{slot.interfaceSpec.outputs.map(p => <PortBadge key={p.name} port={p} direction="out" />)}</div></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Compat Checker Tab */}
          <TabsContent value="compat">
            <section className="mt-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">兼容性检查</h2>
                <p className="text-muted-foreground">选择插头和插槽，检查它们是否可以安全连接</p>
              </div>
              <Card className="max-w-3xl mx-auto">
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">选择插头</label>
                      <Select value={selectedPlug} onValueChange={setSelectedPlug}>
                        <SelectTrigger><SelectValue placeholder="选择一个插头..." /></SelectTrigger>
                        <SelectContent>
                          {plugs.map(p => <SelectItem key={p.code} value={p.code}>🔌 {p.name} ({p.plugType})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">选择插槽</label>
                      <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                        <SelectTrigger><SelectValue placeholder="选择一个插槽..." /></SelectTrigger>
                        <SelectContent>
                          {slots.map(s => <SelectItem key={s.code} value={s.code}>🔲 {s.name} ({s.slotType})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCompatibilityCheck} disabled={!selectedPlug || !selectedSlot || checking}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                    {checking ? '检查中...' : '检查兼容性'}
                  </Button>
                  {(selectedPlugModel || selectedSlotModel) && (
                    <ConnectionVisualization plug={selectedPlugModel} slot={selectedSlotModel} result={compatResult} />
                  )}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Neural Tab */}
          <TabsContent value="neural">
            <div className="space-y-6 mt-4">
              <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    神经系统信号路由
                  </h3>
                  <div className="space-y-3 text-sm text-purple-700">
                    <p><strong>信号传递：</strong>插头插入插槽后，连接会注册到神经系统的一个信号频道。插头值变化时，信号沿频道传播到所有关注该插槽的模块。</p>
                    <p><strong>解耦设计：</strong>任何模块都不需要知道数据从哪来——只需要知道自己的插槽里插了什么型号的插头。神经系统负责信号路由，实现完全解耦。</p>
                    <p><strong>三种信号：</strong>plug:connected（插入）、plug:disconnected（拔出）、plug:updated（值变化）。</p>
                  </div>
                </CardContent>
              </Card>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  神经节点（{neuralNodes.length}）
                </h3>
                {neuralNodes.length > 0 ? (
                  <NeuralSignalViz nodes={neuralNodes} />
                ) : (
                  <Card><CardContent className="p-8 text-center text-gray-400">暂无神经节点数据</CardContent></Card>
                )}
              </div>
              {/* Signal flow visualization */}
              {initialized && socketInstances.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Cable className="h-5 w-5 text-emerald-500" />
                    信号流向（活跃连接）
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {socketInstances.filter(s => s.connectedPlugs.length > 0).map(s =>
                      s.connectedPlugs.map((cp: any) => (
                        <Card key={cp.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Badge style={{ backgroundColor: (TYPE_COLOR_MAP[cp.plugTypeCode] || '#64748b') + '20', color: TYPE_COLOR_MAP[cp.plugTypeCode] }} className="truncate">
                                  {cp.plugCode}
                                </Badge>
                                <span className="text-xs text-gray-400 shrink-0">({cp.plugTypeCode})</span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Badge variant="outline" style={{ borderColor: TYPE_COLOR_MAP[s.socketTypeCode], color: TYPE_COLOR_MAP[s.socketTypeCode] }} className="truncate">
                                  {s.code}
                                </Badge>
                                <span className="text-xs text-gray-400 shrink-0">({s.socketTypeCode})</span>
                              </div>
                              {cp.signalChannel && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  <Radio className="h-3 w-3 mr-1" />
                                  {cp.signalChannel}
                                </Badge>
                              )}
                              <button onClick={() => handleDisconnect(cp.id)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                                <Unplug className="h-4 w-4" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                    {socketInstances.filter(s => s.connectedPlugs.length > 0).length === 0 && (
                      <Card><CardContent className="p-8 text-center text-gray-400"><Cable className="h-8 w-8 mx-auto mb-2" />暂无活跃连接</CardContent></Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Architecture Overview */}
        <section className="pb-8">
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">架构总览</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { title: '插头型号', sub: '7种', desc: 'vocab/ui/data/action/signal/style/config', icon: Plug, gradient: 'from-amber-400 to-amber-600' },
                  { title: '插槽型号', sub: '7种', desc: 'display/render/input/handler/channel/apply/read', icon: Info, gradient: 'from-rose-400 to-rose-600' },
                  { title: '兼容规则', sub: '11条', desc: '7直接+4转接', icon: Cable, gradient: 'from-emerald-400 to-emerald-600' },
                  { title: '神经节点', sub: '3个', desc: '中继/传感器/执行器', icon: Brain, gradient: 'from-purple-400 to-purple-600' },
                ].map(item => (
                  <div key={item.title} className="text-center space-y-2">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

// Static plug/socket type lists for the types tab
const PLUG_TYPE_LIST = [
  { code: 'vocab', name: '词汇插头', description: '提供文字值，如"德值""功德"', pinCount: 1, pinDefs: [{ name: 'value', type: 'string', required: true, description: '词汇的当前显示值' }], icon: 'Type', color: '#eab308' },
  { code: 'ui', name: 'UI插头', description: '提供UI组件，如雷达图、进度条', pinCount: 2, pinDefs: [{ name: 'componentId', type: 'string', required: true, description: '组件标识' }, { name: 'props', type: 'object', required: false, description: '组件属性' }], icon: 'Layout', color: '#8b5cf6' },
  { code: 'data', name: '数据插头', description: '提供结构化数据，如统计、排行', pinCount: 2, pinDefs: [{ name: 'data', type: 'object', required: true, description: '数据内容' }, { name: 'schema', type: 'object', required: false, description: '数据结构' }], icon: 'Database', color: '#3b82f6' },
  { code: 'action', name: '行为插头', description: '提供可执行动作，如签到、导出', pinCount: 2, pinDefs: [{ name: 'handler', type: 'function', required: true, description: '执行函数' }, { name: 'params', type: 'object', required: false, description: '执行参数' }], icon: 'Zap', color: '#f97316' },
  { code: 'signal', name: '信号插头', description: '提供信号处理，如监听多巴胺', pinCount: 3, pinDefs: [{ name: 'channels', type: 'object', required: true, description: '信号频道' }, { name: 'handler', type: 'function', required: true, description: '处理函数' }, { name: 'priority', type: 'number', required: false, description: '优先级' }], icon: 'Radio', color: '#10b981' },
  { code: 'style', name: '样式插头', description: '提供主题配置，如暖色系、高对比度', pinCount: 2, pinDefs: [{ name: 'theme', type: 'object', required: true, description: '主题配置' }, { name: 'overrides', type: 'object', required: false, description: '局部覆盖' }], icon: 'Palette', color: '#ec4899' },
  { code: 'config', name: '配置插头', description: '提供配置参数，如权重、阈值', pinCount: 2, pinDefs: [{ name: 'config', type: 'object', required: true, description: '配置参数' }, { name: 'version', type: 'string', required: false, description: '版本号' }], icon: 'Settings', color: '#64748b' },
]

const SOCKET_TYPE_LIST = [
  { code: 'vocab_display', name: '词汇插槽', description: '接收文字值来显示', pinCount: 1, pinDefs: [{ name: 'displayText', type: 'string', required: true, description: '要显示的文字' }], icon: 'Type', color: '#eab308' },
  { code: 'ui_render', name: 'UI插槽', description: '接收UI组件来渲染', pinCount: 2, pinDefs: [{ name: 'componentId', type: 'string', required: true, description: '组件标识' }, { name: 'props', type: 'object', required: false, description: '组件属性' }], icon: 'Layout', color: '#8b5cf6' },
  { code: 'data_input', name: '数据插槽', description: '接收数据来处理', pinCount: 2, pinDefs: [{ name: 'data', type: 'object', required: true, description: '数据内容' }, { name: 'schema', type: 'object', required: false, description: '数据结构' }], icon: 'Database', color: '#3b82f6' },
  { code: 'action_handler', name: '行为插槽', description: '接收动作来执行', pinCount: 2, pinDefs: [{ name: 'handler', type: 'function', required: true, description: '执行函数' }, { name: 'params', type: 'object', required: false, description: '执行参数' }], icon: 'Zap', color: '#f97316' },
  { code: 'signal_channel', name: '信号插槽', description: '接收信号处理能力', pinCount: 3, pinDefs: [{ name: 'channels', type: 'object', required: true, description: '信号频道' }, { name: 'handler', type: 'function', required: true, description: '处理函数' }, { name: 'priority', type: 'number', required: false, description: '优先级' }], icon: 'Radio', color: '#10b981' },
  { code: 'style_apply', name: '样式插槽', description: '接收样式配置来应用', pinCount: 2, pinDefs: [{ name: 'theme', type: 'object', required: true, description: '主题配置' }, { name: 'overrides', type: 'object', required: false, description: '局部覆盖' }], icon: 'Palette', color: '#ec4899' },
  { code: 'config_read', name: '配置插槽', description: '接收配置参数来使用', pinCount: 2, pinDefs: [{ name: 'config', type: 'object', required: true, description: '配置参数' }, { name: 'version', type: 'string', required: false, description: '版本号' }], icon: 'Settings', color: '#64748b' },
]
