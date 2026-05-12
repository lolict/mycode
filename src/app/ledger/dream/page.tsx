'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Plus, Heart, Calendar, User, AlertCircle, CheckCircle, Clock, Star, Target, Users } from 'lucide-react'

export default function DreamLedgerPage() {
  const [dreamRecords, setDreamRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  
  // 表单数据
  const [formData, setFormData] = useState({
    content: '',
    dreamType: 'life',
    dreamTitle: '',
    description: '',
    motivation: '',
    targetDate: '',
    requiredResources: '',
    currentProgress: 0,
    actionSteps: '',
    obstacles: '',
    supportNeeded: '',
    expectedImpact: '',
    priority: 'medium',
    isShared: false,
    collaboration: false,
    privacy: 'private'
  })

  useEffect(() => {
    fetchDreamRecords()
  }, [])

  const fetchDreamRecords = async () => {
    try {
      const response = await fetch('/api/ledger/dream')
      if (response.ok) {
        const data = await response.json()
        setDreamRecords(data.dreamRecords || [])
      }
    } catch (error) {
      console.error('Failed to fetch dream records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.content.trim()) {
      alert('请填写梦想描述')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/ledger/dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'cmggkko6k0004qjiaunea7gfz', // 使用张三的ID
          content: formData.content,
          specialData: {
            dreamType: formData.dreamType,
            dreamTitle: formData.dreamTitle,
            description: formData.description,
            motivation: formData.motivation,
            targetDate: formData.targetDate,
            requiredResources: formData.requiredResources ? formData.requiredResources.split(',').map(r => r.trim()) : [],
            currentProgress: formData.currentProgress,
            actionSteps: formData.actionSteps ? formData.actionSteps.split('\n').map(s => s.trim()) : [],
            obstacles: formData.obstacles ? formData.obstacles.split('\n').map(o => o.trim()) : [],
            supportNeeded: formData.supportNeeded ? formData.supportNeeded.split(',').map(s => s.trim()) : [],
            expectedImpact: formData.expectedImpact,
            priority: formData.priority,
            isShared: formData.isShared,
            collaboration: formData.collaboration
          },
          privacy: formData.privacy,
          tags: [formData.dreamType, formData.dreamTitle].filter(Boolean)
        }),
      })

      if (response.ok) {
        alert('梦想记录创建成功！')
        setFormData({
          content: '',
          dreamType: 'life',
          dreamTitle: '',
          description: '',
          motivation: '',
          targetDate: '',
          requiredResources: '',
          currentProgress: 0,
          actionSteps: '',
          obstacles: '',
          supportNeeded: '',
          expectedImpact: '',
          priority: 'medium',
          isShared: false,
          collaboration: false,
          privacy: 'private'
        })
        setActiveTab('list')
        fetchDreamRecords()
      } else {
        const error = await response.json()
        alert(error.error || '创建失败，请重试')
      }
    } catch (error) {
      console.error('Failed to create dream record:', error)
      alert('创建失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />待审核</Badge>
      case 'verified':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />已验证</Badge>
      case 'applied':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><Heart className="w-3 h-3 mr-1" />已应用</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDreamTypeBadge = (dreamType: string) => {
    const types = {
      life: { label: '生活梦想', color: 'text-green-600 border-green-600' },
      career: { label: '职业梦想', color: 'text-blue-600 border-blue-600' },
      health: { label: '健康梦想', color: 'text-red-600 border-red-600' },
      family: { label: '家庭梦想', color: 'text-purple-600 border-purple-600' },
      innovation: { label: '创新梦想', color: 'text-orange-600 border-orange-600' },
      social: { label: '社会梦想', color: 'text-indigo-600 border-indigo-600' }
    }
    const type = types[dreamType as keyof typeof types] || { label: dreamType, color: 'text-gray-600 border-gray-600' }
    return <Badge variant="outline" className={type.color}>{type.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="text-red-600 border-red-600">高优先级</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">中优先级</Badge>
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-600">低优先级</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/ledger">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回账本
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">梦境账本</h1>
              <p className="text-gray-600">记录美好梦想，照亮人生方向</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">梦想记录</TabsTrigger>
            <TabsTrigger value="create">新建梦想</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="grid gap-6">
              {dreamRecords.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无梦想记录</h3>
                    <p className="text-gray-500 mb-4">开始记录您的梦想，让人生更有方向</p>
                    <Button onClick={() => setActiveTab('create')} className="bg-pink-500 hover:bg-pink-600">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个梦想
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                dreamRecords.map((record: any) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(record.status)}
                            {getDreamTypeBadge(record.specialData?.dreamType)}
                            {getPriorityBadge(record.specialData?.priority)}
                            {record.specialData?.isShared && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Users className="w-3 h-3 mr-1" />
                                愿意分享
                              </Badge>
                            )}
                            {record.specialData?.collaboration && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Target className="w-3 h-3 mr-1" />
                                寻求合作
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">
                            {record.specialData?.dreamTitle || record.content}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {record.user?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-pink-600">价值 {record.value}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {record.specialData && (
                        <div className="space-y-4">
                          {record.specialData.description && (
                            <div>
                              <Label className="text-sm font-medium">梦想描述</Label>
                              <p className="text-sm text-gray-600">{record.specialData.description}</p>
                            </div>
                          )}
                          
                          {record.specialData.motivation && (
                            <div>
                              <Label className="text-sm font-medium">动机和原因</Label>
                              <p className="text-sm text-gray-600">{record.specialData.motivation}</p>
                            </div>
                          )}

                          {record.specialData.currentProgress !== undefined && (
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <Label className="text-sm font-medium">当前进度</Label>
                                <span className="text-pink-600">{record.specialData.currentProgress}%</span>
                              </div>
                              <Progress value={record.specialData.currentProgress} className="h-2" />
                            </div>
                          )}

                          {record.specialData.targetDate && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">目标实现时间</Label>
                                <p className="text-sm text-gray-600">{record.specialData.targetDate}</p>
                              </div>
                              {record.specialData.expectedImpact && (
                                <div>
                                  <Label className="text-sm font-medium">预期影响</Label>
                                  <p className="text-sm text-gray-600">{record.specialData.expectedImpact}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {record.specialData.requiredResources && record.specialData.requiredResources.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">所需资源</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.specialData.requiredResources.map((resource: string, index: number) => (
                                  <Badge key={index} variant="outline">{resource}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {record.specialData.supportNeeded && record.specialData.supportNeeded.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <Label className="text-sm font-medium text-blue-800">需要的支持</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.specialData.supportNeeded.map((support: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-blue-600 border-blue-600">{support}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {record.specialData.actionSteps && record.specialData.actionSteps.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">行动步骤</Label>
                              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                {record.specialData.actionSteps.map((step: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-pink-500 mt-1">•</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>创建梦想记录</CardTitle>
                <CardDescription>
                  详细描述您的梦想，让更多人了解并支持您的理想
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 基本信息 */}
                  <div>
                    <Label htmlFor="content">梦想简述 *</Label>
                    <Input
                      id="content"
                      placeholder="用一句话描述您的梦想..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dreamTitle">梦想标题</Label>
                      <Input
                        id="dreamTitle"
                        placeholder="给您的梦想起个名字..."
                        value={formData.dreamTitle}
                        onChange={(e) => handleInputChange('dreamTitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dreamType">梦想类型</Label>
                      <Select value={formData.dreamType} onValueChange={(value) => handleInputChange('dreamType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="life">生活梦想</SelectItem>
                          <SelectItem value="career">职业梦想</SelectItem>
                          <SelectItem value="health">健康梦想</SelectItem>
                          <SelectItem value="family">家庭梦想</SelectItem>
                          <SelectItem value="innovation">创新梦想</SelectItem>
                          <SelectItem value="social">社会梦想</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 详细描述 */}
                  <div>
                    <Label htmlFor="description">详细描述</Label>
                    <Textarea
                      id="description"
                      placeholder="详细描述您的梦想内容..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="motivation">动机和原因</Label>
                    <Textarea
                      id="motivation"
                      placeholder="为什么会有这个梦想？是什么激励着您？..."
                      value={formData.motivation}
                      onChange={(e) => handleInputChange('motivation', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* 目标和进度 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetDate">目标实现时间</Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => handleInputChange('targetDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">优先级</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">高优先级</SelectItem>
                          <SelectItem value="medium">中优先级</SelectItem>
                          <SelectItem value="low">低优先级</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentProgress">当前进度 ({formData.currentProgress}%)</Label>
                    <input
                      type="range"
                      id="currentProgress"
                      min="0"
                      max="100"
                      value={formData.currentProgress}
                      onChange={(e) => handleInputChange('currentProgress', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* 资源和支持 */}
                  <div>
                    <Label htmlFor="requiredResources">所需资源</Label>
                    <Input
                      id="requiredResources"
                      placeholder="用逗号分隔，如：资金、技术、人力、场地等"
                      value={formData.requiredResources}
                      onChange={(e) => handleInputChange('requiredResources', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="supportNeeded">需要的支持</Label>
                    <Input
                      id="supportNeeded"
                      placeholder="用逗号分隔，如：指导、合作、推广、资金等"
                      value={formData.supportNeeded}
                      onChange={(e) => handleInputChange('supportNeeded', e.target.value)}
                    />
                  </div>

                  {/* 行动计划 */}
                  <div>
                    <Label htmlFor="actionSteps">行动步骤</Label>
                    <Textarea
                      id="actionSteps"
                      placeholder="每行写一个步骤，描述实现梦想的具体行动计划..."
                      value={formData.actionSteps}
                      onChange={(e) => handleInputChange('actionSteps', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="obstacles">面临的障碍</Label>
                    <Textarea
                      id="obstacles"
                      placeholder="每行写一个障碍，描述实现梦想过程中可能遇到的困难..."
                      value={formData.obstacles}
                      onChange={(e) => handleInputChange('obstacles', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expectedImpact">预期影响</Label>
                    <Textarea
                      id="expectedImpact"
                      placeholder="实现这个梦想后，会对您和他人产生什么影响？..."
                      value={formData.expectedImpact}
                      onChange={(e) => handleInputChange('expectedImpact', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* 分享和合作 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isShared"
                        checked={formData.isShared}
                        onChange={(e) => handleInputChange('isShared', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="isShared">愿意分享这个梦想</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="collaboration"
                        checked={formData.collaboration}
                        onChange={(e) => handleInputChange('collaboration', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="collaboration">寻求合作支持</Label>
                    </div>
                  </div>

                  {/* 隐私设置 */}
                  <div>
                    <Label htmlFor="privacy">隐私设置</Label>
                    <Select value={formData.privacy} onValueChange={(value) => handleInputChange('privacy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">仅自己可见</SelectItem>
                        <SelectItem value="selective">选择性可见</SelectItem>
                        <SelectItem value="public">公开可见</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                      disabled={submitting}
                    >
                      {submitting ? '提交中...' : '创建梦想'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setActiveTab('list')}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}