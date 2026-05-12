'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, Heart, Activity, AlertTriangle, TrendingUp, Users, ArrowLeft, RefreshCw, Zap, Shield, Sparkles } from 'lucide-react'

interface LivingStatus {
  timestamp: number
  nervous: {
    activePlugs: Array<{ id: string; name: string; type: string; channels: string[] }>
    totalPlugs: number
    channels: string[]
    recentSignals: Array<{ id: string; channel: string; from: string; payload: any; timestamp: number }>
    description: string
  }
  digestive: {
    totalErrors: number
    byGrade: Record<string, number>
    unhandled: number
    recentCritical: any[]
    persistedCount: number
    recentPersistedErrors: any[]
    description: string
  }
  dopamine: {
    totalRecords: number
    totalDopamine: number
    uniqueUsers: number
    actionTypeDistribution: Record<string, number>
    persistedCount: number
    recentDopamine: any[]
    description: string
  }
}

export default function LivingSystemPage() {
  const [status, setStatus] = useState<LivingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
    // 每10秒自动刷新
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/living/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setError(null)
      } else {
        setError('获取活体系统状态失败')
      }
    } catch (err) {
      setError('无法连接活体系统')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString('zh-CN')
  }

  const gradeLabel = (grade: string) => {
    switch (grade) {
      case 'noise': return { text: '放屁', color: 'bg-gray-100 text-gray-600' }
      case 'known': return { text: '正常排便', color: 'bg-yellow-100 text-yellow-700' }
      case 'critical': return { text: '拉肚子', color: 'bg-red-100 text-red-700' }
      default: return { text: grade, color: 'bg-gray-100 text-gray-600' }
    }
  }

  const actionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      donate: '捐款',
      create_project: '创建项目',
      volunteer: '志愿服务',
      help: '互助',
      share: '分享',
      comment: '评论',
      verify: '验证',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">活体系统检测中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold">活体系统监控面板</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        </div>
      )}

      {status && (
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* 三大系统概览 */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* 神经系统 */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Brain className="h-5 w-5" />
                  神经系统
                </CardTitle>
                <CardDescription>信号传递 · 电线插座</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">已接入模块</span>
                  <span className="font-semibold">{status.nervous.totalPlugs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">活跃频道</span>
                  <span className="font-semibold">{status.nervous.channels.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">活跃插头</span>
                  <span className="font-semibold text-blue-600">{status.nervous.activePlugs.length}</span>
                </div>
                <div className="space-y-1">
                  {status.nervous.activePlugs.map((plug) => (
                    <div key={plug.id} className="flex items-center gap-2 text-xs bg-blue-50 rounded px-2 py-1">
                      <Zap className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">{plug.name}</span>
                      <span className="text-gray-400">({plug.type})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 消化系统 */}
            <Card className="border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Shield className="h-5 w-5" />
                  消化排泄系统
                </CardTitle>
                <CardDescription>吃进错误 · 排出无害物</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">内存错误</span>
                  <span className="font-semibold">{status.digestive.totalErrors}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">持久化错误</span>
                  <span className="font-semibold text-yellow-600">{status.digestive.persistedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">未处理</span>
                  <span className={`font-semibold ${status.digestive.unhandled > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {status.digestive.unhandled}
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(status.digestive.byGrade).map(([grade, count]) => {
                    const label = gradeLabel(grade)
                    return (
                      <div key={grade} className="flex items-center justify-between text-xs">
                        <Badge variant="secondary" className={label.color}>{label.text}</Badge>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 多巴胺系统 */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Sparkles className="h-5 w-5" />
                  多巴胺系统
                </CardTitle>
                <CardDescription>做对了就奖赏 · 正向循环</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">善行记录</span>
                  <span className="font-semibold">{status.dopamine.totalRecords}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">持久化记录</span>
                  <span className="font-semibold text-green-600">{status.dopamine.persistedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">总多巴胺</span>
                  <span className="font-semibold text-green-600">{status.dopamine.totalDopamine}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">善行人数</span>
                  <span className="font-semibold">{status.dopamine.uniqueUsers}</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(status.dopamine.actionTypeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{actionTypeLabel(type)}</span>
                      <span className="font-medium">{count as number}次</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近信号 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                最近神经信号
              </CardTitle>
              <CardDescription>神经系统最近传递的信号</CardDescription>
            </CardHeader>
            <CardContent>
              {status.nervous.recentSignals.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无信号记录</p>
              ) : (
                <div className="space-y-2">
                  {status.nervous.recentSignals.map((signal) => (
                    <div key={signal.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 text-sm">
                      <Badge variant="outline" className="text-xs shrink-0">{signal.channel}</Badge>
                      <span className="text-gray-600">from:</span>
                      <span className="font-medium">{signal.from}</span>
                      <span className="text-gray-400 text-xs ml-auto">{formatTime(signal.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近多巴胺记录 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                最近善行记录
              </CardTitle>
              <CardDescription>多巴胺系统最近分泌的奖励</CardDescription>
            </CardHeader>
            <CardContent>
              {status.dopamine.recentDopamine.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无善行记录</p>
              ) : (
                <div className="space-y-2">
                  {status.dopamine.recentDopamine.map((record: any) => (
                    <div key={record.id} className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-2 text-sm">
                      <Sparkles className="h-4 w-4 text-green-500 shrink-0" />
                      <Badge variant="secondary" className="text-xs">{actionTypeLabel(record.actionType)}</Badge>
                      <span className="text-gray-600">+{record.dopamineValue}</span>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>善良:{record.kindness}</span>
                        <span>恻隐:{record.compassion}</span>
                        <span>正义:{record.justice}</span>
                        <span>奉献:{record.dedication}</span>
                      </div>
                      <span className="text-gray-400 text-xs ml-auto">{formatTime(new Date(record.createdAt).getTime())}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近错误记录 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                最近排泄记录
              </CardTitle>
              <CardDescription>消化系统最近排出的错误</CardDescription>
            </CardHeader>
            <CardContent>
              {status.digestive.recentPersistedErrors.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无排泄记录 — 身体健康！</p>
              ) : (
                <div className="space-y-2">
                  {status.digestive.recentPersistedErrors.map((err: any) => {
                    const label = gradeLabel(err.grade)
                    return (
                      <div key={err.id} className="flex items-start gap-3 bg-yellow-50 rounded-lg px-4 py-2 text-sm">
                        <Badge variant="secondary" className={label.color + ' shrink-0'}>{label.text}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{err.message}</p>
                          <p className="text-xs text-gray-500">来源: {err.source}</p>
                          {err.suggestion && (
                            <p className="text-xs text-blue-600">建议: {err.suggestion}</p>
                          )}
                        </div>
                        <span className="text-gray-400 text-xs shrink-0">{formatTime(new Date(err.createdAt).getTime())}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
