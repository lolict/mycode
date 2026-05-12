'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

interface CreateProjectData {
  title: string
  description: string
  content: string
  targetAmount: string
  endDate: string
  urgency: string
  location: string
  organizer: string
  contact: string
}

export default function SimpleCreatePage() {
  const [formData, setFormData] = useState<CreateProjectData>({
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
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.content || !formData.targetAmount || !formData.endDate) {
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
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || '创建项目失败')
      }

      // 成功创建
      setSuccess(true)
      setFormData({
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
      
    } catch (err) {
      console.error('创建项目失败:', err)
      setError(err instanceof Error ? err.message : '创建项目失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">项目创建成功！</CardTitle>
            <CardDescription>
              您的助残项目已成功创建，现在可以开始接受捐赠了。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => window.location.href = '/'}
              >
                返回首页
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSuccess(false)
                  setFormData({
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
                }}
              >
                创建另一个项目
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
            <h1 className="text-xl font-semibold">发起助残项目</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>发起助残项目</CardTitle>
              <CardDescription>
                为农村残疾人和残疾人群体发起众筹项目，获得社会支持
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">项目标题 *</label>
                    <Input
                      placeholder="请输入项目标题"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">目标金额 (元) *</label>
                    <Input
                      type="number"
                      placeholder="请输入目标金额"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">项目简介 *</label>
                  <Input
                    placeholder="请简要描述项目内容"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">项目详情 *</label>
                  <Textarea
                    placeholder="请详细描述项目背景、目标、实施方案等..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">结束日期 *</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">紧急程度</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
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
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">发起机构</label>
                    <Input
                      placeholder="请输入发起机构名称"
                      value={formData.organizer}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">联系方式</label>
                  <Input
                    placeholder="请输入联系方式"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit"
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
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
                    type="button"
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = '/'}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}