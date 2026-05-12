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
import { ArrowLeft, Plus, Palette, Lightbulb, CheckCircle } from 'lucide-react'

/**
 * 德艺共同体 — 艺术账本
 * 艺术创作价值分配，记录每一份艺术贡献
 */

const ART_TYPES = [
  { value: 'painting', label: '绘画', desc: '油画、水彩、国画、素描等' },
  { value: 'music', label: '音乐', desc: '作曲、演奏、编曲、制作等' },
  { value: 'writing', label: '文学', desc: '小说、诗歌、散文、剧本等' },
  { value: 'photography', label: '摄影', desc: '纪实、艺术、商业摄影等' },
  { value: 'craft', label: '手工艺', desc: '编织、陶艺、木工、刺绣等' },
  { value: 'digital', label: '数字艺术', desc: '设计、动画、3D建模、AI创作等' },
]

export default function ArtLedgerPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    artType: 'painting',
    title: '',
    content: '',
    description: '',
    materials: '',
    exhibitionHistory: '',
    privacy: 'private',
  })

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setRecords((Array.isArray(data) ? data : []).filter((r: any) => r.ledgerType === 'art'))
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
          ledgerType: 'art',
          content: formData.content,
          value: 10,
          specialData: {
            artType: formData.artType,
            title: formData.title,
            description: formData.description,
            materials: formData.materials,
            exhibitionHistory: formData.exhibitionHistory,
          },
          privacy: formData.privacy,
          tags: [formData.artType, formData.title].filter(Boolean),
        }),
      })
      if (res.ok) {
        setFormData({ artType: 'painting', title: '', content: '', description: '', materials: '', exhibitionHistory: '', privacy: 'private' })
        setActiveTab('list')
        fetchRecords()
      }
    } catch { }
  }

  const getArtTypeLabel = (val: string) => ART_TYPES.find(t => t.value === val)?.label || val

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/ledger"><Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><ArrowLeft className="h-4 w-4 mr-2" />返回账本</Button></Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl"><Palette className="h-8 w-8" /></div>
            <div>
              <h1 className="text-2xl font-bold">德艺共同体</h1>
              <p className="text-purple-100 text-sm">艺术创作价值分配，记录每一份艺术贡献</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">艺术记录</TabsTrigger>
            <TabsTrigger value="create">记录艺术贡献</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Palette className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无艺术记录</h3>
                  <p className="text-gray-500 mb-4">开始记录您的艺术贡献，让创作创造价值</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-purple-500 hover:bg-purple-600">
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
                        <div className="p-3 bg-purple-100 rounded-lg"><Palette className="h-6 w-6 text-purple-600" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{r.specialData?.title || r.content}</h3>
                            <Badge variant="secondary">{getArtTypeLabel(r.specialData?.artType || 'painting')}</Badge>
                            <Badge variant={r.status === 'applied' ? 'default' : 'secondary'}
                              className={r.status === 'applied' ? 'bg-green-500' : ''}>
                              {r.status === 'pending' ? '待审核' : r.status === 'verified' ? '已验证' : '已应用'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{r.content}</p>
                          {r.specialData?.description && <p className="text-sm text-purple-700">描述: {r.specialData.description}</p>}
                          {r.specialData?.materials && <p className="text-sm text-gray-500">材料: {r.specialData.materials}</p>}
                          {r.specialData?.exhibitionHistory && <p className="text-sm text-gray-500">展览历史: {r.specialData.exhibitionHistory}</p>}
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
                <CardTitle>记录艺术贡献</CardTitle>
                <CardDescription>记录您的艺术创作和贡献，构建德艺共同体价值体系</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>作品标题 *</Label>
                      <Input placeholder="给您的艺术作品起个名字" value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>艺术类型</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.artType}
                        onChange={(e) => setFormData(p => ({ ...p, artType: e.target.value }))}>
                        {ART_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>创作内容 *</Label>
                    <Textarea placeholder="详细描述您的艺术创作内容..." value={formData.content}
                      onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={3} required />
                  </div>
                  <div>
                    <Label>作品描述</Label>
                    <Textarea placeholder="对作品的补充说明和创作理念..." value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>创作材料</Label>
                      <Input placeholder="如：油画颜料、画布、数位板等" value={formData.materials}
                        onChange={(e) => setFormData(p => ({ ...p, materials: e.target.value }))} />
                    </div>
                    <div>
                      <Label>展览历史</Label>
                      <Input placeholder="参展记录、获奖情况等" value={formData.exhibitionHistory}
                        onChange={(e) => setFormData(p => ({ ...p, exhibitionHistory: e.target.value }))} />
                    </div>
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
                    <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white flex-1">提交记录</Button>
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
