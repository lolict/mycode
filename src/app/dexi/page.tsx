'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Wrench, Settings, PiggyBank, Cloud, Building2, PaintBucket,
  Truck, Car, Navigation, Clock,
  Heart, ShoppingBag, Banknote, Shield, Award,
  Stethoscope, HeartPulse, Sparkles,
  BookOpen, Mic, Brush, GraduationCap, Microscope, School, Megaphone,
  Handshake, Eye, BadgeCheck, Scale, Newspaper, Radio, Network, Home, Crown,
  Rocket, Compass, Camera, FileText, Hammer,
  Calculator, Archive, Headphones,
  Siren, AlertTriangle, LifeBuoy, ShieldAlert,
  Search, ArrowRight, Grid3X3, BarChart3, Zap, Star, ChevronRight,
  ArrowLeft, Plug, Cable, Brain, Activity
} from 'lucide-react'
import TabBar from '@/components/tab-bar'

// 图标映射
const iconMap: Record<string, any> = {
  Wrench, Settings, PiggyBank, Cloud, Building2, PaintBucket,
  Truck, Car, Navigation, Clock,
  Heart, ShoppingBag, Banknote, Shield, Award,
  Stethoscope, HeartPulse, Sparkles,
  BookOpen, Mic, Brush, GraduationCap, Microscope, School, Megaphone,
  Handshake, Eye, BadgeCheck, Scale, Newspaper, Radio, Network, Home, Crown,
  Rocket, Compass, Camera, FileText, Hammer,
  Calculator, Archive, Headphones,
  Siren, AlertTriangle, LifeBuoy, ShieldAlert,
  Drama: Mic, Vote: Scale, SearchCheck: Eye, ShieldCheck: Shield,
  HandHeart: Heart, HandHelping: Heart,
}

// 分类图标映射
const categoryIconMap: Record<string, any> = {
  infrastructure: Building2,
  transport: Car,
  finance: Award,
  medical: Stethoscope,
  culture: BookOpen,
  governance: Scale,
  emergency: Siren,
  social: Megaphone,
  innovation: Rocket,
  records: Archive,
}

interface ModuleInfo {
  code: string
  name: string
  fullName: string
  category: string
  categoryLabel: string
  description: string
  icon: string
  color: string
  features: string[]
  status: string
  priority: number
  recordCount?: number
}

