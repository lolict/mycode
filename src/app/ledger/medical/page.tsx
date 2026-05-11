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
import { ArrowLeft, Plus, Heart, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function MedicalLedgerPage() {
  const [medicalRecords, setMedicalRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  
  // 表单数据
  const [formData, setFormData] = useState({
    content: '',
    diseaseType: '',
    cause: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    hospital: '',
    doctor: '',
    startDate: '',
    severity: 'medium',
    isChronic: false,
    needsHelp: false,
    helpType: '',
    privacy: 'private'
  })

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  const fetchMedicalRecords = async () => {
    try {
      const response = await fetch('/api/ledger/medical')
      if (response.ok) {
        const data = await response.json()
        setMedicalRecords(data.medicalRecords || [])
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error)
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
      alert('请填写病历描述')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/ledger/medical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'cmggkko6k0004qjiaunea7gfz', // 使用张三的ID
          content: formData.content,
          specialData: {
            diseaseType: formData.diseaseType,
            cause: formData.cause,
            diagnosis: formData.diagnosis,
            treatment: formData.treatment,
            medication: formData.medication,
            hospital: formData.hospital,
            doctor: formData.doctor,
            startDate: formData.startDate,
            severity: formData.severity,
            isChronic: formData.isChronic,
            needsHelp: formData.needsHelp,
            helpType: formData.helpType
          },
          privacy: formData.privacy,
          tags: formData.diseaseType ? [formData.diseaseType] : []
        }),
      })

      if (response.ok) {
        alert('病历记录创建成功！')
        setFormData({
          content: '',
          diseaseType: '',
          cause: '',
          diagnosis: '',
          treatment: '',
          medication: '',
          hospital: '',
          doctor: '',
          startDate: '',
          severity: 'medium',
          isChronic: false,
          needsHelp: false,
          helpType: '',
          privacy: 'private'
        })
        setActiveTab('list')
        fetchMedicalRecords()
      } else {
        const error = await response.json()
        alert(error.error || '创建失败，请重试')
      }
    } catch (error) {
      console.error('Failed to create medical record:', error)
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'mild':
        return <Badge variant="outline" className="text-green-600 border-green-600">轻微</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">中等</Badge>
      case 'severe':
        return <Badge variant="outline" className="text-red-600 border-red-600">严重</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
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
              <h1 className="text-2xl font-bold text-gray-900">病历账本</h1>
              <p className="text-gray-600">记录医疗历史，守护健康人生</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">病历记录</TabsTrigger>
            <TabsTrigger value="create">新建记录</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="grid gap-6">
              {medicalRecords.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Heart className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无病历记录</h3>
                    <p className="text-gray-500 mb-4">开始记录您的医疗历史，守护健康人生</p>
                    <Button onClick={() => setActiveTab('create')} className="bg-pink-500 hover:bg-pink-600">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一条记录
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                medicalRecords.map((record: any) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(record.status)}
                            {record.specialData?.severity && getSeverityBadge(record.specialData.severity)}
                            {record.specialData?.isChronic && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">慢性病</Badge>
                            )}
                            {record.specialData?.needsHelp && (
                              <Badge variant="outline" className="text-red-600 border-red-600">需要帮助</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{record.content}</CardTitle>
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
                        <div className="space-y-3">
                          {record.specialData.diseaseType && (
                            <div>
                              <Label className="text-sm font-medium">疾病类型</Label>
                              <p className="text-sm text-gray-600">{record.specialData.diseaseType}</p>
                            </div>
                          )}
                          {record.specialData.cause && (
                            <div>
                              <Label className="text-sm font-medium">病情起因</Label>
                              <p className="text-sm text-gray-600">{record.specialData.cause}</p>
                            </div>
                          )}
                          {record.specialData.diagnosis && (
                            <div>
                              <Label className="text-sm font-medium">诊断结果</Label>
                              <p className="text-sm text-gray-600">{record.specialData.diagnosis}</p>
                            </div>
                          )}
                          {record.specialData.treatment && (
                            <div>
                              <Label className="text-sm font-medium">治疗方案</Label>
                              <p className="text-sm text-gray-600">{record.specialData.treatment}</p>
                            </div>
                          )}
                          {record.specialData.hospital && (
                            <div>
                              <Label className="text-sm font-medium">就医医院</Label>
                              <p className="text-sm text-gray-600">{record.specialData.hospital}</p>
                            </div>
                          )}
                          {record.specialData.helpType && (
                            <div className="bg-red-50 p-3 rounded-lg">
                              <Label className="text-sm font-medium text-red-800">需要的帮助</Label>
                              <p className="text-sm text-red-600">{record.specialData.helpType}</p>
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
                <CardTitle>创建病历记录</CardTitle>
                <CardDescription>
                  详细记录您的医疗信息，便于获得精准帮扶
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 基本信息 */}
                  <div>
                    <Label htmlFor="content">病历描述 *</Label>
                    <Textarea
                      id="content"
                      placeholder="请描述您的病情状况、治疗经历等..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="diseaseType">疾病类型</Label>
                      <Input
                        id="diseaseType"
                        placeholder="如：高血压、糖尿病、骨折等"
                        value={formData.diseaseType}
                        onChange={(e) => handleInputChange('diseaseType', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">发病时间</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 病情详情 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cause">病情起因</Label>
                      <Textarea
                        id="cause"
                        placeholder="描述导致疾病的原因..."
                        value={formData.cause}
                        onChange={(e) => handleInputChange('cause', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diagnosis">诊断结果</Label>
                      <Textarea
                        id="diagnosis"
                        placeholder="医生的诊断结果..."
                        value={formData.diagnosis}
                        onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* 治疗信息 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="treatment">治疗方案</Label>
                      <Textarea
                        id="treatment"
                        placeholder="医生建议的治疗方案..."
                        value={formData.treatment}
                        onChange={(e) => handleInputChange('treatment', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medication">用药记录</Label>
                      <Textarea
                        id="medication"
                        placeholder="正在使用的药物..."
                        value={formData.medication}
                        onChange={(e) => handleInputChange('medication', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* 医疗机构 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hospital">就医医院</Label>
                      <Input
                        id="hospital"
                        placeholder="医院名称"
                        value={formData.hospital}
                        onChange={(e) => handleInputChange('hospital', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="doctor">主治医生</Label>
                      <Input
                        id="doctor"
                        placeholder="医生姓名"
                        value={formData.doctor}
                        onChange={(e) => handleInputChange('doctor', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 病情评估 */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="severity">严重程度</Label>
                      <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">轻微</SelectItem>
                          <SelectItem value="medium">中等</SelectItem>
                          <SelectItem value="severe">严重</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isChronic"
                        checked={formData.isChronic}
                        onChange={(e) => handleInputChange('isChronic', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="isChronic">慢性病</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="needsHelp"
                        checked={formData.needsHelp}
                        onChange={(e) => handleInputChange('needsHelp', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="needsHelp">需要帮助</Label>
                    </div>
                  </div>

                  {formData.needsHelp && (
                    <div>
                      <Label htmlFor="helpType">需要的帮助类型</Label>
                      <Textarea
                        id="helpType"
                        placeholder="请描述您需要的具体帮助，如：医疗费用、护理服务、康复设备等..."
                        value={formData.helpType}
                        onChange={(e) => handleInputChange('helpType', e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

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