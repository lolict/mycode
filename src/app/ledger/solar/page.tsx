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
import { ArrowLeft, Plus, Sun, Lightbulb } from 'lucide-react'

/**
 * 德伏共同体 — 光伏能源账本
 * 光伏能源贡献分配，绿色能源创造价值
 */

const ENERGY_TYPES = [
  { value: 'solar', label: '光伏发电', desc: '太阳能板、分布式光伏等' },
  { value: 'wind', label: '风力发电', desc: '风力发电机、风电场等' },
  { value: 'hydro', label: '水力发电', desc: '小水电、微型水力等' },
  { value: 'biomass', label: '生物质能', desc: '沼气、生物质发电等' },
  { value: 'conservation', label: '节能改造', desc: '节能设备、能效提升等' },
]

export default function SolarLedgerPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    energyType: 'solar',
    title: '',
    content: '',
    description: '',
    capacity: '',
    location: '',
    efficiency: '',
    monthlyOutput: '',
    privacy: 'private',
  })

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setRecords((Array.isArray(data) ? data : []).filter((r: any) => r.ledgerType === 'energy'))
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
          ledgerType: 'energy',
          content: formData.content,
          value: parseFloat(formData.monthlyOutput) * 5 || 10,
          specialData: {
            energyType: formData.energyType,
            title: formData.title,
            description: formData.description,
            capacity: formData.capacity,
            location: formData.location,
            efficiency: formData.efficiency,
            monthlyOutput: formData.monthlyOutput,
          },
          privacy: formData.privacy,
          tags: [formData.energyType, formData.title].filter(Boolean),
        }),
      })
      if (res.ok) {
        setFormData({ energyType: 'solar', title: '', content: '', description: '', capacity: '', location: '', efficiency: '', monthlyOutput: '', privacy: 'private' })
        setActiveTab('list')
        fetchRecords()
      }
    } catch { }
  }

  const getEnergyTypeLabel = (val: string) => ENERGY_TYPES.find(t => t.value === val)?.label || val

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/ledger"><Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><ArrowLeft className="h-4 w-4 mr-2" />返回账本</Button></Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl"><Sun className="h-8 w-8" /></div>
            <div>
              <h1 className="text-2xl font-bold">德伏共同体</h1>
              <p className="text-yellow-100 text-sm">光伏能源贡献分配，绿色能源创造价值</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">能源记录</TabsTrigger>
            <TabsTrigger value="create">记录能源贡献</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sun className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无能源记录</h3>
                  <p className="text-gray-500 mb-4">开始记录您的能源贡献，让绿色能源创造价值</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-yellow-500 hover:bg-yellow-600">
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
                        <div className="p-3 bg-yellow-100 rounded-lg"><Sun className="h-6 w-6 text-yellow-600" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{r.specialData?.title || r.content}</h3>
                            <Badge variant="secondary">{getEnergyTypeLabel(r.specialData?.energyType || 'solar')}</Badge>
                            <Badge variant={r.status === 'applied' ? 'default' : 'secondary'}
                              className={r.status === 'applied' ? 'bg-green-500' : ''}>
                              {r.status === 'pending' ? '待审核' : r.status === 'verified' ? '已验证' : '已应用'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{r.content}</p>
                          {r.specialData?.capacity && <p className="text-sm text-yellow-700">装机容量: {r.specialData.capacity}</p>}
                          {r.specialData?.location && <p className="text-sm text-gray-500">所在地: {r.specialData.location}</p>}
                          {r.specialData?.efficiency && <p className="text-sm text-gray-500">效率: {r.specialData.efficiency}</p>}
                          {r.specialData?.monthlyOutput && <p className="text-sm text-gray-500">月发电量: {r.specialData.monthlyOutput}</p>}
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
                <CardTitle>记录能源贡献</CardTitle>
                <CardDescription>记录您的光伏和绿色能源贡献，构建德伏共同体价值体系</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>项目标题 *</Label>
                      <Input placeholder="给您的能源项目起个名字" value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>能源类型</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.energyType}
                        onChange={(e) => setFormData(p => ({ ...p, energyType: e.target.value }))}>
                        {ENERGY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>贡献内容 *</Label>
                    <Textarea placeholder="详细描述您的能源贡献内容..." value={formData.content}
                      onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={3} required />
                  </div>
                  <div>
                    <Label>项目描述</Label>
                    <Textarea placeholder="对项目的补充说明和技术细节..." value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>装机容量</Label>
                      <Input placeholder="如：5kW、10kW等" value={formData.capacity}
                        onChange={(e) => setFormData(p => ({ ...p, capacity: e.target.value }))} />
                    </div>
                    <div>
                      <Label>所在地</Label>
                      <Input placeholder="如：北京市朝阳区" value={formData.location}
                        onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>转换效率</Label>
                      <Input placeholder="如：22%" value={formData.efficiency}
                        onChange={(e) => setFormData(p => ({ ...p, efficiency: e.target.value }))} />
                    </div>
                    <div>
                      <Label>月发电量（kWh）</Label>
                      <Input type="number" placeholder="如：500" value={formData.monthlyOutput}
                        onChange={(e) => setFormData(p => ({ ...p, monthlyOutput: e.target.value }))} />
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
                    <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1">提交记录</Button>
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
