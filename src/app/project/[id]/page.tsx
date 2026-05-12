'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Users, MapPin, Calendar, Share2, ArrowLeft, User, Brain, Sparkles } from 'lucide-react'
import { useNeuralPlug, useDigest, useDopamine } from '@/core/v2/hooks'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState('')
  const [donationMessage, setDonationMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [dopamineResult, setDopamineResult] = useState<{
    value: number
    score: any
  } | null>(null)

  // === 活体系统接入 ===
  // 神经系统：插上插头，接收捐款相关信号
  const { emit: emitNeural, connected: neuralConnected } = useNeuralPlug({
    id: `project-detail-${projectId}`,
    name: '项目详情页',
    type: 'app',
    channels: ['action:donate', 'project:updated', 'dopamine:released'],
    onSignal: (signal) => {
      // 收到其他地方的捐款信号时，刷新页面数据
      if (signal.channel === 'action:donate' && signal.payload.targetId === projectId) {
        fetchProject()
        fetchDonations()
      }
    },
  })

  // 消化系统：安全执行，错误自动消化
  const { safeExec, loading: digesting, error: digestError, clearError } = useDigest('捐款')

  // 多巴胺系统：善行评分
  const { lastScore, totalDopamine } = useDopamine('temp-user-id')

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchDonations()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        router.push('/projects')
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchDonations = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/donations`)
      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations || [])
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error)
    }
  }

  const handleDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      return
    }

    // 通过消化系统安全执行捐款
    const result = await safeExec(async () => {
      const response = await fetch(`/api/projects/${projectId}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(donationAmount),
          message: donationMessage,
          anonymous,
          donorId: 'temp-user-id',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '捐款失败')
      }

      return response.json()
    })

    if (result && !(result && 'grade' in result)) {
      // 捐款成功！
      setDonationAmount('')
      setDonationMessage('')
      setAnonymous(false)

      // 显示多巴胺评分结果
      if (result.dopamine) {
        setDopamineResult(result.dopamine)
      }

      // 通过神经系统广播捐款信号
      emitNeural('action:donate', {
        type: 'donate',
        userId: 'temp-user-id',
        targetId: projectId,
        amount: parseFloat(donationAmount),
      })

      fetchProject()
      fetchDonations()
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">项目不存在</h2>
          <Link href="/projects">
            <Button>返回项目列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回项目列表
              </Button>
            </Link>
            <div className="flex-1"></div>
            {/* 神经系统连接状态指示灯 */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${neuralConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <Brain className="h-3.5 w-3.5" />
              <span>{neuralConnected ? '神经系统已连接' : '未连接'}</span>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                        {project.category?.name || '公益'}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {project.status === 'active' ? '进行中' : project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-base">{project.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">筹款进度</span>
                      <span className="font-semibold text-pink-600">
                        {getProgressPercentage(project.currentAmount, project.targetAmount).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(project.currentAmount, project.targetAmount)}
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-pink-600">
                        {formatAmount(project.currentAmount)}
                      </div>
                      <div className="text-sm text-gray-600">已筹集</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatAmount(project.targetAmount)}
                      </div>
                      <div className="text-sm text-gray-600">目标金额</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {getDaysLeft(project.endDate)}
                      </div>
                      <div className="text-sm text-gray-600">剩余天数</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.donorCount} 位支持者</span>
                    </div>
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>截止 {new Date(project.endDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Content */}
            <Card>
              <CardHeader>
                <CardTitle>项目详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{project.content}</div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>发起方信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={project.creator?.avatar} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.creator?.name || '匿名用户'}</h3>
                    {project.organizer && (
                      <p className="text-sm text-gray-600">{project.organizer}</p>
                    )}
                    {project.contact && (
                      <p className="text-sm text-gray-600">联系方式: {project.contact}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donations */}
            <Card>
              <CardHeader>
                <CardTitle>爱心支持 ({donations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {donations.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">暂无支持记录，成为第一个支持者吧！</p>
                  ) : (
                    donations.map((donation: any) => (
                      <div key={donation.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={donation.donor?.avatar} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {donation.anonymous ? '匿名用户' : donation.donor?.name || '爱心人士'}
                            </span>
                            <span className="text-pink-600 font-semibold">
                              {formatAmount(donation.amount)}
                            </span>
                          </div>
                          {donation.message && (
                            <p className="text-sm text-gray-600 mt-1">{donation.message}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(donation.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  支持项目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">捐款金额 (元)</label>
                  <Input
                    type="number"
                    placeholder="请输入捐款金额"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    min="1"
                  />
                  <div className="flex gap-2 mt-2">
                    {[10, 50, 100, 200, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(amount.toString())}
                      >
                        ¥{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">留言 (可选)</label>
                  <Textarea
                    placeholder="为项目加油打气..."
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm">
                    匿名捐款
                  </label>
                </div>

                <Button
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={handleDonation}
                  disabled={digesting || !donationAmount}
                >
                  {digesting ? '处理中...' : '立即捐款'}
                </Button>

                {/* 消化系统的错误提示 — 如果有错误，说明消化系统排出了大便 */}
                {digestError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    <p>{digestError}</p>
                    <Button variant="link" size="sm" onClick={clearError} className="text-yellow-700 p-0 h-auto">
                      关闭
                    </Button>
                  </div>
                )}

                {/* 多巴胺评分展示 — 做善事后显示的奖励 */}
                {dopamineResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-800 font-semibold">
                      <Sparkles className="h-5 w-5" />
                      善行已记录！多巴胺 +{dopamineResult.value}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">善良</span>
                        <span className="font-medium">{dopamineResult.score.kindness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">恻隐</span>
                        <span className="font-medium">{dopamineResult.score.compassion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">正义</span>
                        <span className="font-medium">{dopamineResult.score.justice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">奉献</span>
                        <span className="font-medium">{dopamineResult.score.dedication}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      五维道德评分 · 加权总分 {dopamineResult.score.total}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                  感谢您的爱心支持，每一份善意都将传递温暖
                </p>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle>分享项目</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  分享这个项目，让更多人参与进来
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    微信
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    微博
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    复制链接
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
