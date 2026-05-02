'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Shield, Heart, Scale, HandHeart, AlertTriangle,
  PlusCircle, CheckCircle, Users, BookOpen,
  TrendingUp, Award, Sparkles, Eye, Loader2
} from 'lucide-react'

// 五维评分类型
interface FiveDimensionScores {
  kindnessScore: number
  compassionScore: number
  justiceScore: number
  dedicationScore: number
  severityScore: number
}

interface MoralRecord {
  id: string
  userId: string
  recordType: string
  kindnessScore: number
  compassionScore: number
  justiceScore: number
  dedicationScore: number
  severityScore: number
  compositeScore: number
  description: string
  evidenceUrls: string | null
  verificationCount: number
  verificationRequired: number
  isVerified: boolean
  createdAt: string
  user?: { id: string; name: string | null; avatar: string | null }
}

interface MoralLedgerData {
  id: string
  userId: string
  totalKindness: number
  totalCompassion: number
  totalJustice: number
  totalDedication: number
  totalSeverity: number
  compositeScore: number
  level: string
  verifiedRecordCount: number
  totalRecordCount: number
  user?: { id: string; name: string | null; avatar: string | null }
}

interface ValueContribution {
  id: string
  userId: string
  dimension: string
  value: number
  description: string
  isVerified: boolean
  createdAt: string
}

// 五维配置
const DIMENSIONS = [
  { key: 'kindness', label: '善良', weight: 0.30, icon: Heart, color: '#ec4899', description: '善良维度 - 权重30%，衡量善念善行的纯度与持续性' },
  { key: 'compassion', label: '恻隐', weight: 0.25, icon: HandHeart, color: '#8b5cf6', description: '恻隐维度 - 权重25%，衡量对弱者的同理心与帮扶行动' },
  { key: 'justice', label: '正义', weight: 0.20, icon: Scale, color: '#3b82f6', description: '正义维度 - 权重20%，向着底层、残疾人、农民、被消费者的正义' },
  { key: 'dedication', label: '奉献', weight: 0.15, icon: TrendingUp, color: '#10b981', description: '奉献维度 - 权重15%，衡量无私付出与集体贡献的程度' },
  { key: 'severity', label: '严重', weight: 0.10, icon: AlertTriangle, color: '#f59e0b', description: '严重维度 - 权重10%，残疾程度越严重优先级越高' },
]

// 记录类型
const RECORD_TYPES = [
  { value: 'kindness', label: '善良行为' },
  { value: 'compassion', label: '恻隐之举' },
  { value: 'justice', label: '正义行动' },
  { value: 'dedication', label: '奉献记录' },
  { value: 'severity', label: '严重评估' },
]

// 八维价值
const VALUE_DIMENSIONS = [
  { key: 'moral', label: '道德行为定义价值', icon: '🧭', color: 'bg-pink-500' },
  { key: 'intelligence', label: '智力组合辅助价值', icon: '🧠', color: 'bg-purple-500' },
  { key: 'labor', label: '劳动奉献创造价值', icon: '🔨', color: 'bg-blue-500' },
  { key: 'land', label: '土地共产构建价值', icon: '🌍', color: 'bg-green-500' },
  { key: 'energy', label: '能源共产持续价值', icon: '⚡', color: 'bg-yellow-500' },
  { key: 'duty', label: '义务消供收集价值', icon: '🤝', color: 'bg-orange-500' },
  { key: 'innovation', label: '创新赋能集体价值', icon: '💡', color: 'bg-cyan-500' },
  { key: 'copyright', label: '版权混元一体价值', icon: '📜', color: 'bg-red-500' },
]

// 等级配色
const LEVEL_CONFIG: Record<string, { color: string; bg: string; desc: string }> = {
  '初心者': { color: 'text-gray-700', bg: 'bg-gray-100', desc: '刚踏上道德修行之路' },
  '行者': { color: 'text-blue-700', bg: 'bg-blue-100', desc: '在行动中践行善念' },
  '愿者': { color: 'text-green-700', bg: 'bg-green-100', desc: '以愿力驱动善良循环' },
  '守护者': { color: 'text-purple-700', bg: 'bg-purple-100', desc: '守护弱者，维护正义' },
  '圆觉者': { color: 'text-amber-700', bg: 'bg-amber-100', desc: '功德圆满，觉行一体' },
}

