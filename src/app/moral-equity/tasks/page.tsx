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
  Landmark, Users, Siren, Eye, Sun, Clock, Home, MessageCircle,
  Share2, UserPlus, Gift, Lightbulb, Rocket, GraduationCap,
  Mountain, TreePine, Leaf, Gauge
} from 'lucide-react'

interface TaskItem {
  id: string
  code: string
  name: string
  description: string
  category: string
  moralValue: number
  difficulty: string
  icon: string | null
  color: string | null
  conditions: any
  rewards: any
  completedToday: boolean
  isActive: boolean
  sortOrder: number
}

interface TaskCategoryInfo {
  id: string
  name: string
  description: string
  icon: string
  color: string
  resetCycle: string
}

const ICON_MAP: Record<string, any> = {
  CheckCircle, Share2: Heart, MessageCircle, BookOpen, Shield,
  HandHeart, Heart, Clock, Home, GraduationCap, Rocket, Scale,
  Lightbulb: Star, UserPlus: Users, Gift: Heart, Trophy, Siren, Eye,
  Users, Sun, Calendar, Star, Flame, Mountain, TreePine, Leaf, Gauge, Target,
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; icon: any; multiplier: number }> = {
  easy:     { label: '简单', color: 'bg-green-100 text-green-700', icon: Leaf, multiplier: 1.0 },
  medium:   { label: '普通', color: 'bg-blue-100 text-blue-700', icon: TreePine, multiplier: 1.5 },
  hard:     { label: '困难', color: 'bg-orange-100 text-orange-700', icon: Mountain, multiplier: 2.5 },
  legendary: { label: '传奇', color: 'bg-yellow-100 text-yellow-700', icon: Crown, multiplier: 4.0 },
}

const CATEGORY_COLORS: Record<string, string> = {
  daily: 'from-amber-500 to-orange-500',
  weekly: 'from-blue-500 to-indigo-500',
  monthly: 'from-purple-500 to-violet-500',
  'one-time': 'from-green-500 to-emerald-500',
  special: 'from-red-500 to-rose-500',
}

