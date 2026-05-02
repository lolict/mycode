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
import { ArrowLeft, Plus, Heart, Calendar, User, AlertCircle, CheckCircle, Clock, MapPin, Eye, Shield } from 'lucide-react'

export default function RealityLedgerPage() {
  const [realityRecords, setRealityRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  
  // 表单数据
  const [formData, setFormData] = useState({
    content: '',
    realityType: 'daily',
    eventTitle: '',
    eventDate: '',
    location: '',
    participants: '',
    detailedDescription: '',
    emotionalImpact: '',
    lessonsLearned: '',
    evidence: '',
    witnesses: '',
    consequences: '',
    resolution: '',
    currentStatus: '',
    futureOutlook: '',
    authenticity: 'verified',
    impact: 'personal'
  })

  useEffect(() => {
    fetchRealityRecords()
  }, [])

  const fetchRealityRecords = async () => {
    try {
      const response = await fetch('/api/ledger/reality')
      if (response.ok) {
        const data = await response.json()
        setRealityRecords(data.realityRecords || [])
      }
    } catch (error) {
      console.error('Failed to fetch reality records:', error)
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
      alert('请填写实账本描述')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/ledger/reality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'cmggkko6k0004qjiaunea7gfz', // 使用张三的ID
          content: formData.content,
          specialData: {
            realityType: formData.realityType,
            eventTitle: formData.eventTitle,
            eventDate: formData.eventDate,
            location: formData.location,
            participants: formData.participants ? formData.participants.split(',').map(p => p.trim()) : [],
            detailedDescription: formData.detailedDescription,
            emotionalImpact: formData.emotionalImpact,
            lessonsLearned: formData.lessonsLearned,
            evidence: formData.evidence ? formData.evidence.split(',').map(e => e.trim()) : [],
            witnesses: formData.witnesses ? formData.witnesses.split(',').map(w => w.trim()) : [],
            consequences: formData.consequences ? formData.consequences.split('\n').map(c => c.trim()) : [],
            resolution: formData.resolution,
            currentStatus: formData.currentStatus,
            futureOutlook: formData.futureOutlook,
            authenticity: formData.authenticity,
            impact: formData.impact
          },
          privacy: 'private',
          tags: [formData.realityType, formData.eventTitle].filter(Boolean)
        }),
      })

      if (response.ok) {
        alert('实账本记录创建成功！')
        setFormData({
          content: '',
          realityType: 'daily',
          eventTitle: '',
          eventDate: '',
          location: '',
          participants: '',
          detailedDescription: '',
          emotionalImpact: '',
          lessonsLearned: '',
          evidence: '',
          witnesses: '',
          consequences: '',
          resolution: '',
          currentStatus: '',
          futureOutlook: '',
          authenticity: 'verified',
          impact: 'personal'
        })
        setActiveTab('list')
        fetchRealityRecords()
      } else {
        const error = await response.json()
        alert(error.error || '创建失败，请重试')
      }
    } catch (error) {
      console.error('Failed to create reality record:', error)
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

  const getRealityTypeBadge = (realityType: string) => {
    const types = {
      daily: { label: '日常生活', color: 'text-green-600 border-green-600' },
      struggle: { label: '奋斗经历', color: 'text-red-600 border-red-600' },
      achievement: { label: '成就记录', color: 'text-blue-600 border-blue-600' },
      change: { label: '改变转折', color: 'text-purple-600 border-purple-600' },
      truth: { label: '真相揭露', color: 'text-orange-600 border-orange-600' }
    }
    const type = types[realityType as keyof typeof types] || { label: realityType, color: 'text-gray-600 border-gray-600' }
    return <Badge variant="outline" className={type.color}>{type.label}</Badge>
  }

  const getImpactBadge = (impact: string) => {
    const impacts = {
      personal: { label: '个人', color: 'text-gray-600 border-gray-600' },
      family: { label: '家庭', color: 'text-green-600 border-green-600' },
      community: { label: '社区', color: 'text-blue-600 border-blue-600' },
      social: { label: '社会', color: 'text-purple-600 border-purple-600' }
    }
    const impactBadge = impacts[impact as keyof typeof impacts] || { label: impact, color: 'text-gray-600 border-gray-600' }
    return <Badge variant="outline" className={impactBadge.color}>{impactBadge.label}</Badge>
  }

  const getAuthenticityBadge = (authenticity: string) => {
    switch (authenticity) {
      case 'verified':
        return <Badge variant="outline" className="text-green-600 border-green-600"><Shield className="w-3 h-3 mr-1" />已验证</Badge>
      case 'reported':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Eye className="w-3 h-3 mr-1" />被报告</Badge>
      case 'alleged':
        return <Badge variant="outline" className="text-red-600 border-red-600"><AlertCircle className="w-3 h-3 mr-1" />据称</Badge>
      default:
        return <Badge variant="outline">{authenticity}</Badge>
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
              <h1 className="text-2xl font-bold text-gray-900">实账本</h1>
              <p className="text-gray-600">记录真实经历，见证人生历程</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">实账本记录</TabsTrigger>
            <TabsTrigger value="create">新建记录</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="grid gap-6">
              {realityRecords.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Eye className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无实账本记录</h3>
                    <p className="text-gray-500 mb-4">开始记录您的真实经历，见证人生历程</p>
                    <Button onClick={() => setActiveTab('create')} className="bg-pink-500 hover:bg-pink-600">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一条记录
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                realityRecords.map((record: any) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(record.status)}
                            {getRealityTypeBadge(record.specialData?.realityType)}
                            {getImpactBadge(record.specialData?.impact)}
                            {getAuthenticityBadge(record.specialData?.authenticity)}
                          </div>
                          <CardTitle className="text-lg">
                            {record.specialData?.eventTitle || record.content}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {record.user?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {record.specialData?.eventDate || new Date(record.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            {record.specialData?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {record.specialData.location}
                              </span>
                            )}
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
                          {record.specialData.detailedDescription && (
                            <div>
                              <Label className="text-sm font-medium">详细描述</Label>
                              <p className="text-sm text-gray-600">{record.specialData.detailedDescription}</p>
                            </div>
                          )}

                          {record.specialData.emotionalImpact && (
                            <div>
                              <Label className="text-sm font-medium">情感影响</Label>
                              <p className="text-sm text-gray-600">{record.specialData.emotionalImpact}</p>
                            </div>
                          )}

                          {record.specialData.lessonsLearned && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <Label className="text-sm font-medium text-blue-800">学到的教训</Label>
                              <p className="text-sm text-blue-600">{record.specialData.lessonsLearned}</p>
                            </div>
                          )}

                          {record.specialData.participants && record.specialData.participants.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">参与者</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.specialData.participants.map((participant: string, index: number) => (
                                  <Badge key={index} variant="outline">{participant}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {record.specialData.evidence && record.specialData.evidence.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">证据材料</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.specialData.evidence.map((evidence: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-green-600 border-green-600">{evidence}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {record.specialData.witnesses && record.specialData.witnesses.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">见证人</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {record.specialData.witnesses.map((witness: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-blue-600 border-blue-600">{witness}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {record.specialData.consequences && record.specialData.consequences.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">后果影响</Label>
                              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                {record.specialData.consequences.map((consequence: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-pink-500 mt-1">•</span>
                                    <span>{consequence}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {record.specialData.resolution && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <Label className="text-sm font-medium text-green-800">解决方案</Label>
                              <p className="text-sm text-green-600">{record.specialData.resolution}</p>
                            </div>
                          )}

                          {record.specialData.currentStatus && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">当前状态</Label>
                                <p className="text-sm text-gray-600">{record.specialData.currentStatus}</p>
                              </div>
                              {record.specialData.futureOutlook && (
                                <div>
                                  <Label className="text-sm font-medium">未来展望</Label>
                                  <p className="text-sm text-gray-600">{record.specialData.futureOutlook}</p>
                                </div>
                              )}
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
                <CardTitle>创建实账本记录</CardTitle>
                <CardDescription>
                  真实记录生活中的重要事件，见证人生历程
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 基本信息 */}
                  <div>
                    <Label htmlFor="content">事件简述 *</Label>
                    <Input
                      id="content"
                      placeholder="用一句话描述这个事件..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventTitle">事件标题</Label>
                      <Input
                        id="eventTitle"
                        placeholder="给这个事件起个标题..."
                        value={formData.eventTitle}
                        onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="realityType">事件类型</Label>
                      <Select value={formData.realityType} onValueChange={(value) => handleInputChange('realityType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">日常生活</SelectItem>
                          <SelectItem value="struggle">奋斗经历</SelectItem>
                          <SelectItem value="achievement">成就记录</SelectItem>
                          <SelectItem value="change">改变转折</SelectItem>
                          <SelectItem value="truth">真相揭露</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 事件详情 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventDate">事件发生时间</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">事件地点</Label>
                      <Input
                        id="location"
                        placeholder="事件发生的地点..."
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="participants">参与者</Label>
                    <Input
                      id="participants"
                      placeholder="用逗号分隔，如：张三,李四,医生等"
                      value={formData.participants}
                      onChange={(e) => handleInputChange('participants', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="detailedDescription">详细描述</Label>
                    <Textarea
                      id="detailedDescription"
                      placeholder="详细描述事件的经过、背景、具体情况..."
                      value={formData.detailedDescription}
                      onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                      rows={5}
                    />
                  </div>

                  {/* 情感和教训 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emotionalImpact">情感影响</Label>
                      <Textarea
                        id="emotionalImpact"
                        placeholder="这个事件对您情感上的影响..."
                        value={formData.emotionalImpact}
                        onChange={(e) => handleInputChange('emotionalImpact', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lessonsLearned">学到的教训</Label>
                      <Textarea
                        id="lessonsLearned"
                        placeholder="从这个事件中学到的教训和感悟..."
                        value={formData.lessonsLearned}
                        onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* 证据和见证 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="evidence">证据材料</Label>
                      <Input
                        id="evidence"
                        placeholder="用逗号分隔，如：照片、视频、文件、记录等"
                        value={formData.evidence}
                        onChange={(e) => handleInputChange('evidence', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="witnesses">见证人</Label>
                      <Input
                        id="witnesses"
                        placeholder="用逗号分隔，如：目击者、相关人员等"
                        value={formData.witnesses}
                        onChange={(e) => handleInputChange('witnesses', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 后果和解决方案 */}
                  <div>
                    <Label htmlFor="consequences">后果影响</Label>
                    <Textarea
                      id="consequences"
                      placeholder="每行写一个后果，描述事件带来的各种影响..."
                      value={formData.consequences}
                      onChange={(e) => handleInputChange('consequences', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="resolution">解决方案</Label>
                    <Textarea
                      id="resolution"
                      placeholder="如何解决这个问题或处理这个情况..."
                      value={formData.resolution}
                      onChange={(e) => handleInputChange('resolution', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* 状态和展望 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentStatus">当前状态</Label>
                      <Textarea
                        id="currentStatus"
                        placeholder="事件目前的处理状态..."
                        value={formData.currentStatus}
                        onChange={(e) => handleInputChange('currentStatus', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="futureOutlook">未来展望</Label>
                      <Textarea
                        id="futureOutlook"
                        placeholder="对未来可能的影响和预期..."
                        value={formData.futureOutlook}
                        onChange={(e) => handleInputChange('futureOutlook', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* 验证和影响 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="authenticity">真实性</Label>
                      <Select value={formData.authenticity} onValueChange={(value) => handleInputChange('authenticity', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">已验证</SelectItem>
                          <SelectItem value="reported">被报告</SelectItem>
                          <SelectItem value="alleged">据称</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="impact">影响范围</Label>
                      <Select value={formData.impact} onValueChange={(value) => handleInputChange('impact', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">个人</SelectItem>
                          <SelectItem value="family">家庭</SelectItem>
                          <SelectItem value="community">社区</SelectItem>
                          <SelectItem value="social">社会</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                      disabled={submitting}
                    >
                      {submitting ? '提交中...' : '创建记录'}
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