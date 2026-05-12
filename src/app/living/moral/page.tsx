'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft, Sparkles, Heart, Scale, HandHeart, Shield,
  TrendingUp, Users, Trophy, Star, Zap, Brain, Activity
} from 'lucide-react'

interface FiveDimensionScore {
  kindness: number      // 善良 30%
  compassion: number    // 恻隐 25%
  justice: number       // 正义 20%
  dedication: number    // 奉献 15%
  severity: number      // 严重度 10%（反向）
  total: number
  weights: {
    kindness: number
    compassion: number
    justice: number
    dedication: number
    severity: number
  }
}

interface UserDopamineStats {
  userId: string
  totalDopamine: number
  totalActions: number
  byType: Record<string, number>
  avgScore: FiveDimensionScore | null
}

interface LeaderboardEntry {
  userId: string
  totalDopamine: number
  avgTotalScore: number
  actionCount: number
}

interface DopamineRecord {
  id: string
  userId: string
  actionType: string
  actionDesc: string | null
  targetId: string | null
  kindness: number
  compassion: number
  justice: number
  dedication: number
  severity: number
  totalScore: number
  dopamineValue: number
  actionData: string | null
  createdAt: string
}

// 五维评分配置
const DIMENSIONS = [
  { key: 'kindness', label: '善良', weight: 0.30, icon: Heart, color: '#ef4444', desc: '行为本身的善意程度，越无私得分越高' },
  { key: 'compassion', label: '恻隐', weight: 0.25, icon: HandHeart, color: '#f97316', desc: '对弱势群体的共情深度，越感同身受得分越高' },
  { key: 'justice', label: '正义', weight: 0.20, icon: Scale, color: '#3b82f6', desc: '行为是否促进公平正义，越公正得分越高' },
  { key: 'dedication', label: '奉献', weight: 0.15, icon: Shield, color: '#8b5cf6', desc: '付出的时间精力成本，越无保留得分越高' },
  { key: 'severity', label: '严重度', weight: 0.10, icon: Zap, color: '#eab308', desc: '受助者困境的严重程度，越危急得分越高（反向：帮助越危急者分越高）' },
]