export default function MoralTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [categories, setCategories] = useState<TaskCategoryInfo[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('daily')
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [valueUnit, setValueUnit] = useState('德值')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const userRes = await fetch('/api/users/demo')
      let userId = 'demo-user'
      if (userRes.ok) {
        const userData = await userRes.json()
        userId = userData.user?.id || userId
      }

      const [tasksRes, vocabRes] = await Promise.all([
        fetch(`/api/moral-equity/tasks?userId=${userId}`),
        fetch('/api/moral-equity/vocabulary?category=value_unit'),
      ])

      if (tasksRes.ok) {
        const data = await tasksRes.json()
        setTasks(data.tasks || [])
        setCategories(data.categories || [])
      }

      if (vocabRes.ok) {
        const vocabData = await vocabRes.json()
        const unitVocab = vocabData.vocabularies?.find((v: any) => v.vocabKey === 'value_unit')
        if (unitVocab?.displayValue) setValueUnit(unitVocab.displayValue)
      }
    } catch (error) {
      console.error('加载任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function completeTask(taskCode: string) {
    setCompleting(taskCode)
    setResult(null)
    try {
      const userRes = await fetch('/api/users/demo')
      let userId = 'demo-user'
      if (userRes.ok) {
        const userData = await userRes.json()
        userId = userData.user?.id || userId
      }

      const res = await fetch('/api/moral-equity/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskCode, userId }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult(data)
        // 更新任务完成状态
        setTasks(prev => prev.map(t =>
          t.code === taskCode ? { ...t, completedToday: true } : t
        ))
        // 3秒后隐藏结果
        setTimeout(() => setResult(null), 5000)
      } else {
        alert(data.error || '完成任务失败')
      }
    } catch (error) {
      console.error('完成任务失败:', error)
      alert('完成任务失败')
    } finally {
      setCompleting(null)
    }
  }

  const filteredTasks = tasks.filter(t => t.category === activeCategory)
  const dailyCompleted = tasks.filter(t => t.category === 'daily' && t.completedToday).length
  const dailyTotal = tasks.filter(t => t.category === 'daily').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <Activity className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/moral-equity">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-1" />
                道德股权
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">任务大厅</h1>
            <p className="text-white/80">完成{valueUnit}任务，积攒道德股权</p>
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <span>今日进度: {dailyCompleted}/{dailyTotal}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 完成结果弹出 */}
      {result && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-xl max-w-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-green-800">任务完成!</p>
              <p className="text-lg font-bold text-amber-600">+{result.completion.moralValueEarned} {valueUnit}</p>
              {result.leveledUp && (
                <Badge className="bg-purple-100 text-purple-700 mt-1">
                  升级! Lv.{result.newLevel.level} {result.newLevel.tier}
                </Badge>
              )}
              <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500">
                <span>连续{result.completion.streakDays}天</span>
                <span>五维总分: {result.completion.fiveDimScore?.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 任务分类标签 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border hover:bg-amber-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 当前分类信息 */}
        {categories.filter(c => c.id === activeCategory).map(cat => (
          <Card key={cat.id} className="bg-white/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">{cat.resetCycle}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* 任务列表 */}
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const diffConfig = DIFFICULTY_CONFIG[task.difficulty] || DIFFICULTY_CONFIG.easy
            const DiffIcon = diffConfig.icon
            const earnedValue = Math.round(task.moralValue * diffConfig.multiplier)

            return (
              <Card key={task.id} className={`transition-all ${task.completedToday ? 'opacity-60' : 'hover:shadow-lg'}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* 图标 */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      task.completedToday ? 'bg-gray-100' : 'bg-gradient-to-br ' + (CATEGORY_COLORS[task.category] || 'from-amber-500 to-orange-500')
                    } text-white`}>
                      {task.completedToday ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Target className="h-6 w-6" />
                      )}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{task.name}</h3>
                        <Badge className={`text-xs ${diffConfig.color}`}>
                          <DiffIcon className="h-3 w-3 mr-1" />
                          {diffConfig.label}
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          +{earnedValue} {valueUnit}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>

                      {/* 奖励信息 */}
                      {task.rewards && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.rewards.bonus_kindness && (
                            <Badge variant="outline" className="text-xs text-red-500 border-red-200">善良+{task.rewards.bonus_kindness}</Badge>
                          )}
                          {task.rewards.bonus_compassion && (
                            <Badge variant="outline" className="text-xs text-orange-500 border-orange-200">恻隐+{task.rewards.bonus_compassion}</Badge>
                          )}
                          {task.rewards.bonus_justice && (
                            <Badge variant="outline" className="text-xs text-blue-500 border-blue-200">正义+{task.rewards.bonus_justice}</Badge>
                          )}
                          {task.rewards.bonus_dedication && (
                            <Badge variant="outline" className="text-xs text-purple-500 border-purple-200">奉献+{task.rewards.bonus_dedication}</Badge>
                          )}
                          {task.rewards.bonus_severity && (
                            <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-200">严重度+{task.rewards.bonus_severity}</Badge>
                          )}
                          {task.rewards.title && (
                            <Badge className="text-xs bg-amber-100 text-amber-700">称号: {task.rewards.title}</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 完成按钮 */}
                    <Button
                      size="sm"
                      disabled={task.completedToday || completing === task.code}
                      onClick={() => completeTask(task.code)}
                      className={`shrink-0 ${
                        task.completedToday
                          ? 'bg-green-100 text-green-600 hover:bg-green-100'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {task.completedToday ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          已完成
                        </>
                      ) : completing === task.code ? (
                        <Activity className="h-4 w-4 animate-spin" />
                      ) : (
                        '完成'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">暂无此分类任务</h3>
              <p className="text-gray-400 mt-1">请切换到其他分类查看</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
