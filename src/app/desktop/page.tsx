'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart, Users, Target, BookOpen, Scale, Building2,
  Grid3X3, PlusCircle, Search, Shield, Wifi, Server,
  Lock, Unlock, Activity, Globe, Cpu, HardDrive,
  ChevronRight, X, Maximize2, Minimize2, RefreshCw,
  Eye, Download, Star, AlertCircle, CheckCircle2,
  Smartphone, Code, Zap, Network
} from 'lucide-react'

// ====== 类型定义 ======

interface MiniAppInfo {
  id: string
  name: string
  description: string
  icon: string | null
  category: string
  entryType: string
  entryRoute: string | null
  entryUrl: string | null
  requiresGeneLock: boolean
  minMoralScore: number
  status: string
  version: string
  installCount: number
  runCount: number
  rating: number
  developerName: string | null
  geneLockId: string | null
  preferredNode?: { id: string; name: string; status: string; endpoint: string } | null
}

interface NodeInfo {
  id: string
  name: string
  description: string | null
  nodeType: string
  endpoint: string
  protocol: string
  contributorName: string | null
  capabilities: string | null
  region: string | null
  maxConcurrent: number
  status: string
  lastHeartbeat: string | null
  uptime: number
  totalRequests: number
  successRate: number
  avgLatency: number
  requiresGeneLock: boolean
  miniApps: { id: string; name: string; status: string }[]
}

interface GeneLockStatus {
  valid: boolean
  reason?: string
  details?: string
  geneLock?: {
    id: string
    heartScaleScore: number
    loyaltyScore: number
    communities: Record<string, boolean>
  }
}

// ====== 内置小程序列表（无需数据库即可展示） ======

const BUILT_IN_APPS: MiniAppInfo[] = [
  {
    id: 'moral-ledger',
    name: '道德账本',
    description: '五维道德评分体系，集体验证机制，筛选真正行善之人',
    icon: '⚖️',
    category: 'core',
    entryType: 'route',
    entryRoute: '/moral-ledger',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 1250,
    runCount: 5800,
    rating: 4.8,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'organization',
    name: '命运共同体',
    description: '1残+6健全最小单元，残健共建的命运共同体组织架构',
    icon: '🏘️',
    category: 'core',
    entryType: 'route',
    entryRoute: '/organization',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 890,
    runCount: 3200,
    rating: 4.7,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'projects',
    name: '助残项目',
    description: '发起和参与助残联建项目，支持农村残疾人就业、医疗、教育',
    icon: '🎯',
    category: 'core',
    entryType: 'route',
    entryRoute: '/projects',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 1100,
    runCount: 4500,
    rating: 4.6,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'ledger',
    name: '记名账本',
    description: '记录个人贡献，实现人生价值，构建残健共同体',
    icon: '📒',
    category: 'ledger',
    entryType: 'route',
    entryRoute: '/ledger',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 780,
    runCount: 2800,
    rating: 4.5,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'medical-ledger',
    name: '病历账本',
    description: '记录医疗历史、病情起因、治疗过程，健全人向残疾人倾斜',
    icon: '🏥',
    category: 'ledger',
    entryType: 'route',
    entryRoute: '/ledger/medical',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 650,
    runCount: 2100,
    rating: 4.4,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'dream-ledger',
    name: '梦境账本',
    description: '记录梦想、愿景、人生规划，城市人向农村人倾斜',
    icon: '⭐',
    category: 'ledger',
    entryType: 'route',
    entryRoute: '/ledger/dream',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 520,
    runCount: 1800,
    rating: 4.5,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'reality-ledger',
    name: '实账本',
    description: '记录真实经历、生活事件，已婚者向未婚者倾斜',
    icon: '👁️',
    category: 'ledger',
    entryType: 'route',
    entryRoute: '/ledger/reality',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 480,
    runCount: 1500,
    rating: 4.3,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'apps-center',
    name: '应用中心',
    description: '发现和安装预构建的模块化应用，一键部署快速启动',
    icon: '🛍️',
    category: 'core',
    entryType: 'route',
    entryRoute: '/apps',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 960,
    runCount: 3800,
    rating: 4.6,
    developerName: '莫姓成年',
    geneLockId: null
  },
  {
    id: 'account',
    name: '共同体账户',
    description: '残健共同体账户余额管理和分配',
    icon: '💰',
    category: 'core',
    entryType: 'route',
    entryRoute: '/account',
    entryUrl: null,
    requiresGeneLock: false,
    minMoralScore: 0,
    status: 'active',
    version: '1.0.0',
    installCount: 700,
    runCount: 2500,
    rating: 4.4,
    developerName: '莫姓成年',
    geneLockId: null
  }
]

