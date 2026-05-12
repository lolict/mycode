'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Heart, Users, Calendar, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  content: string
  targetAmount: number
  currentAmount: number
  status: string
  endDate: string
  location?: string
  organizer?: string
  contact?: string
  category?: {
    id: string
    name: string
  }
  creator?: {
    id: string
    name: string
  }
  donorCount: number
}

interface CreateProjectData {
  title: string
  description: string
  content: string
  targetAmount: string
  endDate: string
  urgency: string
  location?: string
  organizer?: string
  contact?: string
}

interface DonationData {
  amount: string
  message: string
  anonymous: boolean
}

export default function StableCrowdfundingPlatform() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'donate'>('browse')
  
  // 创建项目表单
  const [createForm, setCreateForm] = useState<CreateProjectData>({
    title: '',
    description: '',
    content: '',
    targetAmount: '',
    endDate: '',
    urgency: 'normal',
    location: '',
    organizer: '',
    contact: ''
  })
  
  // 捐赠表单
  const [donateForm, setDonateForm] = useState<DonationData>({
    amount: '',
    message: '',
    anonymous: false
  })
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/projects?featured=true&limit=10')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('加载项目失败:', err)
      setError(err instanceof Error ? err.message : '加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!createForm.title || !createForm.description || !createForm.content || !createForm.targetAmount || !createForm.endDate) {
      setError('请填写所有必填字段')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || '创建项目失败')
      }

      // 成功创建
      alert('项目创建成功！')
      setCreateForm({
        title: '',
        description: '',
        content: '',
        targetAmount: '',
        endDate: '',
        urgency: 'normal',
        location: '',
        organizer: '',
        contact: ''
      })
      setActiveTab('browse')
      loadProjects()
      
    } catch (err) {
      console.error('创建项目失败:', err)
      setError(err instanceof Error ? err.message : '创建项目失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDonate = async (projectId: string) => {
    if (!donateForm.amount || parseFloat(donateForm.amount) <= 0) {
      setError('请输入有效的捐款金额')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/projects/${projectId}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donateForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || '捐款失败')
      }

      // 成功捐赠
      alert('捐款成功！感谢您的爱心支持！')
      setDonateForm({ amount: '', message: '', anonymous: false })
      setSelectedProject(null)
      loadProjects()
      
    } catch (err) {
      console.error('捐款失败:', err)
      setError(err instanceof Error ? err.message : '捐款失败')
    } finally {
      setSubmitting(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">圆聚助残平台</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'browse' ? 'default' : 'outline'}
                onClick={() => setActiveTab('browse')}
                className="border-pink-500 text-pink-600 hover:bg-pink-50"
              >
                浏览项目
              </Button>
              <Button
                variant={activeTab === 'create' ? 'default' : 'outline'}
                onClick={() => setActiveTab('create')}
                className="border-pink-500 text-pink-600 hover:bg-pink-50"
              >
                发起项目
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Browse Projects Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">助残众筹项目</h2>
              <p className="text-xl text-gray-600">各尽其能、物尽其用、人尽其力</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-pink-100 text-pink-800">
                        {project.category?.name || '公益'}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {project.status === 'active' ? '进行中' : project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>筹款进度</span>
                        <span className="font-semibold text-pink-600">
                          {getProgressPercentage(project.currentAmount, project.targetAmount).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(project.currentAmount, project.targetAmount)} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-pink-600">
                          {formatAmount(project.currentAmount)}
                        </div>
                        <div className="text-xs text-gray-600">已筹集</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatAmount(project.targetAmount)}
                        </div>
                        <div className="text-xs text-gray-600">目标</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.donorCount} 位支持者</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(project.endDate)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                        onClick={() => {
                          setSelectedProject(project)
                          setActiveTab('donate')
                        }}
                      >
                        立即捐款
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-pink-500 text-pink-600 hover:bg-pink-50"
                        onClick={() => window.open(`/project/${project.id}`, '_blank')}
                      >
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {projects.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">暂无项目，来发起第一个助残项目吧！</p>
                <Button 
                  className="mt-4 bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => setActiveTab('create')}
                >
                  发起项目
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create Project Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>发起助残项目</CardTitle>
                <CardDescription>
                  为农村残疾人和残疾人群体发起众筹项目，获得社会支持
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">项目标题 *</label>
                    <Input
                      placeholder="请输入项目标题"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">目标金额 (元) *</label>
                    <Input
                      type="number"
                      placeholder="请输入目标金额"
                      value={createForm.targetAmount}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">项目简介 *</label>
                  <Input
                    placeholder="请简要描述项目内容"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">项目详情 *</label>
                  <Textarea
                    placeholder="请详细描述项目背景、目标、实施方案等..."
                    value={createForm.content}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">结束日期 *</label>
                    <Input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">紧急程度</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={createForm.urgency}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, urgency: e.target.value }))}
                    >
                      <option value="normal">普通</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">项目地点</label>
                    <Input
                      placeholder="请输入项目地点"
                      value={createForm.location}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">发起机构</label>
                    <Input
                      placeholder="请输入发起机构名称"
                      value={createForm.organizer}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, organizer: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">联系方式</label>
                  <Input
                    placeholder="请输入联系方式"
                    value={createForm.contact}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={handleCreateProject}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      '创建项目'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setActiveTab('browse')}
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Donate Tab */}
        {activeTab === 'donate' && selectedProject && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>支持项目</CardTitle>
                <CardDescription>
                  为 "{selectedProject.title}" 项目献出爱心
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedProject.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedProject.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">筹款进度</span>
                    <span className="font-semibold text-pink-600">
                      {getProgressPercentage(selectedProject.currentAmount, selectedProject.targetAmount).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(selectedProject.currentAmount, selectedProject.targetAmount)} 
                    className="h-2 mt-2" 
                  />
                </div>

                {/* Donation Form */}
                <div>
                  <label className="text-sm font-medium mb-2 block">捐款金额 (元) *</label>
                  <Input
                    type="number"
                    placeholder="请输入捐款金额"
                    value={donateForm.amount}
                    onChange={(e) => setDonateForm(prev => ({ ...prev, amount: e.target.value }))}
                    min="1"
                  />
                  <div className="flex gap-2 mt-2">
                    {[10, 50, 100, 200, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonateForm(prev => ({ ...prev, amount: amount.toString() }))}
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
                    value={donateForm.message}
                    onChange={(e) => setDonateForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={donateForm.anonymous}
                    onChange={(e) => setDonateForm(prev => ({ ...prev, anonymous: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm">
                    匿名捐款
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => handleDonate(selectedProject.id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      '立即捐款'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedProject(null)
                      setActiveTab('browse')
                    }}
                  >
                    返回
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  感谢您的爱心支持，每一份善意都将传递温暖
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}