export default function MoralLedgerPage() {
  const [stats, setStats] = useState<UserDopamineStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentRecords, setRecentRecords] = useState<DopamineRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // 获取第一个用户作为demo
      const userRes = await fetch('/api/users/demo')
      let userId = 'demo-user'
      if (userRes.ok) {
        const userData = await userRes.json()
        userId = userData.user?.id || userId
      }

      // 并行获取数据
      const [statsRes, lbRes, livingRes] = await Promise.all([
        fetch(`/api/living/dopamine?userId=${userId}`),
        fetch('/api/living/dopamine?leaderboard=true&limit=10'),
        fetch('/api/living/status'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (lbRes.ok) {
        const lbData = await lbRes.json()
        setLeaderboard(lbData.leaderboard || [])
      }

      if (livingRes.ok) {
        const livingData = await livingRes.json()
        setRecentRecords(livingData.dopamine?.recentDopamine || [])
      }
    } catch (error) {
      console.error('加载道德账本失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const actionTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
    donate: { label: '捐款', icon: Heart, color: 'bg-red-100 text-red-700' },
    create_project: { label: '创建项目', icon: Star, color: 'bg-blue-100 text-blue-700' },
    volunteer: { label: '志愿服务', icon: HandHeart, color: 'bg-green-100 text-green-700' },
    help: { label: '互助', icon: Users, color: 'bg-purple-100 text-purple-700' },
    share: { label: '分享', icon: Sparkles, color: 'bg-yellow-100 text-yellow-700' },
    comment: { label: '评论', icon: Brain, color: 'bg-indigo-100 text-indigo-700' },
    verify: { label: '验证', icon: Shield, color: 'bg-cyan-100 text-cyan-700' },
  }

  // 雷达图绘制
  function renderRadarChart(score: FiveDimensionScore) {
    const size = 240
    const center = size / 2
    const maxRadius = 90
    const levels = 5

    const values = DIMENSIONS.map(d => {
      const raw = score[d.key as keyof FiveDimensionScore] as number
      return Math.min(100, Math.max(0, raw))
    })

    // 计算各维度坐标点
    const points = DIMENSIONS.map((d, i) => {
      const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2
      const radius = (values[i] / 100) * maxRadius
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 28) * Math.cos(angle),
        labelY: center + (maxRadius + 28) * Math.sin(angle),
        value: values[i],
      }
    })

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {/* 背景网格 */}
        {Array.from({ length: levels }).map((_, level) => {
          const r = maxRadius * ((level + 1) / levels)
          const gridPoints = DIMENSIONS.map((_, i) => {
            const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
          }).join(' ')
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          )
        })}

        {/* 轴线 */}
        {DIMENSIONS.map((_, i) => {
          const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          )
        })}

        {/* 数据区域 */}
        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="rgba(139, 92, 246, 0.15)"
          stroke="#8b5cf6"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={DIMENSIONS[i].color}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* 标签 */}
        {points.map((p, i) => (
          <g key={i}>
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium"
              fill="#374151"
            >
              {DIMENSIONS[i].label}
            </text>
            <text
              x={p.labelX}
              y={p.labelY + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
              fill="#9ca3af"
            >
              {p.value}分
            </text>
          </g>
        ))}
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">道德账本加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/living">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-1" />
                活体系统
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">道德账本</h1>
            <p className="text-lg text-white/80">
              五维评分体系 · 善良·恻隐·正义·奉献·严重度
            </p>
            <div className="flex justify-center gap-6 mt-4 text-sm text-white/70">
              <span>善良 30%</span>
              <span>恻隐 25%</span>
              <span>正义 20%</span>
              <span>奉献 15%</span>
              <span>严重度 10%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats?.totalActions || 0}</p>
              <p className="text-xs text-gray-500">善行总数</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats?.totalDopamine?.toFixed(1) || '0'}</p>
              <p className="text-xs text-gray-500">多巴胺总值</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4 text-center">
              <Scale className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{stats?.avgScore?.total || 0}</p>
              <p className="text-xs text-gray-500">平均德分</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{Object.keys(stats?.byType || {}).length}</p>
              <p className="text-xs text-gray-500">善行类型</p>
            </CardContent>
          </Card>
        </div>

        {/* 五维雷达图 + 详情 */}
        {stats?.avgScore ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 雷达图 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  五维道德雷达
                </CardTitle>
                <CardDescription>基于所有善行记录的加权平均评分</CardDescription>
              </CardHeader>
              <CardContent>
                {renderRadarChart(stats.avgScore)}
              </CardContent>
            </Card>

            {/* 五维详情条 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  五维评分详情
                </CardTitle>
                <CardDescription>每维得分与权重占比</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {DIMENSIONS.map(dim => {
                  const value = stats.avgScore![dim.key as keyof FiveDimensionScore] as number
                  const Icon = dim.icon
                  return (
                    <div key={dim.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: dim.color }} />
                          <span className="font-medium text-sm">{dim.label}</span>
                          <Badge variant="outline" className="text-xs">
                            权重 {(dim.weight * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <span className="font-bold text-sm" style={{ color: dim.color }}>{value}分</span>
                      </div>
                      <Progress value={value} className="h-2" />
                      <p className="text-xs text-gray-400 mt-1">{dim.desc}</p>
                    </div>
                  )
                })}

                {/* 加权总分 */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">加权总分</span>
                    <span className="text-2xl font-bold text-purple-600">{stats.avgScore.total}分</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    总分 = 善良×30% + 恻隐×25% + 正义×20% + 奉献×15% + 严重度×10%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">暂无道德评分</h3>
              <p className="text-gray-400">进行捐款、创建项目、志愿服务等善行后，五维道德评分将自动计算</p>
            </CardContent>
          </Card>
        )}

        {/* 善行类型分布 */}
        {stats?.byType && Object.keys(stats.byType).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                善行类型分布
              </CardTitle>
              <CardDescription>各类善行的多巴胺贡献</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.byType).map(([type, value]) => {
                  const config = actionTypeLabels[type] || { label: type, icon: Zap, color: 'bg-gray-100 text-gray-700' }
                  const Icon = config.icon
                  return (
                    <div key={type} className="text-center p-4 rounded-xl bg-gray-50">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} mb-2`}>
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{(value as number).toFixed(1)}</p>
                      <p className="text-xs text-gray-500">多巴胺值</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最近善行记录 */}
        {recentRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-600" />
                最近善行记录
              </CardTitle>
              <CardDescription>每条记录的五维评分详情</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRecords.map((record: any) => {
                  const config = actionTypeLabels[record.actionType] || { label: record.actionType, icon: Zap, color: 'bg-gray-100 text-gray-700' }
                  const Icon = config.icon
                  return (
                    <div key={record.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <Icon className="h-3 w-3 inline mr-1" />
                            {config.label}
                          </div>
                          <span className="text-sm text-gray-500">{record.actionDesc || ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            +{record.dopamineValue} 多巴胺
                          </Badge>
                        </div>
                      </div>

                      {/* 五维评分条 */}
                      <div className="grid grid-cols-5 gap-2">
                        {DIMENSIONS.map(dim => {
                          const val = record[dim.key as keyof typeof record] as number
                          return (
                            <div key={dim.key} className="text-center">
                              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full"
                                  style={{ width: `${Math.min(100, val)}%`, backgroundColor: dim.color }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{dim.label}</span>
                              <p className="text-xs font-medium" style={{ color: dim.color }}>{val}</p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>加权总分: {record.totalScore}</span>
                        <span>{new Date(record.createdAt).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 排行榜 */}
        {leaderboard.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                善行排行榜
              </CardTitle>
              <CardDescription>多巴胺值最高的善行者</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, i) => (
                  <div key={entry.userId} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-gray-300 text-white' :
                      i === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{entry.userId.slice(0, 8)}...</p>
                      <p className="text-xs text-gray-500">{entry.actionCount} 次善行 · 平均分 {entry.avgTotalScore}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{entry.totalDopamine.toFixed(1)}</p>
                      <p className="text-xs text-gray-400">多巴胺</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 五维哲学说明 */}
        <Card className="bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-600" />
              五维道德评分哲学
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                道德账本采用五维评分体系，将善行从五个维度进行量化评估。
                每个维度代表善行的一个侧面，通过加权计算得出综合德分。
              </p>
              <div className="grid md:grid-cols-5 gap-3 mt-4">
                {DIMENSIONS.map(dim => {
                  const Icon = dim.icon
                  return (
                    <div key={dim.key} className="text-center p-3 bg-white rounded-lg">
                      <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: dim.color }} />
                      <p className="font-medium text-xs">{dim.label}</p>
                      <p className="text-xs text-gray-400 mt-1">权重 {(dim.weight * 100).toFixed(0)}%</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                新天枰倾斜：健全人帮助残疾人时，严重度维度自动提升；城市人帮助农村人时，恻隐维度自动提升；
                富裕者帮助贫困者时，奉献维度自动提升——这就是"倾斜"的含义。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
