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
import { ArrowLeft, Plus, Brain, Lightbulb, CheckCircle, AlertCircle, Clock, BookOpen } from 'lucide-react'

/**
 * 德智共同体 — 智力账本
 * 记录智力成果创造价值，智力账本分配方案
 * 城市人向农村人倾斜的庇佑机制
 */

const INTELLIGENCE_TYPES = [
  { value: 'research', label: '学术研究', desc: '论文、研究报告、学术发现' },
  { value: 'invention', label: '发明创造', desc: '专利、技术创新、产品发明' },
  { value: 'design', label: '设计方案', desc: '架构设计、方案规划、策略制定' },
  { value: 'education', label: '教育传授', desc: '教学、培训、知识分享' },
  { value: 'consulting', label: '咨询顾问', desc: '专业建议、决策支持' },
  { value: 'creative', label: '创意创作', desc: '文学、音乐、艺术创作' },
]

export default function IntellectualLedgerPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    content: '',
    intelligenceType: 'research',
    title: '',
    description: '',
    outcome: '',
    hoursSpent: '',
    difficulty: 'medium',
    collaboration: false,
    privacy: 'private',
  })

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setRecords((Array.isArray(data) ? data : []).filter((r: any) => r.ledgerType === 'intelligence'))
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
          ledgerType: 'intelligence',
          content: formData.content,
          value: parseFloat(formData.hoursSpent) * 10 || 0,
          specialData: {
            intelligenceType: formData.intelligenceType,
            title: formData.title,
            description: formData.description,
            outcome: formData.outcome,
            hoursSpent: formData.hoursSpent,
            difficulty: formData.difficulty,
            collaboration: formData.collaboration,
          },
          privacy: formData.privacy,
          tags: [formData.intelligenceType, formData.title].filter(Boolean),
        }),
      })
      if (res.ok) {
        setFormData({ content: '', intelligenceType: 'research', title: '', description: '', outcome: '', hoursSpent: '', difficulty: 'medium', collaboration: false, privacy: 'private' })
        setActiveTab('list')
        fetchRecords()
      }
    } catch { }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/ledger"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />返回账本</Button></Link>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-cyan-500" />
              <div>
                <h1 className="text-2xl font-bold">德智共同体</h1>
                <p className="text-gray-600 text-sm">智力成果创造价值，知识就是力量</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">智力记录</TabsTrigger>
            <TabsTrigger value="create">记录智力贡献</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无智力记录</h3>
                  <p className="text-gray-500 mb-4">开始记录您的智力贡献，让知识创造价值</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-cyan-500 hover:bg-cyan-600">
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
                        <div className="p-3 bg-cyan-100 rounded-lg"><Brain className="h-6 w-6 text-cyan-600" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{r.specialData?.title || r.content}</h3>
                            <Badge variant="secondary">{r.specialData?.intelligenceType || '智力'}</Badge>
                            <Badge variant={r.status === 'applied' ? 'default' : 'secondary'}
                              className={r.status === 'applied' ? 'bg-green-500' : ''}>
                              {r.status === 'pending' ? '待审核' : r.status === 'verified' ? '已验证' : '已应用'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{r.content}</p>
                          {r.specialData?.outcome && <p className="text-sm text-cyan-700">成果: {r.specialData.outcome}</p>}
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
                <CardTitle>记录智力贡献</CardTitle>
                <CardDescription>记录您的知识、创意和智力劳动，构建德智共同体价值体系</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>贡献标题 *</Label>
                      <Input placeholder="给您的智力贡献起个名字" value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>贡献类型</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.intelligenceType}
                        onChange={(e) => setFormData(p => ({ ...p, intelligenceType: e.target.value }))}>
                        {INTELLIGENCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>贡献描述 *</Label>
                    <Textarea placeholder="详细描述您的智力贡献内容..." value={formData.content}
                      onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={3} required />
                  </div>
                  <div>
                    <Label>成果产出</Label>
                    <Textarea placeholder="这个智力贡献产生了什么成果？" value={formData.outcome}
                      onChange={(e) => setFormData(p => ({ ...p, outcome: e.target.value }))} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>投入时长（小时）</Label>
                      <Input type="number" placeholder="10" value={formData.hoursSpent}
                        onChange={(e) => setFormData(p => ({ ...p, hoursSpent: e.target.value }))} />
                    </div>
                    <div>
                      <Label>难度</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.difficulty}
                        onChange={(e) => setFormData(p => ({ ...p, difficulty: e.target.value }))}>
                        <option value="easy">简单</option>
                        <option value="medium">中等</option>
                        <option value="hard">困难</option>
                        <option value="expert">专家级</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white flex-1">提交记录</Button>
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
