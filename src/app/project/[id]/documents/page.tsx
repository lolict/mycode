'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Upload, FileText, Eye, EyeOff, CheckCircle, Clock, XCircle } from 'lucide-react'

const DOCUMENT_TYPES = [
  { value: 'personal_video', label: '个人短视频', description: '展示个人生活和情况的视频' },
  { value: 'life_photos', label: '个人生活照片', description: '日常生活照片' },
  { value: 'only_child_certificate', label: '独生子女证', description: '独生子女证明文件' },
  { value: 'single_parent_proof', label: '单亲离异重组家庭证明', description: '家庭状况证明' },
  { value: 'poverty_certificate', label: '立卡贫困户证明', description: '贫困证明文件' },
  { value: 'disability_certificate', label: '残疾人证明', description: '残疾证明文件' },
  { value: 'unemployment_certificate', label: '无业证明', description: '无业状态证明' },
  { value: 'id_card', label: '个人身份证明', description: '身份证件' },
  { value: 'education_certificate', label: '个人学历证明', description: '学历证书' },
  { value: 'family_contacts', label: '亲人联系方式和照片', description: '家人联系信息' },
  { value: 'medical_history', label: '个人历史病情起因', description: '病史和医疗记录' },
  { value: 'oral_history', label: '口述历史记录信息', description: '个人经历口述记录' }
]

export default function ProjectDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  
  const [formData, setFormData] = useState({
    docType: '',
    content: '',
    isPublic: false
  })

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchDocuments()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.docType || !formData.content) {
      alert('请填写完整的文档信息')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('文档上传成功！')
        setFormData({ docType: '', content: '', isPublic: false })
        fetchDocuments()
      } else {
        const error = await response.json()
        alert(error.error || '文档上传失败，请重试')
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
      alert('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      default:
        return '待审核'
    }
  }

  const getDocumentTypeLabel = (docType: string) => {
    const type = DOCUMENT_TYPES.find(t => t.value === docType)
    return type ? type.label : docType
  }

  const filteredDocuments = documents.filter((doc: any) => {
    if (activeTab === 'all') return true
    if (activeTab === 'public') return doc.isPublic
    if (activeTab === 'private') return !doc.isPublic
    return true
  })

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
          <Link href={`/project/${projectId}`}>
            <Button>返回项目详情</Button>
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
            <Link href={`/project/${projectId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回项目详情
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">项目文档管理</h1>
              <p className="text-sm text-gray-600">{project.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 上传表单 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-pink-500" />
                  上传文档
                </CardTitle>
                <CardDescription>
                  上传项目相关证明材料和支持文档
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="docType">文档类型</Label>
                    <Select value={formData.docType} onValueChange={(value) => setFormData(prev => ({ ...prev, docType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择文档类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content">文档内容/链接</Label>
                    <Textarea
                      id="content"
                      placeholder="请输入文档内容或文件链接..."
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isPublic" className="text-sm">
                      公开显示（其他用户可见）
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    disabled={submitting}
                  >
                    {submitting ? '上传中...' : '上传文档'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 文档列表 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-pink-500" />
                  已上传文档 ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="public">公开</TabsTrigger>
                    <TabsTrigger value="private">私密</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-4">
                    {filteredDocuments.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">暂无文档</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredDocuments.map((doc: any) => (
                          <div key={doc.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">
                                    {getDocumentTypeLabel(doc.docType)}
                                  </h3>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {getStatusIcon(doc.status)}
                                    {getStatusText(doc.status)}
                                  </Badge>
                                  {doc.isPublic ? (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      公开
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <EyeOff className="h-3 w-3" />
                                      私密
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {doc.content}
                                </p>
                                <p className="text-xs text-gray-400">
                                  上传时间: {new Date(doc.createdAt).toLocaleString('zh-CN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}