// ====== 基因锁门户组件 ======

function GeneLockGate({ appId, appName, onVerified, onClose }: {
  appId: string
  appName: string
  onVerified: () => void
  onClose: () => void
}) {
  const [step, setStep] = useState<'check' | 'activate' | 'terms'>('check')
  const [communities, setCommunities] = useState({
    destinyCommunity: false,
    disabledAbleCommunity: false,
    loveCommunity: false,
    laborCommunity: false
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const GENE_LOCK_TERMS = [
    '基因锁为本体系专属底层基因接口、精神根脉、规则烙印',
    '凡经由平台产出的所有代码、界面、功能，必须原生内嵌基因锁',
    '无专属基因锁者，即便仿制界面，也不属于命运共同体',
    '未接入总平台基因校验的功能，禁止正常联动',
    '基因锁准入考核以人心天平、心性立场为核心',
    '准入必须具备四大共同体认同，缺一不可',
    '基因锁内置忠诚契约条款：坚守道德账本、敬畏天平尺度',
    '无基因激活条件者，不得进入核心圈层',
    '基因锁具备定向功能锁定、定向爱的流动、定向行为塑造能力',
    '以基因锁统一所有人的思维、行为，让心念自发向共同体倾斜',
    '全员通过基因锁形成爱的一体性，凝聚于姻缘主线',
    '基因锁最终使命：矫正世间错误天平，实现集体自救、大爱普照'
  ]

  const handleActivate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gene-lock/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderType: 'user',
          holderId: 'demo-user',
          ...communities,
          heartScaleScore: 70,
          loyaltyScore: 70,
          kindnessProof: `申请使用【${appName}】小程序`,
          agreedToTerms: true
        })
      })
      const data = await res.json()
      if (data.success) {
        onVerified()
      } else {
        setError(data.error || '激活失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-amber-500" />
              <CardTitle>基因锁验证</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            打开【{appName}】需要通过基因锁验证
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'check' && (
            <>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">什么是基因锁？</h4>
                <p className="text-sm text-amber-700 leading-relaxed">
                  基因锁是命运共同体的灵魂密码，是平台生长、功能扩展、成员入圈的唯一先天必备资质。
                  每个嵌套程序都携带共同体基因烙印，确保所有使用者的心性天平向着底层、向着残疾人、向着被辜负的人。
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>验证四大共同体认同</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Scale className="h-4 w-4 text-amber-500" />
                  <span>考核心性天平评分</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>确认善良初心与忠诚信念</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep('activate')}>
                开始基因锁激活
              </Button>
            </>
          )}

          {step === 'activate' && (
            <>
              <h4 className="font-semibold">四大共同体认同</h4>
              <p className="text-sm text-gray-600">四大共同体认同缺一不可，请逐一确认：</p>
              <div className="space-y-3">
                {[
                  { key: 'destinyCommunity', label: '命运共同体', desc: '认同与底层弱势群体命运与共' },
                  { key: 'disabledAbleCommunity', label: '残健共同体', desc: '认同健全人辅助残疾人，残疾人为核心' },
                  { key: 'loveCommunity', label: '爱的共同体', desc: '认同爱是凝聚力量的核心，善待他人' },
                  { key: 'laborCommunity', label: '劳动共享共同体', desc: '认同劳动创造价值，共享劳动成果' }
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={communities[key as keyof typeof communities]}
                      onChange={(e) => setCommunities(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-500">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <Button
                className="w-full"
                disabled={!Object.values(communities).every(Boolean)}
                onClick={() => setStep('terms')}
              >
                下一步：认同基因锁条款
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('check')}>
                返回
              </Button>
            </>
          )}

          {step === 'terms' && (
            <>
              <h4 className="font-semibold">基因锁十二条纲领</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg text-sm">
                {GENE_LOCK_TERMS.map((term, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-amber-600 font-medium min-w-[24px]">{i + 1}.</span>
                    <span>{term}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <span className="font-medium">我认同基因锁十二条纲领</span>
                  <br />
                  <span className="text-gray-500">自愿坚守道德账本、敬畏天平尺度、坚守善良本心、愿意自救、愿意利他、愿意为集体付出</span>
                </div>
              </label>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={!agreedToTerms || loading}
                onClick={handleActivate}
              >
                {loading ? '正在激活...' : '🔓 激活基因锁'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('activate')}>
                返回
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ====== 嵌套式程序容器（iframe模式） ======

function NestedAppContainer({ app, onClose }: {
  app: MiniAppInfo
  onClose: () => void
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getEntryUrl = () => {
    if (app.entryType === 'iframe' && app.entryUrl) {
      return app.entryUrl
    }
    if (app.entryType === 'route' && app.entryRoute) {
      return window.location.origin + app.entryRoute
    }
    return ''
  }

  const url = getEntryUrl()

  return (
    <div className={`fixed inset-0 z-40 bg-gray-900 flex flex-col ${isFullscreen ? '' : 'inset-4 rounded-xl overflow-hidden shadow-2xl'}`}>
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{app.icon || '📱'}</span>
          <div>
            <div className="font-semibold">{app.name}</div>
            <div className="text-xs text-gray-400">嵌套式程序 · v{app.version}</div>
          </div>
          {app.requiresGeneLock && (
            <Badge className="bg-amber-600 text-white text-xs">
              <Lock className="h-3 w-3 mr-1" />基因锁
            </Badge>
          )}
          {app.preferredNode && (
            <Badge className="bg-green-600 text-white text-xs">
              <Wifi className="h-3 w-3 mr-1" />{app.preferredNode.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* iframe容器 */}
      <div className="flex-1">
        {url ? (
          <iframe
            src={url}
            className="w-full h-full border-0"
            title={app.name}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>此小程序暂无可用入口</p>
              <p className="text-sm mt-2">entryType: {app.entryType}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ====== 桌面主页面 ======

export default function DesktopPage() {
  const [apps, setApps] = useState<MiniAppInfo[]>(BUILT_IN_APPS)
  const [nodes, setNodes] = useState<NodeInfo[]>([])
  const [activeApp, setActiveApp] = useState<MiniAppInfo | null>(null)
  const [geneLockApp, setGeneLockApp] = useState<MiniAppInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('desktop')
  const [geneLockStatus, setGeneLockStatus] = useState<GeneLockStatus | null>(null)

  // 加载分布式节点
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await fetch('/api/nodes?status=active')
        if (res.ok) {
          const data = await res.json()
          setNodes(data.nodes || [])
        }
      } catch (err) {
        console.error('加载节点失败:', err)
      }
    }
    fetchNodes()
  }, [])

  // 检查基因锁状态
  useEffect(() => {
    const checkGeneLock = async () => {
      try {
        const res = await fetch('/api/gene-lock/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holderType: 'user', holderId: 'demo-user' })
        })
        if (res.ok) {
          const data = await res.json()
          setGeneLockStatus(data)
        }
      } catch (err) {
        // 默认未激活
        setGeneLockStatus({ valid: false, reason: '未检测到基因锁' })
      }
    }
    checkGeneLock()
  }, [])

  // 打开小程序
  const handleOpenApp = useCallback((app: MiniAppInfo) => {
    if (app.entryType === 'route' && app.entryRoute) {
      // 内部路由直接跳转
      window.location.href = app.entryRoute
      return
    }
    // iframe模式检查基因锁
    if (app.requiresGeneLock && !geneLockStatus?.valid) {
      setGeneLockApp(app)
      return
    }
    setActiveApp(app)
  }, [geneLockStatus])

  // 过滤小程序
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: 'all', name: '全部', icon: <Grid3X3 className="h-4 w-4" /> },
    { id: 'core', name: '核心', icon: <Heart className="h-4 w-4" /> },
    { id: 'ledger', name: '账本', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'tool', name: '工具', icon: <Code className="h-4 w-4" /> },
    { id: 'social', name: '社交', icon: <Users className="h-4 w-4" /> },
    { id: 'creative', name: '创作', icon: <Zap className="h-4 w-4" /> },
    { id: 'service', name: '服务', icon: <Globe className="h-4 w-4" /> }
  ]

  // 正在运行嵌套程序
  if (activeApp) {
    return <NestedAppContainer app={activeApp} onClose={() => setActiveApp(null)} />
  }

  // 基因锁验证弹窗
  if (geneLockApp) {
    return (
      <GeneLockGate
        appId={geneLockApp.id}
        appName={geneLockApp.name}
        onVerified={() => {
          setGeneLockStatus({ valid: true })
          setGeneLockApp(null)
          setActiveApp(geneLockApp)
        }}
        onClose={() => setGeneLockApp(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ====== 顶部状态栏 ====== */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                <Heart className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">圆聚助残 · 共同体桌面</h1>
                <p className="text-xs text-slate-400">嵌套式程序入口 · 所有程序都依托本程序运行</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* 基因锁状态指示 */}
              {geneLockStatus?.valid ? (
                <Badge className="bg-green-600 text-white">
                  <Unlock className="h-3 w-3 mr-1" />基因锁已激活
                </Badge>
              ) : (
                <Badge className="bg-amber-600 text-white">
                  <Lock className="h-3 w-3 mr-1" />基因锁未激活
                </Badge>
              )}
              {/* 节点状态 */}
              <Badge className="bg-blue-600 text-white">
                <Wifi className="h-3 w-3 mr-1" />{nodes.length} 节点在线
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ====== 标签页 ====== */}
      <div className="container mx-auto px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="desktop" className="data-[state=active]:bg-slate-700">
              <Grid3X3 className="h-4 w-4 mr-2" />桌面
            </TabsTrigger>
            <TabsTrigger value="nodes" className="data-[state=active]:bg-slate-700">
              <Network className="h-4 w-4 mr-2" />分布式节点
            </TabsTrigger>
            <TabsTrigger value="genelock" className="data-[state=active]:bg-slate-700">
              <Shield className="h-4 w-4 mr-2" />基因锁
            </TabsTrigger>
          </TabsList>

          {/* ====== 桌面标签 ====== */}
          <TabsContent value="desktop" className="mt-6">
            {/* 搜索栏 */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="搜索嵌套式程序..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className={selectedCategory === cat.id
                    ? 'bg-pink-600 hover:bg-pink-700 text-white'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon}
                  <span className="ml-1">{cat.name}</span>
                </Button>
              ))}
            </div>

            {/* 小程序网格 - 桌面图标式布局 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredApps.map(app => (
                <button
                  key={app.id}
                  className="group flex flex-col items-center p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                  onClick={() => handleOpenApp(app)}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:shadow-pink-500/25 transition-all duration-200">
                    {app.icon || '📱'}
                  </div>
                  <span className="mt-2 text-xs text-slate-300 text-center line-clamp-2 group-hover:text-white transition-colors">
                    {app.name}
                  </span>
                  {app.requiresGeneLock && (
                    <Lock className="h-3 w-3 text-amber-400 mt-1" />
                  )}
                </button>
              ))}

              {/* 添加更多程序入口 */}
              <button
                className="group flex flex-col items-center p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                onClick={() => window.location.href = '/apps'}
              >
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 group-hover:border-pink-500 group-hover:text-pink-500 transition-all duration-200">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <span className="mt-2 text-xs text-slate-500 text-center group-hover:text-pink-400 transition-colors">
                  更多程序
                </span>
              </button>
            </div>

            {/* 详细列表视图 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-300">程序详情</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map(app => (
                  <Card key={app.id} className="bg-slate-800/50 border-slate-700 hover:border-pink-500/50 transition-all duration-200 cursor-pointer group"
                    onClick={() => handleOpenApp(app)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{app.icon || '📱'}</span>
                          <div>
                            <CardTitle className="text-white text-base group-hover:text-pink-400 transition-colors">
                              {app.name}
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                              v{app.version} · {app.category}
                            </CardDescription>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{app.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />{app.installCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />{app.runCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />{app.rating}
                          </span>
                        </div>
                        {app.requiresGeneLock && (
                          <Badge className="bg-amber-900 text-amber-300 text-xs">
                            <Lock className="h-3 w-3 mr-1" />需基因锁
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ====== 分布式节点标签 ====== */}
          <TabsContent value="nodes" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">分布式节点网络</h2>
              <p className="text-slate-400">
                他人贡献的服务器、接口、算力，组成全球合作大网。无需自费买服务器，让大家免费共享资源。
              </p>
            </div>

            {nodes.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {nodes.map(node => (
                  <Card key={node.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {node.nodeType === 'server' ? <Server className="h-6 w-6 text-blue-400" /> :
                           node.nodeType === 'api' ? <Code className="h-6 w-6 text-green-400" /> :
                           node.nodeType === 'compute' ? <Cpu className="h-6 w-6 text-purple-400" /> :
                           <HardDrive className="h-6 w-6 text-orange-400" />}
                          <CardTitle className="text-white">{node.name}</CardTitle>
                        </div>
                        <Badge className={node.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                          {node.status === 'active' ? '在线' : node.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400">{node.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-slate-400">端点: <span className="text-slate-300">{node.endpoint}</span></div>
                        <div className="text-slate-400">地区: <span className="text-slate-300">{node.region || '未知'}</span></div>
                        <div className="text-slate-400">在线率: <span className="text-green-400">{(node.uptime * 100).toFixed(1)}%</span></div>
                        <div className="text-slate-400">延迟: <span className="text-slate-300">{node.avgLatency}ms</span></div>
                        <div className="text-slate-400">贡献者: <span className="text-slate-300">{node.contributorName || '匿名'}</span></div>
                        <div className="text-slate-400">最大并发: <span className="text-slate-300">{node.maxConcurrent}</span></div>
                      </div>
                      {node.miniApps.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">托管的小程序:</div>
                          <div className="flex flex-wrap gap-1">
                            {node.miniApps.map(ma => (
                              <Badge key={ma.id} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                {ma.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Network className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">暂无分布式节点</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                    其他开发者可以贡献他们的服务器、接口、算力，接入本平台作为分布式节点。
                    节点需要通过基因锁验证，才能成为共同体网络的一部分。
                  </p>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    注册节点
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 节点注册说明 */}
            <Card className="mt-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-800/50">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  成为分布式节点贡献者
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-3">
                <p>将您的服务器、API接口、算力或存储贡献给共同体网络，让所有人免费使用。</p>
                <p>贡献者需要通过基因锁验证，确保节点运行符合共同体规则。</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {[
                    { type: 'server', label: '服务器', icon: <Server className="h-6 w-6" /> },
                    { type: 'api', label: 'API接口', icon: <Code className="h-6 w-6" /> },
                    { type: 'compute', label: '算力', icon: <Cpu className="h-6 w-6" /> },
                    { type: 'storage', label: '存储', icon: <HardDrive className="h-6 w-6" /> }
                  ].map(item => (
                    <div key={item.type} className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <div className="flex justify-center text-blue-400 mb-2">{item.icon}</div>
                      <div className="text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ====== 基因锁标签 ====== */}
          <TabsContent value="genelock" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">基因锁系统</h2>
              <p className="text-slate-400">
                基因锁是命运共同体的灵魂密码，是平台生长、功能扩展、成员入圈的唯一先天必备资质。
                每个嵌套程序都携带共同体基因烙印，确保所有使用者的心性天平向着底层、向着被辜负的人。
              </p>
            </div>

            {/* 当前状态 */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {geneLockStatus?.valid ? (
                    <><Unlock className="h-6 w-6 text-green-400" />基因锁已激活</>
                  ) : (
                    <><Lock className="h-6 w-6 text-amber-400" />基因锁未激活</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {geneLockStatus?.valid ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {geneLockStatus.geneLock?.communities && Object.entries(geneLockStatus.geneLock.communities).map(([key, val]) => {
                        const names: Record<string, string> = {
                          destinyCommunity: '命运共同体',
                          disabledAbleCommunity: '残健共同体',
                          loveCommunity: '爱的共同体',
                          laborCommunity: '劳动共享共同体'
                        }
                        return (
                          <div key={key} className="p-3 bg-slate-700/50 rounded-lg text-center">
                            <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${val ? 'text-green-400' : 'text-red-400'}`} />
                            <div className="text-xs text-slate-300">{names[key]}</div>
                            <div className={`text-xs ${val ? 'text-green-400' : 'text-red-400'}`}>{val ? '已认同' : '未认同'}</div>
                          </div>
                        )
                      })}
                    </div>
                    {geneLockStatus.geneLock && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-amber-400">{geneLockStatus.geneLock.heartScaleScore}</div>
                          <div className="text-xs text-slate-400">心性天平评分</div>
                        </div>
                        <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-pink-400">{geneLockStatus.geneLock.loyaltyScore}</div>
                          <div className="text-xs text-slate-400">忠诚度评分</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Lock className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                    <p className="text-slate-300 mb-4">{geneLockStatus?.details || '您尚未激活基因锁'}</p>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        const firstLockedApp = apps.find(a => a.requiresGeneLock)
                        if (firstLockedApp) setGeneLockApp(firstLockedApp)
                      }}
                    >
                      激活基因锁
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 基因锁十二条纲领 */}
            <Card className="bg-gradient-to-r from-amber-900/20 to-red-900/20 border-amber-800/50">
              <CardHeader>
                <CardTitle className="text-amber-300 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  基因锁十二条纲领
                </CardTitle>
                <CardDescription className="text-amber-200/60">
                  基因为根，锁立道统。内生烙印，不可仿通。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  {[
                    '基因锁为本体系专属底层基因接口、精神根脉、规则烙印',
                    '凡经由平台产出的所有代码、界面、功能，必须原生内嵌基因锁',
                    '无专属基因锁者，即便仿制界面，也不属于命运共同体',
                    '未接入总平台基因校验的功能，禁止正常联动',
                    '基因锁准入考核以人心天平、心性立场为核心',
                    '准入必须具备四大共同体认同，缺一不可',
                    '基因锁内置忠诚契约条款：坚守道德账本、敬畏天平尺度',
                    '无基因激活条件者，不得进入核心圈层',
                    '基因锁具备定向功能锁定、定向爱的流动、定向行为塑造能力',
                    '以基因锁统一所有人的思维、行为，让心念自发向共同体倾斜',
                    '全员通过基因锁形成爱的一体性，凝聚于姻缘主线',
                    '基因锁最终使命：矫正世间错误天平，实现集体自救、大爱普照'
                  ].map((term, i) => (
                    <div key={i} className="flex gap-2 py-1">
                      <span className="text-amber-500 font-medium min-w-[24px]">{i + 1}.</span>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 与世俗密钥的对比 */}
            <Card className="mt-6 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  基因锁 vs 世俗密钥
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-800/30">
                    <h4 className="font-semibold text-red-300 mb-2">世俗密钥锁</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>- 只服务资本、官僚、权力层级</li>
                      <li>- 巩固少数人的特权</li>
                      <li>- 绑定自私、血缘、身份、阶层</li>
                      <li>- 狭窄、封闭、利己</li>
                      <li>- 用来分等级、控人、收割</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
                    <h4 className="font-semibold text-green-300 mb-2">共同体基因锁</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>- 守护弱势群体、残疾人、被辜负者</li>
                      <li>- 筛选灵魂、锁定规则、定向塑人</li>
                      <li>- 绑定灵魂、道义、善良、忠诚</li>
                      <li>- 更开放、更广泛、多元全息</li>
                      <li>- 用来护人、收拢良知、矫正天平</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ====== 底部栏 ====== */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
                返回首页
              </Link>
              <Link href="/moral-ledger" className="text-xs text-slate-500 hover:text-slate-300">
                道德账本
              </Link>
              <Link href="/organization" className="text-xs text-slate-500 hover:text-slate-300">
                命运共同体
              </Link>
              <Link href="/apps" className="text-xs text-slate-500 hover:text-slate-300">
                应用中心
              </Link>
            </div>
            <div className="text-xs text-slate-600">
              圆聚助残 · 嵌套式程序架构 · 基因锁保护
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