interface CategoryInfo {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

interface StatsInfo {
  total: number
  active: number
  developing: number
  planned: number
  categories: number
}

export default function DexiHub() {
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [stats, setStats] = useState<StatsInfo | null>(null)
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({})
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const res = await fetch('/api/dexi/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data.modules)
        setCategories(data.categories)
        setStats(data.stats)
        setRecordCounts(data.recordCounts || {})
      }
    } catch (error) {
      console.error('加载德系模块失败:', error)
      // 使用内置数据作为后备
    } finally {
      setLoading(false)
    }
  }

  const filteredModules = modules.filter(m => {
    const matchCategory = activeCategory === 'all' || m.category === activeCategory
    const matchSearch = !searchQuery ||
      m.name.includes(searchQuery) ||
      m.fullName.includes(searchQuery) ||
      m.description.includes(searchQuery) ||
      m.features.some(f => f.includes(searchQuery))
    return matchCategory && matchSearch
  })

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    developing: 'bg-yellow-100 text-yellow-700',
    planned: 'bg-gray-100 text-gray-600',
  }

  const statusLabels: Record<string, string> = {
    active: '已上线',
    developing: '开发中',
    planned: '规划中',
  }

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Zap
  }

  const getCategoryIcon = (catId: string) => {
    return categoryIconMap[catId] || Grid3X3
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 54 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-xs font-bold"
              style={{
                left: `${(i % 9) * 11 + 1}%`,
                top: `${Math.floor(i / 9) * 20 + 5}%`,
                opacity: 0.3 + (i % 3) * 0.2,
                fontSize: `${8 + (i % 3) * 2}px`,
              }}
            >
              德
            </div>
          ))}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/apps">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-1" />
                应用中心
              </Button>
            </Link>
          </div>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-4xl font-bold">德</span>
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-900">54</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              德系生态
            </h1>
            <p className="text-xl opacity-90 mb-8">
              54个德系功能模块 · 覆盖助残全场景<br />
              以德为本，以能为用，以善为行
            </p>
            {stats && (
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Zap className="h-4 w-4" />
                  <span>总计 {stats.total} 模块</span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/30 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-green-300" />
                  <span>{stats.active} 已上线</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/30 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-300" />
                  <span>{stats.developing} 开发中</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-500/30 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span>{stats.planned} 规划中</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 搜索与筛选 */}
      <section className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索德系模块..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部 ({modules.length})
              </button>
              {categories.map(cat => {
                const count = modules.filter(m => m.category === cat.id).length
                const CatIcon = getCategoryIcon(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CatIcon className="h-3.5 w-3.5" />
                    {cat.name} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 模块网格 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* 分类分组展示 */}
              {activeCategory === 'all' ? (
                categories.map(cat => {
                  const catModules = filteredModules.filter(m => m.category === cat.id)
                  if (catModules.length === 0) return null
                  const CatIcon = getCategoryIcon(cat.id)
                  return (
                    <div key={cat.id} className="mb-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
                          <CatIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                          <p className="text-sm text-gray-500">{cat.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">{catModules.length}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {catModules.map(module => (
                          <ModuleCard
                            key={module.code}
                            module={module}
                            recordCount={recordCounts[module.code] || 0}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {filteredModules.map(module => (
                    <ModuleCard
                      key={module.code}
                      module={module}
                      recordCount={recordCounts[module.code] || 0}
                    />
                  ))}
                </div>
              )}

              {filteredModules.length === 0 && (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">未找到匹配的模块</h3>
                  <p className="text-gray-400 mt-2">请尝试其他搜索关键词</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 德系→插板映射 */}
      <section className="py-8 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Plug className="h-6 w-6 text-emerald-600" />
              <h3 className="text-2xl font-bold text-gray-800">德系→插板型号映射</h3>
              <Cable className="h-6 w-6 text-teal-600" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              每个德系模块都是一个插头 — 10大分类对应7种插头型号，通过插板架构实现模块间的信号传递与数据流转
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {[
              { cat: '基础设施', plug: 'config', socket: 'config_read', icon: '⚙️', modules: 6, weight: 0.7, color: '#eab308' },
              { cat: '出行物流', plug: 'action', socket: 'action_handler', icon: '🚗', modules: 4, weight: 0.8, color: '#f97316' },
              { cat: '经济金融', plug: 'data', socket: 'data_input', icon: '💰', modules: 5, weight: 0.6, color: '#3b82f6' },
              { cat: '医疗健康', plug: 'action', socket: 'action_handler', icon: '🏥', modules: 5, weight: 0.9, color: '#f97316' },
              { cat: '文化教育', plug: 'vocab', socket: 'vocab_display', icon: '📚', modules: 8, weight: 0.5, color: '#eab308' },
              { cat: '治理监督', plug: 'signal', socket: 'signal_channel', icon: '⚖️', modules: 7, weight: 0.7, color: '#10b981' },
              { cat: '应急安全', plug: 'signal', socket: 'signal_channel', icon: '🆘', modules: 4, weight: 1.0, color: '#10b981' },
              { cat: '社交传播', plug: 'signal', socket: 'signal_channel', icon: '📢', modules: 5, weight: 0.6, color: '#10b981' },
              { cat: '创业赋能', plug: 'data', socket: 'data_input', icon: '🚀', modules: 5, weight: 0.5, color: '#3b82f6' },
              { cat: '记录存档', plug: 'data', socket: 'data_input', icon: '📁', modules: 5, weight: 0.4, color: '#3b82f6' },
            ].map(item => (
              <Card key={item.cat} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 text-center">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-xs font-bold text-gray-800 mt-1">{item.cat}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0" style={{ borderColor: item.color, color: item.color }}>
                      {item.plug}
                    </Badge>
                    <ArrowRight className="h-2.5 w-2.5 text-gray-300" />
                    <Badge variant="secondary" className="text-[10px] py-0">{item.socket}</Badge>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{item.modules}模块 · 权重{item.weight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/neural">
              <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                <Brain className="h-4 w-4 mr-2" />
                查看神经网络信号流
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 德系哲学 */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">德系哲学 · 五十四德</h3>
          <div className="max-w-3xl mx-auto space-y-4 text-gray-600">
            <p className="text-lg leading-relaxed">
              五十四德，覆盖助残公益全场景。从基础设施到应急安全，从经济金融到文化教育，
              每一个"德"模块都是圆聚助残平台的一个功能维度，也是残健共同体的一次实践。
            </p>
            <p className="leading-relaxed">
              以德器管理辅具，以德递打通物流，以德诊远程问诊，以德急守护安全，
              以德教赋能成长，以德创孵化梦想——五十四德，五十四种善的可能。
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm">德为本</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">能为用</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">善为行</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">诚为信</Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">融为道</Badge>
          </div>
        </div>
      </section>
      <TabBar />
    </div>
  )
}

// 模块卡片组件
function ModuleCard({ module, recordCount }: { module: ModuleInfo; recordCount: number }) {
  const IconComponent = iconMap[module.icon] || Zap

  return (
    <Link href={`/dexi/${module.code}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">{module.name}</h3>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  module.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : module.status === 'developing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {module.status === 'active' ? '上线' : module.status === 'developing' ? '开发' : '规划'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{module.fullName}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{module.description}</p>
          <div className="flex flex-wrap gap-1">
            {module.features.slice(0, 3).map((f, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">
                {f}
              </span>
            ))}
            {module.features.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full">
                +{module.features.length - 3}
              </span>
            )}
          </div>
          {recordCount > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              {recordCount} 条记录
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
