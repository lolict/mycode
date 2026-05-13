'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft, Sparkles, Heart, Scale, HandHeart, Shield,
  TrendingUp, Trophy, Star, Zap, Brain, Activity, Target,
  Coins, Crown, Flame, Calendar, CheckCircle, BookOpen,
  Landmark, Users, Siren, Eye
} from 'lucide-react'
import TabBar from '@/components/tab-bar'

// 注：此页面使用的图标都在上方导入中，已移除未使用的ICON_MAP

// 词汇显示 — 使用默认值，实际应从API获取
interface VocabMap {
  value_unit: string
  equity_name: string
  equity_total: string
  sys_good_deed: string
  sys_checkin: string
  sys_streak: string
  sys_leaderboard: string
  [key: string]: string
}

interface EquityData {
  equity: {
    totalEquity: number
    level: number
    tier: string
    totalTasks: number
    streakDays: number
    lastActiveAt: string | null
    levelName: string
    levelIcon: string
    levelColor: string
    benefits: string[]
  }
  progress: number
  nextLevelEquity: number | null
  recentCompletions: number
  todayCompletions: number
}

export default function MoralEquityPage() {
  const [equity, setEquity] = useState<EquityData | null>(null)
  const [vocab, setVocab] = useState<VocabMap>({
    value_unit: '德值',
    equity_name: '道德股权',
    equity_total: '股权总值',
    sys_good_deed: '善行',
    sys_checkin: '打卡',
    sys_streak: '连续天数',
    sys_leaderboard: '善行排行榜',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // 获取demo用户
      const userRes = await fetch('/api/users/demo')
      let userId = 'demo-user'
      if (userRes.ok) {
        const userData = await userRes.json()
        userId = userData.user?.id || userId
      }

      // 并行获取股权和词汇
      const [equityRes, vocabRes] = await Promise.all([
        fetch(`/api/moral-equity/balance?userId=${userId}`),
        fetch('/api/moral-equity/vocabulary'),
      ])

      if (equityRes.ok) {
        const data = await equityRes.json()
        setEquity(data)
      }

      if (vocabRes.ok) {
        const vocabData = await vocabRes.json()
        // 构建词汇映射
        const map: any = {}
        for (const v of vocabData.vocabularies || []) {
          map[v.vocabKey] = v.displayValue || v.defaultValue
        }
        setVocab(prev => ({ ...prev, ...map }))
      }
    } catch (error) {
      console.error('加载道德股权失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 等级图标映射
  const levelIcons: Record<string, string> = {
    '1': '🌱', '2': '🌿', '3': '🌳', '4': '🏔️', '5': '⭐'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-gray-600">{vocab.equity_name}加载中...</p>
        </div>
      </div>
    )
  }

  const eq = equity?.equity

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/apps">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-1" />
                应用中心
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Landmark className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{vocab.equity_name}</h1>
            <p className="text-lg text-white/80">
              道德行为定义价值 · 完成{vocab.sys_good_deed}任务积攒{vocab.value_unit}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 股权总览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{eq?.totalEquity?.toFixed(0) || 0}</p>
              <p className="text-xs text-gray-500">{vocab.equity_total}({vocab.value_unit})</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{eq?.tier || '初善'}</p>
              <p className="text-xs text-gray-500">品阶 Lv.{eq?.level || 1}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{eq?.totalTasks || 0}</p>
              <p className="text-xs text-gray-500">{vocab.sys_good_deed}总数</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{eq?.streakDays || 0}</p>
              <p className="text-xs text-gray-500">{vocab.sys_streak}</p>
            </CardContent>
          </Card>
        </div>

        {/* 等级进度 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              等级进度
            </CardTitle>
            <CardDescription>
              {eq?.levelName || '初善'} Lv.{eq?.level || 1} — {eq?.tier || '德者'}
              {equity?.nextLevelEquity ? ` → 下一级需要 ${equity.nextLevelEquity} ${vocab.value_unit}` : ' (已满级)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">当前: {eq?.totalEquity?.toFixed(0) || 0} {vocab.value_unit}</span>
                <span className="text-gray-600">{equity?.progress || 0}%</span>
              </div>
              <Progress value={equity?.progress || 0} className="h-3" />
              {/* 等级标志 */}
              <div className="flex justify-between mt-2">
                {[
                  { lv: 1, icon: '🌱', name: '初善', threshold: 0 },
                  { lv: 2, icon: '🌿', name: '进善', threshold: 100 },
                  { lv: 3, icon: '🌳', name: '明善', threshold: 500 },
                  { lv: 4, icon: '🏔️', name: '高善', threshold: 2000 },
                  { lv: 5, icon: '⭐', name: '至善', threshold: 10000 },
                ].map(l => (
                  <div key={l.lv} className={`text-center ${eq?.level === l.lv ? 'scale-110' : 'opacity-50'} transition-transform`}>
                    <div className="text-lg">{l.icon}</div>
                    <div className="text-xs font-medium">{l.name}</div>
                    <div className="text-xs text-gray-400">{l.threshold}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* 当前等级特权 */}
            {eq?.benefits && eq.benefits.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">当前等级特权</p>
                <div className="flex flex-wrap gap-2">
                  {eq.benefits.map((b, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快捷入口 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/moral-equity/tasks">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-amber-200">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">任务大厅</h3>
                <p className="text-sm text-gray-500 mt-1">浏览和完成道德任务，赚取{vocab.value_unit}</p>
                <div className="mt-3">
                  <Badge className="bg-amber-100 text-amber-700">今日已完成 {equity?.todayCompletions || 0} 项</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/moral-equity/vocabulary">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">词汇管理</h3>
                <p className="text-sm text-gray-500 mt-1">自定义所有术语，导入词汇资源</p>
                <div className="mt-3">
                  <Badge className="bg-blue-100 text-blue-700">管理者功能</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/living/moral">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">道德账本</h3>
                <p className="text-sm text-gray-500 mt-1">五维道德评分详情与善行记录</p>
                <div className="mt-3">
                  <Badge className="bg-purple-100 text-purple-700">五维评分</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 设计哲学说明 */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              {vocab.equity_name}设计哲学
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>道德行为定义价值</strong>：在传统股权体系中，价值由资本定义——谁出钱多，谁的股权就大。
                但在{vocab.equity_name}体系中，价值由道德行为定义——谁做的善行多、善行品质高，谁的股权就大。
                这是从资本逻辑到道德逻辑的根本转变。
              </p>
              <p>
                <strong>术语可自定义</strong>：系统不硬编码任何术语。管理者可以将&quot;{vocab.value_unit}&quot;改名为&quot;功德&quot;、&quot;善点&quot;或任何符合社区文化的词汇，
                也可以将&quot;{vocab.equity_name}&quot;改名为&quot;德股&quot;或&quot;善权&quot;。
                所有用户可见的术语都通过词汇管理体系管理，支持JSON文档批量导入。
              </p>
              <p>
                <strong>新天枰倾斜</strong>：健全人帮助残疾人时，严重度维度自动提升；城市人帮助农村人时，恻隐维度自动提升；
                富裕者帮助贫困者时，奉献维度自动提升——天枰永远向弱势一方倾斜。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <TabBar />
    </div>
  )
}
