'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  ArrowLeft, Plus, Zap, ChevronRight, Send, BarChart3, List
} from 'lucide-react'
import { DEXI_MODULES, DEXI_CATEGORIES, getDexiModule, type DexiFormField } from '@/lib/dexi-registry'

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

export default function DexiModulePage() {
  const params = useParams()
  const code = params.code as string
  const [moduleDef, setModuleDef] = useState(getDexiModule(code))
  const [records, setRecords] = useState<any[]>([])
  const [recordCount, setRecordCount] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'form' | 'records'>('overview')

  // 同类模块
  const siblingModules = DEXI_MODULES.filter(m =>
    m.category === moduleDef?.category && m.code !== code
  ).slice(0, 6)

  useEffect(() => {
    loadModuleData()
  }, [code])

  async function loadModuleData() {
    try {
      const res = await fetch(`/api/dexi/modules/${code}`)
      if (res.ok) {
        const data = await res.json()
        setRecordCount(data.recordCount || 0)
        setRecords(data.recentRecords || [])
      }
    } catch (error) {
      console.error('加载模块数据失败:', error)
    }
  }

  async function handleSubmit() {
    if (!moduleDef) return
    setSubmitting(true)
    setSubmitResult(null)

    try {
      const title = formData[moduleDef.formFields[0]?.name] || `${moduleDef.name}记录`
      const res = await fetch('/api/dexi/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleCode: code,
          title,
          content: formData,
          value: 0,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSubmitResult({ success: true, value: data.value })
        setFormData({})
        setShowForm(false)
        setActiveTab('records')
        loadModuleData()
      } else {
        setSubmitResult({ success: false, error: '提交失败' })
      }
    } catch (error) {
      setSubmitResult({ success: false, error: '网络错误' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!moduleDef) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">模块不存在</h1>
          <Link href="/dexi">
            <Button>返回德系总览</Button>
          </Link>
        </div>
      </div>
    )
  }

  const IconComponent = iconMap[moduleDef.icon] || Zap
  const CatIcon = categoryIconMap[moduleDef.category] || Building2
  const category = DEXI_CATEGORIES.find(c => c.id === moduleDef.category)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dexi">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-1" />
                德系生态
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-white/50" />
            <span className="text-white/70 text-sm">{moduleDef.categoryLabel}</span>
          </div>

          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-2xl ${moduleDef.color} flex items-center justify-center text-white shrink-0`}>
              <IconComponent className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{moduleDef.name}</h1>
                <Badge className={`${
                  moduleDef.status === 'active'
                    ? 'bg-green-500/20 text-green-200 border-green-500/30'
                    : moduleDef.status === 'developing'
                    ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-200 border-gray-500/30'
                }`}>
                  {moduleDef.status === 'active' ? '已上线' : moduleDef.status === 'developing' ? '开发中' : '规划中'}
                </Badge>
              </div>
              <h2 className="text-xl text-white/80 mb-3">{moduleDef.fullName}</h2>
              <p className="text-white/70 max-w-2xl">{moduleDef.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category?.color} flex items-center justify-center`}>
                    <CatIcon className="h-4 w-4 text-white" />
                  </div>
                  {moduleDef.categoryLabel}
                </div>
                <div className="text-white/60 text-sm">
                  {recordCount} 条记录
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 标签导航 */}
      <section className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'overview', label: '功能概览', icon: BarChart3 },
              { key: 'form', label: '创建记录', icon: Plus },
              { key: 'records', label: `记录列表 (${recordCount})`, icon: List },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 内容区域 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* 功能概览 */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* 功能特性 */}
                <Card>
                  <CardHeader>
                    <CardTitle>核心功能</CardTitle>
                    <CardDescription>{moduleDef.fullName}的主要功能特性</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {moduleDef.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border hover:shadow-md transition-shadow"
                        >
                          <div className={`w-10 h-10 rounded-lg ${moduleDef.color} flex items-center justify-center text-white`}>
                            <span className="text-lg font-bold">{i + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 快速创建入口 */}
                <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          开始使用{moduleDef.name}
                        </h3>
                        <p className="text-gray-600">
                          创建您的第一条{moduleDef.fullName}记录，开始积累德值
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab('form')}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        创建记录
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 最近记录 */}
                {records.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>最近记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {records.slice(0, 5).map((record: any) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{record.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                德值 {record.value}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {record.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 侧边栏 */}
              <div className="space-y-6">
                {/* 模块信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">模块信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">模块代码</span>
                      <span className="font-mono text-gray-700">{moduleDef.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">所属分类</span>
                      <span className="text-gray-700">{moduleDef.categoryLabel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">运行状态</span>
                      <Badge variant={moduleDef.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {moduleDef.status === 'active' ? '已上线' : moduleDef.status === 'developing' ? '开发中' : '规划中'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">记录数量</span>
                      <span className="text-gray-700">{recordCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">功能数量</span>
                      <span className="text-gray-700">{moduleDef.features.length}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 同类模块 */}
                {siblingModules.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">同类模块</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {siblingModules.map(m => {
                          const SibIcon = iconMap[m.icon] || Zap
                          return (
                            <Link key={m.code} href={`/dexi/${m.code}`}>
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className={`w-8 h-8 rounded-lg ${m.color} flex items-center justify-center text-white`}>
                                  <SibIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{m.fullName}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* 创建记录表单 */}
          {activeTab === 'form' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${moduleDef.color} flex items-center justify-center text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>创建{moduleDef.name}记录</CardTitle>
                      <CardDescription>{moduleDef.fullName} · 填写以下信息创建新记录</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {moduleDef.formFields.map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'text' && (
                        <Input
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        />
                      )}
                      {field.type === 'textarea' && (
                        <Textarea
                          placeholder={field.placeholder}
                          rows={3}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        />
                      )}
                      {field.type === 'number' && (
                        <Input
                          type="number"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: parseFloat(e.target.value) || 0 }))}
                        />
                      )}
                      {field.type === 'date' && (
                        <Input
                          type="date"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        />
                      )}
                      {field.type === 'select' && field.options && (
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        >
                          <option value="">请选择...</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'toggle' && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [field.name]: !prev[field.name] }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData[field.name] ? 'bg-indigo-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData[field.name] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      )}
                    </div>
                  ))}

                  {submitResult && (
                    <div className={`p-4 rounded-lg ${
                      submitResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        submitResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {submitResult.success
                          ? `记录创建成功！获得德值 ${submitResult.value}`
                          : `创建失败：${submitResult.error}`
                        }
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          提交中...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          提交记录
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setFormData({}); setActiveTab('overview') }}
                    >
                      取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 记录列表 */}
          {activeTab === 'records' && (
            <div className="max-w-3xl mx-auto">
              {records.length > 0 ? (
                <div className="space-y-4">
                  {records.map((record: any) => {
                    let contentData: any = {}
                    try {
                      contentData = JSON.parse(record.content)
                    } catch {
                      contentData = { text: record.content }
                    }

                    return (
                      <Card key={record.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${moduleDef.color} flex items-center justify-center text-white`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{record.title}</h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(record.createdAt).toLocaleString('zh-CN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-indigo-100 text-indigo-700">
                                德值 {record.value}
                              </Badge>
                              <Badge variant="outline">
                                {record.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {Object.entries(contentData).slice(0, 6).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 rounded-lg p-2">
                                <span className="text-gray-500 text-xs">{key}</span>
                                <p className="text-gray-700 truncate">{String(value || '-')}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${moduleDef.color} flex items-center justify-center text-white mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">暂无记录</h3>
                    <p className="text-gray-400 mb-6">
                      成为第一个使用{moduleDef.name}的用户，创建记录积累德值
                    </p>
                    <Button
                      onClick={() => setActiveTab('form')}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      创建记录
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
