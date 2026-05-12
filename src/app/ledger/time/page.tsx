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
import { ArrowLeft, Plus, Clock, Lightbulb } from 'lucide-react'

/**
 * 时间账本 — 德时共同体
 * 德时共同体账户余额，时间价值分配系统
 */

const TIME_TYPES = [
  { value: 'volunteer', label: '志愿服务', desc: '社区服务、公益活动等' },
  { value: 'teaching', label: '教学授课', desc: '知识传授、技能培训等' },
  { value: 'mentoring', label: '指导辅导', desc: '一对一指导、经验分享等' },
  { value: 'caregiving', label: '护理照料', desc: '照看、陪伴、护理等' },
  { value: 'community', label: '社区建设', desc: '组织活动、社区运营等' },
  { value: 'self-improvement', label: '自我提升', desc: '学习进修、技能提升等' },
]

export default function TimeLedgerPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    timeType: 'volunteer',
    title: '',
    content: '',
    description: '',
    hoursSpent: '',
    dateRange: '',
    beneficiaries: '',
    skills: '',
    privacy: 'private',
  })

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setRecords((Array.isArray(data) ? data : []).filter((r: any) => r.ledgerType === 'time'))
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
          ledgerType: 'time',
          content: formData.content,
          value: parseFloat(formData.hoursSpent) * 10 || 0,
          specialData: {
            timeType: formData.timeType,
            title: formData.title,
            description: formData.description,
            hoursSpent: formData.hoursSpent,
            dateRange: formData.dateRange,
            beneficiaries: formData.beneficiaries,
            skills: formData.skills,
          },
          privacy: formData.privacy,
          tags: [formData.timeType, formData.title].filter(Boolean),
        }),
      })
      if (res.ok) {
        setFormData({ timeType: 'volunteer', title: '', content: '', description: '', hoursSpent: '', dateRange: '', beneficiaries: '', skills: '', privacy: 'private' })
        setActiveTab('list')
        fetchRecords()
      }
    } catch { }
  }

  const getTimeTypeLabel = (val: string) => TIME_TYPES.find(t => t.value === val)?.label || val

  // 计算总时长
  const totalHours = records.reduce((sum, r) => sum + (parseFloat(r.specialData?.hoursSpent) || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/ledger"><Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><ArrowLeft className="h-4 w-4 mr-2" />返回账本</Button></Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl"><Clock className="h-8 w-8" /></div>
            <div>
              <h1 className="text-2xl font-bold">时间账本</h1>
              <p className="text-rose-100 text-sm">德时共同体账户余额，时间价值分配系统</p>
            </div>
          </div>
          {records.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-rose-100 text-sm mb-1">总记录数</div>
                <div className="text-2xl font-bold">{records.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-rose-100 text-sm mb-1">累计时长</div>
                <div className="text-2xl font-bold">{totalHours} 小时</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-rose-100 text-sm mb-1">时间价值</div>
                <div className="text-2xl font-bold">{records.reduce((sum, r) => sum + (r.value || 0), 0).toFixed(0)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">时间记录</TabsTrigger>
            <TabsTrigger value="create">记录时间贡献</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无时间记录</h3>
                  <p className="text-gray-500 mb-4">开始记录您的时间贡献，让时间创造价值</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-rose-500 hover:bg-rose-600">
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
                        <div className="p-3 bg-rose-100 rounded-lg"><Clock className="h-6 w-6 text-rose-600" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{r.specialData?.title || r.content}</h3>
                            <Badge variant="secondary">{getTimeTypeLabel(r.specialData?.timeType || 'volunteer')}</Badge>
                            <Badge variant={r.status === 'applied' ? 'default' : 'secondary'}
                              className={r.status === 'applied' ? 'bg-green-500' : ''}>
                              {r.status === 'pending' ? '待审核' : r.status === 'verified' ? '已验证' : '已应用'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{r.content}</p>
                          {r.specialData?.hoursSpent && <p className="text-sm text-rose-700">投入时长: {r.specialData.hoursSpent} 小时</p>}
                          {r.specialData?.dateRange && <p className="text-sm text-gray-500">时间范围: {r.specialData.dateRange}</p>}
                          {r.specialData?.beneficiaries && <p className="text-sm text-gray-500">受益人: {r.specialData.beneficiaries}</p>}
                          {r.specialData?.skills && <p className="text-sm text-gray-500">相关技能: {r.specialData.skills}</p>}
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
                <CardTitle>记录时间贡献</CardTitle>
                <CardDescription>记录您的时间投入和志愿服务，构建德时共同体价值体系</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>贡献标题 *</Label>
                      <Input placeholder="给您的时间贡献起个名字" value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>时间类型</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.timeType}
                        onChange={(e) => setFormData(p => ({ ...p, timeType: e.target.value }))}>
                        {TIME_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>贡献内容 *</Label>
                    <Textarea placeholder="详细描述您的时间贡献内容..." value={formData.content}
                      onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={3} required />
                  </div>
                  <div>
                    <Label>贡献描述</Label>
                    <Textarea placeholder="对贡献的补充说明和成果描述..." value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>投入时长（小时） *</Label>
                      <Input type="number" placeholder="如：8" value={formData.hoursSpent}
                        onChange={(e) => setFormData(p => ({ ...p, hoursSpent: e.target.value }))} />
                    </div>
                    <div>
                      <Label>时间范围</Label>
                      <Input placeholder="如：2024年1月-3月" value={formData.dateRange}
                        onChange={(e) => setFormData(p => ({ ...p, dateRange: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>受益人</Label>
                      <Input placeholder="如：残障人士、社区老人等" value={formData.beneficiaries}
                        onChange={(e) => setFormData(p => ({ ...p, beneficiaries: e.target.value }))} />
                    </div>
                    <div>
                      <Label>相关技能</Label>
                      <Input placeholder="如：医疗护理、心理辅导、教学等" value={formData.skills}
                        onChange={(e) => setFormData(p => ({ ...p, skills: e.target.value }))} />
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
                    <Button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white flex-1">提交记录</Button>
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
