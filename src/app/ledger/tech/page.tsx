'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Plus, Code, Lightbulb } from 'lucide-react'

/**
 * 德码共同体 — 技术账本
 * 技术贡献价值分配，代码就是贡献
 */

const TECH_TYPES = [
  { value: 'frontend', label: '前端开发', desc: 'React、Vue、小程序等' },
  { value: 'backend', label: '后端开发', desc: 'API、微服务、数据库等' },
  { value: 'mobile', label: '移动开发', desc: 'iOS、Android、跨平台等' },
  { value: 'devops', label: '运维部署', desc: 'CI/CD、容器、监控等' },
  { value: 'ai', label: '人工智能', desc: '机器学习、NLP、CV等' },
  { value: 'security', label: '安全', desc: '渗透测试、审计、加密等' },
  { value: 'database', label: '数据库', desc: 'SQL、NoSQL、数据架构等' },
]

export default function TechLedgerPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    techType: 'frontend',
    title: '',
    content: '',
    description: '',
    repoUrl: '',
    techStack: '',
    impactScope: '',
    privacy: 'private',
  })

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setRecords((Array.isArray(data) ? data : []).filter((r: any) => r.ledgerType === 'technique'))
      }
    } catch { } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return
    try {
      const res = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledgerType: 'technique',
          content: formData.content,
          value: 15,
          specialData: {
            techType: formData.techType,
            title: formData.title,
            description: formData.description,
            repoUrl: formData.repoUrl,
            techStack: formData.techStack,
            impactScope: formData.impactScope,
          },
          privacy: formData.privacy,
          tags: [formData.techType, formData.title].filter(Boolean),
        }),
      })
      if (res.ok) {
        setFormData({ techType: 'frontend', title: '', content: '', description: '', repoUrl: '', techStack: '', impactScope: '', privacy: 'private' })
        setActiveTab('list')
        fetchRecords()
      }
    } catch { }
  }

  const getTechTypeLabel = (val: string) => TECH_TYPES.find(t => t.value === val)?.label || val

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/ledger"><Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><ArrowLeft className="h-4 w-4 mr-2" />返回账本</Button></Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl"><Code className="h-8 w-8" /></div>
            <div>
              <h1 className="text-2xl font-bold">德码共同体</h1>
              <p className="text-gray-300 text-sm">技术贡献价值分配，代码就是贡献</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">技术记录</TabsTrigger>
            <TabsTrigger value="create">记录技术贡献</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Code className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无技术记录</h3>
                  <p className="text-gray-500 mb-4">开始记录您的技术贡献，让代码创造价值</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-gray-700 hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />记录第一条
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {records.map((r) => (
                  <Card key={r.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg"><Code className="h-6 w-6 text-gray-700" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{r.specialData?.title || r.content}</h3>
                            <Badge variant="secondary">{getTechTypeLabel(r.specialData?.techType || 'frontend')}</Badge>
                            <Badge variant={r.status === 'applied' ? 'default' : 'secondary'}
                              className={r.status === 'applied' ? 'bg-green-500' : ''}>
                              {r.status === 'pending' ? '待审核' : r.status === 'verified' ? '已验证' : '已应用'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{r.content}</p>
                          {r.specialData?.description && <p className="text-sm text-gray-700">描述: {r.specialData.description}</p>}
                          {r.specialData?.repoUrl && <p className="text-sm text-gray-500">仓库地址: {r.specialData.repoUrl}</p>}
                          {r.specialData?.techStack && <p className="text-sm text-gray-500">技术栈: {r.specialData.techStack}</p>}
                          {r.specialData?.impactScope && <p className="text-sm text-gray-500">影响范围: {r.specialData.impactScope}</p>}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {r.value > 0 && <span>价值: {r.value}</span>}
                            <span>{new Date(r.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>记录技术贡献</CardTitle>
                <CardDescription>记录您的技术开发和贡献，构建德码共同体价值体系</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>项目标题 *</Label>
                      <Input placeholder="给您的技术贡献起个名字" value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>技术类型</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.techType}
                        onChange={(e) => setFormData(p => ({ ...p, techType: e.target.value }))}>
                        {TECH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>贡献内容 *</Label>
                    <Textarea placeholder="详细描述您的技术贡献内容..." value={formData.content}
                      onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={3} required />
                  </div>
                  <div>
                    <Label>项目描述</Label>
                    <Textarea placeholder="对项目的补充说明和技术细节..." value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>仓库地址</Label>
                      <Input placeholder="https://github.com/..." value={formData.repoUrl}
                        onChange={(e) => setFormData(p => ({ ...p, repoUrl: e.target.value }))} />
                    </div>
                    <div>
                      <Label>技术栈</Label>
                      <Input placeholder="如：React, Node.js, PostgreSQL" value={formData.techStack}
                        onChange={(e) => setFormData(p => ({ ...p, techStack: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>影响范围</Label>
                    <Input placeholder="如：全平台、内部系统、开源社区等" value={formData.impactScope}
                      onChange={(e) => setFormData(p => ({ ...p, impactScope: e.target.value }))} />
                  </div>
                  <div>
                    <Label>隐私设置</Label>
                    <select className="w-full border rounded-md p-2 text-sm"
                      value={formData.privacy}
                      onChange={(e) => setFormData(p => ({ ...p, privacy: e.target.value }))}>
                      <option value="private">仅自己可见</option>
                      <option value="public">公开可见</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="bg-gray-700 hover:bg-gray-800 text-white flex-1">提交记录</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveTab('list')}>取消</Button>
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