export default function MoralLedgerPage() {
  const [ledger, setLedger] = useState<MoralLedgerData | null>(null)
  const [records, setRecords] = useState<MoralRecord[]>([])
  const [valueContributions, setValueContributions] = useState<ValueContribution[]>([])
  const [valueSummary, setValueSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [showValueForm, setShowValueForm] = useState(false)
  const [demoUserId, setDemoUserId] = useState<string | null>(null)

  // 表单状态 - 道德记录
  const [recordForm, setRecordForm] = useState({
    recordType: 'kindness',
    kindnessScore: 70,
    compassionScore: 60,
    justiceScore: 50,
    dedicationScore: 40,
    severityScore: 20,
    description: ''
  })

  // 表单状态 - 价值贡献
  const [valueForm, setValueForm] = useState({
    dimension: 'moral',
    value: 10,
    description: ''
  })

  useEffect(() => {
    initDemoUser()
  }, [])

  const initDemoUser = async () => {
    try {
      // 获取或创建演示用户
      let user = await fetch('/api/users/demo').then(r => r.json()).catch(() => null)
      if (user?.id) {
        setDemoUserId(user.id)
        await loadLedgerData(user.id)
      }
    } catch (error) {
      console.error('初始化演示用户失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLedgerData = async (userId: string) => {
    try {
      const [ledgerRes, recordsRes, valueRes] = await Promise.all([
        fetch(`/api/moral/ledger/${userId}`),
        fetch(`/api/moral/record?userId=${userId}`),
        fetch(`/api/moral/value?userId=${userId}`)
      ])

      if (ledgerRes.ok) {
        const ledgerData = await ledgerRes.json()
        setLedger(ledgerData.ledger)
        setValueContributions(ledgerData.valueContributions || [])
        setValueSummary(ledgerData.valueSummary || {})
      }

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json()
        setRecords(recordsData.records || [])
      }
    } catch (error) {
      console.error('加载道德账本数据失败:', error)
    }
  }

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoUserId || !recordForm.description) return

    try {
      const res = await fetch('/api/moral/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: demoUserId,
          ...recordForm
        })
      })

      if (res.ok) {
        alert('道德记录创建成功！需要至少3人验证才能生效。')
        setRecordForm(prev => ({ ...prev, description: '' }))
        setShowRecordForm(false)
        await loadLedgerData(demoUserId)
      } else {
        const err = await res.json()
        alert(err.error || '创建失败')
      }
    } catch (error) {
      console.error('创建道德记录失败:', error)
    }
  }

  const handleVerifyRecord = async (recordId: string) => {
    if (!demoUserId) return

    try {
      const res = await fetch('/api/moral/record', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          verifierId: demoUserId
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        await loadLedgerData(demoUserId)
      } else {
        const err = await res.json()
        alert(err.error || '验证失败')
      }
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  const handleCreateValue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoUserId || !valueForm.description) return

    try {
      const res = await fetch('/api/moral/value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: demoUserId,
          ...valueForm
        })
      })

      if (res.ok) {
        alert('价值贡献记录创建成功！')
        setValueForm(prev => ({ ...prev, description: '' }))
        setShowValueForm(false)
        await loadLedgerData(demoUserId)
      } else {
        const err = await res.json()
        alert(err.error || '创建失败')
      }
    } catch (error) {
      console.error('创建价值贡献失败:', error)
    }
  }

  const getLevelInfo = (level: string) => {
    return LEVEL_CONFIG[level] || LEVEL_CONFIG['初心者']
  }

  // 五维雷达图数据（SVG绘制）
  const renderRadarChart = () => {
    if (!ledger) return null

    const scores = [
      ledger.totalKindness,
      ledger.totalCompassion,
      ledger.totalJustice,
      ledger.totalDedication,
      ledger.totalSeverity
    ]

    const size = 250
    const center = size / 2
    const radius = 90
    const angles = DIMENSIONS.map((_, i) => (i * 2 * Math.PI) / 5 - Math.PI / 2)

    // 绘制网格线
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
    const gridPaths = gridLevels.map(level => {
      const points = angles.map((angle, i) => {
        const x = center + radius * level * Math.cos(angle)
        const y = center + radius * level * Math.sin(angle)
        return `${x},${y}`
      })
      return `M${points.join('L')}Z`
    })

    // 绘制数据区域
    const dataPoints = scores.map((score, i) => {
      const normalizedScore = Math.min(score / 100, 1)
      const x = center + radius * normalizedScore * Math.cos(angles[i])
      const y = center + radius * normalizedScore * Math.sin(angles[i])
      return `${x},${y}`
    })
    const dataPath = `M${dataPoints.join('L')}Z`

    // 标签位置
    const labelPositions = DIMENSIONS.map((dim, i) => {
      const labelRadius = radius + 30
      const x = center + labelRadius * Math.cos(angles[i])
      const y = center + labelRadius * Math.sin(angles[i])
      return { x, y, label: dim.label, score: scores[i] }
    })

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] mx-auto">
        {/* 网格 */}
        {gridPaths.map((path, i) => (
          <path key={i} d={path} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {/* 轴线 */}
        {angles.map((angle, i) => {
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#d1d5db" strokeWidth="1" />
        })}
        {/* 数据区域 */}
        <path d={dataPath} fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2" />
        {/* 数据点 */}
        {scores.map((score, i) => {
          const normalizedScore = Math.min(score / 100, 1)
          const x = center + radius * normalizedScore * Math.cos(angles[i])
          const y = center + radius * normalizedScore * Math.sin(angles[i])
          return <circle key={i} cx={x} cy={y} r="4" fill={DIMENSIONS[i].color} />
        })}
        {/* 标签 */}
        {labelPositions.map((pos, i) => (
          <g key={i}>
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium"
              fill={DIMENSIONS[i].color}
            >
              {pos.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
              fill="#6b7280"
            >
              {pos.score.toFixed(0)}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-gray-600">正在加载道德账本...</p>
        </div>
      </div>
    )
  }

  const levelInfo = ledger ? getLevelInfo(ledger.level) : LEVEL_CONFIG['初心者']

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">道德账本</h1>
              <p className="text-amber-100">五维评分体系 · 集体验证机制 · 八维价值贡献</p>
            </div>
          </div>

          {/* 统计概览 */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-amber-300" />
                <span className="text-amber-100">当前等级</span>
              </div>
              <div className={`text-2xl font-bold ${levelInfo.color} ${levelInfo.bg} px-3 py-1 rounded-full inline-block`}>
                {ledger?.level || '初心者'}
              </div>
              <p className="text-xs text-amber-200 mt-1">{levelInfo.desc}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-amber-100">综合评分</span>
              </div>
              <div className="text-2xl font-bold">{ledger?.compositeScore.toFixed(1) || '0.0'}</div>
              <Progress value={ledger?.compositeScore || 0} className="h-2 mt-2" />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="text-amber-100">已验证记录</span>
              </div>
              <div className="text-2xl font-bold">{ledger?.verifiedRecordCount || 0}</div>
              <p className="text-xs text-amber-200 mt-1">共 {ledger?.totalRecordCount || 0} 条记录</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-300" />
                <span className="text-amber-100">价值贡献</span>
              </div>
              <div className="text-2xl font-bold">{valueContributions.length}</div>
              <p className="text-xs text-amber-200 mt-1">八维价值维度</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="records">道德记录</TabsTrigger>
            <TabsTrigger value="values">价值贡献</TabsTrigger>
            <TabsTrigger value="about">关于体系</TabsTrigger>
          </TabsList>

          {/* 总览 Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 五维雷达图 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-amber-500" />
                    五维道德评分
                  </CardTitle>
                  <CardDescription>
                    善良30% · 恻隐25% · 正义20% · 奉献15% · 严重10%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderRadarChart()}

                  {/* 维度详情 */}
                  <div className="mt-6 space-y-3">
                    {DIMENSIONS.map(dim => {
                      const score = ledger ? (ledger as any)[`total${dim.key.charAt(0).toUpperCase() + dim.key.slice(1)}`] || 0 : 0
                      return (
                        <div key={dim.key} className="flex items-center gap-3">
                          <dim.icon className="h-4 w-4" style={{ color: dim.color }} />
                          <span className="text-sm w-12">{dim.label}</span>
                          <Progress value={score} className="flex-1 h-2" />
                          <span className="text-sm font-medium w-12 text-right">{score.toFixed(0)}</span>
                          <Badge variant="outline" className="text-xs">{(dim.weight * 100).toFixed(0)}%</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 等级与说明 */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      道德等级
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(LEVEL_CONFIG).map(([level, config]) => (
                        <div
                          key={level}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            ledger?.level === level ? `${config.bg} border-current` : 'border-transparent bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${config.color}`}>{level}</span>
                            <span className="text-xs text-gray-500">{config.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-500" />
                      众筹发起门槛
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>至少 3 条已验证道德记录</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>综合评分达到 60 分以上</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>达到"行者"等级以上</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        只有满足以上条件的用户才能发起众筹项目，确保项目发起人具有良好的道德品质
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 道德记录 Tab */}
          <TabsContent value="records" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">道德记录</h2>
              <Button
                onClick={() => setShowRecordForm(!showRecordForm)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                添加道德记录
              </Button>
            </div>

            {/* 创建道德记录表单 */}
            {showRecordForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>添加新的道德记录</CardTitle>
                  <CardDescription>
                    记录道德行为，需至少3人集体验证后生效
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateRecord} className="space-y-4">
                    <div>
                      <Label>记录类型</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {RECORD_TYPES.map(type => (
                          <Button
                            key={type.value}
                            type="button"
                            size="sm"
                            variant={recordForm.recordType === type.value ? 'default' : 'outline'}
                            onClick={() => setRecordForm(prev => ({ ...prev, recordType: type.value }))}
                          >
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {DIMENSIONS.map(dim => (
                        <div key={dim.key}>
                          <Label className="flex items-center gap-1">
                            <dim.icon className="h-4 w-4" style={{ color: dim.color }} />
                            {dim.label}评分 ({(dim.weight * 100).toFixed(0)}%)
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="range"
                              min="0"
                              max="100"
                              value={(recordForm as any)[`${dim.key}Score`]}
                              onChange={(e) => setRecordForm(prev => ({
                                ...prev,
                                [`${dim.key}Score`]: parseInt(e.target.value)
                              }))}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-8">
                              {(recordForm as any)[`${dim.key}Score`]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>行为描述 *</Label>
                      <Textarea
                        value={recordForm.description}
                        onChange={(e) => setRecordForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="请详细描述道德行为内容、过程和影响..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                        提交记录
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowRecordForm(false)}>
                        取消
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* 道德记录列表 */}
            <div className="grid gap-4">
              {records.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">暂无道德记录</p>
                    <p className="text-sm">添加第一条道德记录，开启道德修行之路</p>
                  </CardContent>
                </Card>
              ) : (
                records.map(record => {
                  const typeInfo = RECORD_TYPES.find(t => t.value === record.recordType)
                  return (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={record.isVerified ? 'default' : 'secondary'}>
                              {typeInfo?.label || record.recordType}
                            </Badge>
                            {record.isVerified ? (
                              <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已验证</Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                验证中 {record.verificationCount}/{record.verificationRequired}
                              </Badge>
                            )}
                            <Badge variant="outline">综合: {record.compositeScore.toFixed(1)}</Badge>
                          </div>
                          {!record.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyRecord(record.id)}
                            >
                              验证
                            </Button>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{record.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {DIMENSIONS.map(dim => {
                            const score = (record as any)[`${dim.key}Score`]
                            return (
                              <span key={dim.key} className="px-2 py-1 bg-gray-100 rounded">
                                {dim.label}: {score}
                              </span>
                            )
                          })}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(record.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* 价值贡献 Tab */}
          <TabsContent value="values" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">八维价值贡献</h2>
              <Button
                onClick={() => setShowValueForm(!showValueForm)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                添加价值贡献
              </Button>
            </div>

            {/* 八维价值概览 */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {VALUE_DIMENSIONS.map(dim => (
                <Card key={dim.key} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{dim.icon}</span>
                      <span className="text-sm font-medium">{dim.label}</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {(valueSummary[dim.key] || 0).toFixed(0)}
                    </div>
                    <Progress
                      value={Math.min((valueSummary[dim.key] || 0) / 100 * 100, 100)}
                      className="h-1.5 mt-2"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 创建价值贡献表单 */}
            {showValueForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>添加价值贡献</CardTitle>
                  <CardDescription>记录在八维价值体系中的贡献</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateValue} className="space-y-4">
                    <div>
                      <Label>价值维度</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {VALUE_DIMENSIONS.map(dim => (
                          <Button
                            key={dim.key}
                            type="button"
                            size="sm"
                            variant={valueForm.dimension === dim.key ? 'default' : 'outline'}
                            onClick={() => setValueForm(prev => ({ ...prev, dimension: dim.key }))}
                          >
                            {dim.icon} {dim.label.slice(0, 4)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>贡献值</Label>
                      <Input
                        type="number"
                        min="0"
                        value={valueForm.value}
                        onChange={(e) => setValueForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div>
                      <Label>贡献描述 *</Label>
                      <Textarea
                        value={valueForm.description}
                        onChange={(e) => setValueForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="请描述您的价值贡献..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">
                        提交贡献
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowValueForm(false)}>
                        取消
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* 价值贡献列表 */}
            <div className="grid gap-4">
              {valueContributions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">暂无价值贡献</p>
                    <p className="text-sm">开始记录您的八维价值贡献</p>
                  </CardContent>
                </Card>
              ) : (
                valueContributions.map(vc => {
                  const dimInfo = VALUE_DIMENSIONS.find(d => d.key === vc.dimension)
                  return (
                    <Card key={vc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{dimInfo?.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{dimInfo?.label}</span>
                              <Badge variant="outline">贡献值: {vc.value}</Badge>
                              {vc.isVerified && <Badge className="bg-green-500 text-xs">已验证</Badge>}
                            </div>
                            <p className="text-sm text-gray-600">{vc.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* 关于体系 Tab */}
          <TabsContent value="about" className="mt-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>道德账本 - 核心内核</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                  <p>
                    道德账本是圆聚助残公益众筹平台的核心筛选机制。平台不能完全开放——任何人都能发起众筹，
                    会让"装模作样"的人混入其中。道德账本通过五维评分和集体验证，筛选出真正具有愿力的人，
                    区分愿力者与索取者，构建命运共同体。
                  </p>
                  <p>
                    五个评估维度：善良、恻隐、正义、奉献、严重。其中"正义"有明确的方向——向着底层人、
                    残疾人、农民、用户、被消费者、被造物主辜负的人倾斜。"严重"维度则体现为：残疾程度越严重，
                    优先级越高，获得的帮扶资源越多。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>五维评分体系</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DIMENSIONS.map(dim => (
                    <div key={dim.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <dim.icon className="h-5 w-5 mt-0.5" style={{ color: dim.color }} />
                      <div>
                        <div className="font-medium">{dim.label} ({(dim.weight * 100).toFixed(0)}%)</div>
                        <p className="text-sm text-gray-600">{dim.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>八维价值体系</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {VALUE_DIMENSIONS.map(dim => (
                    <div key={dim.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl">{dim.icon}</span>
                      <span className="font-medium">{dim.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>集体验证机制</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700">
                  <p>
                    每条道德记录需要至少3人验证才能生效。不能自我验证，验证者必须是不同的用户。
                    这确保了道德记录的真实性和客观性，防止单方面造假。
                  </p>
                  <p>
                    验证者通过确认行为描述的真实性、照片/视频证据的可信度来判断记录是否有效。
                    当验证人数达到要求时，记录自动标记为"已验证"，并纳入道德账本的综合评分计算。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>命运共同体组织架构</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-700">
                  <p>
                    最小单元：1个残疾人 + 6个健全人 = 7人（组）。残疾人的残疾程度决定优先级——
                    越严重越优先获得帮扶资源。健全人不是施舍者，而是共建者，通过帮扶获得未来股权投资机会。
                  </p>
                  <p>
                    扩展单元：6+36+6 = 48人（班）。多个组可以组成班，多个班可以组成营。
                    这种组织架构确保每个残疾人都有6个健全人直接帮扶，形成紧密的命运共同体。
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
