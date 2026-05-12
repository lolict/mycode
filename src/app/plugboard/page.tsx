'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

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

interface PlugModel {
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

interface SlotModel {
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

interface CompatibilityResult {
  plugCode: string
  slotCode: string
  compatible: boolean
  typeMatch: boolean
  interfaceCompatible: boolean
  errors: string[]
  warnings: string[]
}

// === Color helpers ===

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  vocab:  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  ui:     { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' },
  slot:   { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },
  plug:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  neural: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
}

function getTypeStyle(type: string) {
  return typeColors[type] || typeColors.plug
}

// === Port Badge ===

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

// === PlugCard ===

function PlugCard({ plug }: { plug: PlugModel }) {
  const style = getTypeStyle(plug.plugType)
  return (
    <Card className={`transition-all hover:shadow-md ${style.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={`${style.bg} ${style.text} border-0`}>{plug.plugType.toUpperCase()}</Badge>
          <span className="text-xs text-muted-foreground">v{plug.version}</span>
        </div>
        <CardTitle className="text-lg">{plug.name}</CardTitle>
        <CardDescription>{plug.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">编码: {plug.code}</div>
        <Separator />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">输入端口</p>
          <div className="flex flex-wrap gap-1">
            {plug.interfaceSpec.inputs.map(p => <PortBadge key={p.name} port={p} direction="in" />)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">输出端口</p>
          <div className="flex flex-wrap gap-1">
            {plug.interfaceSpec.outputs.map(p => <PortBadge key={p.name} port={p} direction="out" />)}
          </div>
        </div>
        {plug.tags && plug.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {plug.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// === SlotCard ===

function SlotCard({ slot }: { slot: SlotModel }) {
  const style = getTypeStyle(slot.slotType)
  return (
    <Card className={`transition-all hover:shadow-md ${style.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={`${style.bg} ${style.text} border-0`}>{slot.slotType.toUpperCase()}</Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">容量: {slot.capacity}</span>
            <span className="text-xs text-muted-foreground">v{slot.version}</span>
          </div>
        </div>
        <CardTitle className="text-lg">{slot.name}</CardTitle>
        <CardDescription>{slot.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {slot.requiredType && (
          <div className="text-xs">
            <span className="font-semibold text-muted-foreground">要求插头类型: </span>
            <Badge className={`${getTypeStyle(slot.requiredType).bg} ${getTypeStyle(slot.requiredType).text} border-0 text-xs`}>
              {slot.requiredType}
            </Badge>
          </div>
        )}
        <Separator />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">输入端口</p>
          <div className="flex flex-wrap gap-1">
            {slot.interfaceSpec.inputs.map(p => <PortBadge key={p.name} port={p} direction="in" />)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">输出端口</p>
          <div className="flex flex-wrap gap-1">
            {slot.interfaceSpec.outputs.map(p => <PortBadge key={p.name} port={p} direction="out" />)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// === VocabModelCard ===

function VocabModelCard({ model }: { model: VocabModel }) {
  return (
    <Card className="transition-all hover:shadow-md border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-amber-50 text-amber-700 border-0">词汇型</Badge>
          <span className="text-xs text-muted-foreground">v{model.version}</span>
        </div>
        <CardTitle className="text-lg">{model.name}</CardTitle>
        <CardDescription>分类: {model.category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground mb-2">词汇表</div>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
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
            <div className="text-xs font-medium text-muted-foreground mb-1">神经映射</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(model.neuralMap).map(([key, values]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key} → {values.join(', ')}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// === UIModelCard ===

function UIModelCard({ model }: { model: UIModel }) {
  const uiTypeColors: Record<string, string> = {
    card: 'bg-teal-50 text-teal-700',
    form: 'bg-indigo-50 text-indigo-700',
    list: 'bg-cyan-50 text-cyan-700',
    chart: 'bg-orange-50 text-orange-700',
    layout: 'bg-pink-50 text-pink-700',
    dialog: 'bg-violet-50 text-violet-700',
  }
  return (
    <Card className="transition-all hover:shadow-md border-teal-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={`${uiTypeColors[model.uiType] || 'bg-gray-50 text-gray-700'} border-0`}>
            {model.uiType.toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground">v{model.version}</span>
        </div>
        <CardTitle className="text-lg">{model.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">模板配置</div>
        <div className="rounded-md bg-teal-50 p-2 text-xs text-teal-700">
          {model.template && typeof model.template === 'object' && 'sections' in model.template && Array.isArray((model.template as Record<string, unknown>).sections) 
            ? ((model.template as Record<string, unknown>).sections as string[]).map(s => (
                <Badge key={s} variant="secondary" className="mr-1 mb-1 text-xs">{s}</Badge>
              ))
            : model.template && typeof model.template === 'object' && 'fields' in model.template && Array.isArray((model.template as Record<string, unknown>).fields)
              ? ((model.template as Record<string, unknown>).fields as string[]).map(s => (
                  <Badge key={s} variant="secondary" className="mr-1 mb-1 text-xs">{s}</Badge>
                ))
              : JSON.stringify(model.template)
          }
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">插头规格 (输出)</p>
          <div className="flex flex-wrap gap-1">
            {model.plugSpec.outputs.map(p => <PortBadge key={p.name} port={p} direction="out" />)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">插槽规格 (输入)</p>
          <div className="flex flex-wrap gap-1">
            {model.slotSpec.inputs.map(p => <PortBadge key={p.name} port={p} direction="in" />)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// === Connection Visualization ===

function ConnectionVisualization({ plug, slot, result }: { plug: PlugModel | null; slot: SlotModel | null; result: CompatibilityResult | null }) {
  if (!plug || !slot) return null

  const compatible = result?.compatible ?? false

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center justify-center gap-4 w-full">
        {/* Plug side */}
        <div className={`flex-shrink-0 rounded-xl border-2 p-4 text-center min-w-[140px] transition-all ${
          compatible ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="text-2xl mb-1">🔌</div>
          <div className="text-sm font-bold">{plug.name}</div>
          <div className="text-xs text-muted-foreground">{plug.plugType}</div>
        </div>

        {/* Connection line */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className={`h-1 w-full rounded-full transition-all ${
            compatible ? 'bg-emerald-400' : 'bg-gray-300'
          }`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 ${
            compatible ? 'bg-emerald-400 text-white' : 'bg-gray-300 text-white'
          }`}>
            {compatible ? '✓' : '✗'}
          </div>
        </div>

        {/* Slot side */}
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
            <Alert variant="success">
              <AlertTitle>兼容 ✓</AlertTitle>
              <AlertDescription>插头与插槽接口匹配，可以安全连接。</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>不兼容 ✗</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {result.warnings.length > 0 && (
            <Alert variant="warning">
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1">
                  {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}

// === Main Page ===

export default function PlugBoardPage() {
  const [plugs, setPlugs] = useState<PlugModel[]>([])
  const [slots, setSlots] = useState<SlotModel[]>([])
  const [vocabModels, setVocabModels] = useState<VocabModel[]>([])
  const [uiModels, setUIModels] = useState<UIModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Compatibility check state
  const [selectedPlug, setSelectedPlug] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [plugsRes, slotsRes, vocabRes, uiRes] = await Promise.all([
          fetch('/api/plugboard/plugs'),
          fetch('/api/plugboard/slots'),
          fetch('/api/plugboard/vocab-models'),
          fetch('/api/plugboard/ui-models'),
        ])

        if (!plugsRes.ok || !slotsRes.ok || !vocabRes.ok || !uiRes.ok) {
          throw new Error('获取数据失败')
        }

        const [plugsData, slotsData, vocabData, uiData] = await Promise.all([
          plugsRes.json(),
          slotsRes.json(),
          vocabRes.json(),
          uiRes.json(),
        ])

        setPlugs(plugsData.plugs)
        setSlots(slotsData.slots)
        setVocabModels(vocabData.vocabModels)
        setUIModels(uiData.uiModels)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const selectedPlugModel = plugs.find(p => p.code === selectedPlug) || null
  const selectedSlotModel = slots.find(s => s.code === selectedSlot) || null

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
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-6">
              <span>🔌</span>
              <span>插板型号架构系统</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              插板型号架构
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              通用插件化模块系统 — 所有组件都是"可插拔"的，通过统一的接口标准实现
              <span className="text-emerald-200 font-semibold">插头</span>和
              <span className="text-cyan-200 font-semibold">插槽</span>的互插兼容。
              词汇型号、UI型号、插槽型号、插头型号，类型不同、功能不同，但接口统一。
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '插头型号', count: plugs.length, icon: '🔌', color: 'from-emerald-500 to-emerald-600' },
            { label: '插槽型号', count: slots.length, icon: '🔲', color: 'from-rose-500 to-rose-600' },
            { label: '词汇型号', count: vocabModels.length, icon: '📖', color: 'from-amber-500 to-amber-600' },
            { label: 'UI型号', count: uiModels.length, icon: '🎨', color: 'from-teal-500 to-teal-600' },
          ].map(stat => (
            <Card key={stat.label} className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="p-4 text-center">
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <div className="text-3xl font-bold text-gray-900">{stat.count}</div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.icon} {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Sections */}
        <Tabs defaultValue="plug">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="plug" className="py-2.5 text-sm">🔌 插头型号</TabsTrigger>
            <TabsTrigger value="slot" className="py-2.5 text-sm">🔲 插槽型号</TabsTrigger>
            <TabsTrigger value="vocab" className="py-2.5 text-sm">📖 词汇型号</TabsTrigger>
            <TabsTrigger value="ui" className="py-2.5 text-sm">🎨 UI型号</TabsTrigger>
          </TabsList>

          {/* Plugs Tab */}
          <TabsContent value="plug">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-6 w-20 mb-2" /><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
                ))}
              </div>
            ) : plugs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">暂无插头型号数据</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {plugs.map(plug => <PlugCard key={plug.code} plug={plug} />)}
              </div>
            )}
          </TabsContent>

          {/* Slots Tab */}
          <TabsContent value="slot">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-6 w-20 mb-2" /><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">暂无插槽型号数据</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {slots.map(slot => <SlotCard key={slot.code} slot={slot} />)}
              </div>
            )}
          </TabsContent>

          {/* Vocab Tab */}
          <TabsContent value="vocab">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[1, 2].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-5 w-36" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : vocabModels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">暂无词汇型号数据</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {vocabModels.map(model => <VocabModelCard key={model.code} model={model} />)}
              </div>
            )}
          </TabsContent>

          {/* UI Tab */}
          <TabsContent value="ui">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[1, 2].map(i => (
                  <Card key={i}><CardHeader><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-5 w-36" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : uiModels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">暂无UI型号数据</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {uiModels.map(model => <UIModelCard key={model.code} model={model} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Compatibility Check Section */}
        <section>
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
                    <SelectTrigger>
                      <SelectValue placeholder="选择一个插头..." />
                    </SelectTrigger>
                    <SelectContent>
                      {plugs.map(p => (
                        <SelectItem key={p.code} value={p.code}>
                          🔌 {p.name} ({p.plugType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">选择插槽</label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择一个插槽..." />
                    </SelectTrigger>
                    <SelectContent>
                      {slots.map(s => (
                        <SelectItem key={s.code} value={s.code}>
                          🔲 {s.name} ({s.slotType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleCompatibilityCheck}
                disabled={!selectedPlug || !selectedSlot || checking}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                {checking ? '检查中...' : '检查兼容性'}
              </Button>

              {/* Visualization */}
              {(selectedPlugModel || selectedSlotModel) && (
                <ConnectionVisualization
                  plug={selectedPlugModel}
                  slot={selectedSlotModel}
                  result={compatResult}
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Architecture Diagram */}
        <section className="pb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">架构总览</h2>
            <p className="text-muted-foreground">插板型号架构的四种型号关系</p>
          </div>
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: '插头型号', sub: 'Plug', desc: '提供功能输出，插入插槽', icon: '🔌', gradient: 'from-emerald-400 to-emerald-600' },
                  { title: '插槽型号', sub: 'Slot', desc: '接收插头输入，承载功能', icon: '🔲', gradient: 'from-rose-400 to-rose-600' },
                  { title: '词汇型号', sub: 'Vocab', desc: '道德词汇定义，双面接口', icon: '📖', gradient: 'from-amber-400 to-amber-600' },
                  { title: 'UI型号', sub: 'UI', desc: '界面组件模板，双面接口', icon: '🎨', gradient: 'from-teal-400 to-teal-600' },
                ].map(item => (
                  <div key={item.sub} className="text-center space-y-2">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-2xl shadow-lg`}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">插头</span>
                  <span className="text-lg">⇄</span>
                  <span className="px-3 py-1 rounded-md bg-rose-50 text-rose-700 font-medium">插槽</span>
                  <span className="mx-2 text-muted-300">|</span>
                  <span className="px-3 py-1 rounded-md bg-amber-50 text-amber-700 font-medium">词汇</span>
                  <span className="text-lg">⇄</span>
                  <span className="px-3 py-1 rounded-md bg-teal-50 text-teal-700 font-medium">UI</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
