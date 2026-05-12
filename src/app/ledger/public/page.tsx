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
import { ArrowLeft, Plus, Smartphone, Lightbulb } from 'lucide-react'

/**
 * 公器共同体 — 公共基础设施账本
 * 私人设备分布式记账系统的节点数据存储算力支持网络
 */

const NODE_TYPES = [
  { value: 'compute', label: '计算节点', desc: '提供CPU/GPU算力支持' },
  { value: 'storage', label: '存储节点', desc: '提供数据存储空间' },
  { value: 'relay', label: '中继节点', desc: '提供网络中继和转发' },
  { value: 'api', label: 'API节点', desc: '提供接口服务' },
  { value: 'full', label: '全功能节点', desc: '提供完整的节点服务' },
]

export default function PublicLedgerPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    nodeType: 'compute',
    title: '',
    content: '',
    description: '',
    specs: '',
    bandwidth: '',
    uptime: '',
    region: '',
    privacy: 'private',
  })

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setRecords((Array.isArray(data) ? data : []).filter((r: any) => r.ledgerType === 'public_tool'))
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
          ledgerType: 'public_tool',
          content: formData.content,
          value: parseFloat(formData.uptime) * 2 || 10,
          specialData: {
            nodeType: formData.nodeType,
            title: formData.title,
            description: formData.description,
            specs: formData.specs,
            bandwidth: formData.bandwidth,
            uptime: formData.uptime,
            region: formData.region,
          },
          privacy: formData.privacy,
          tags: [formData.nodeType, formData.title].filter(Boolean),
        }),
      })
      if (res.ok) {
        setFormData({ nodeType: 'compute', title: '', content: '', description: '', specs: '', bandwidth: '', uptime: '', region: '', privacy: 'private' })
        setActiveTab('list')
        fetchRecords()
      }
    } catch { }
  }

  const getNodeTypeLabel = (val: string) => NODE_TYPES.find(t => t.value === val)?.label || val

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/ledger"><Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><ArrowLeft className="h-4 w-4 mr-2" />返回账本</Button></Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl"><Smartphone className="h-8 w-8" /></div>
            <div>
              <h1 className="text-2xl font-bold">公器共同体</h1>
              <p className="text-violet-200 text-sm">私人设备分布式记账系统的节点数据存储算力支持网络</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">节点记录</TabsTrigger>
            <TabsTrigger value="create">记录节点贡献</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Smartphone className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无节点记录</h3>
                  <p className="text-gray-500 mb-4">开始记录您的节点贡献，共建分布式基础设施</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-violet-600 hover:bg-violet-700">
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
                        <div className="p-3 bg-violet-100 rounded-lg"><Smartphone className="h-6 w-6 text-violet-600" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{r.specialData?.title || r.content}</h3>
                            <Badge variant="secondary">{getNodeTypeLabel(r.specialData?.nodeType || 'compute')}</Badge>
                            <Badge variant={r.status === 'applied' ? 'default' : 'secondary'}
                              className={r.status === 'applied' ? 'bg-green-500' : ''}>
                              {r.status === 'pending' ? '待审核' : r.status === 'verified' ? '已验证' : '已应用'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{r.content}</p>
                          {r.specialData?.specs && <p className="text-sm text-violet-700">设备规格: {r.specialData.specs}</p>}
                          {r.specialData?.bandwidth && <p className="text-sm text-gray-500">带宽: {r.specialData.bandwidth}</p>}
                          {r.specialData?.uptime && <p className="text-sm text-gray-500">在线率: {r.specialData.uptime}%</p>}
                          {r.specialData?.region && <p className="text-sm text-gray-500">所在地区: {r.specialData.region}</p>}
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
                <CardTitle>记录节点贡献</CardTitle>
                <CardDescription>记录您提供的节点设备和算力贡献，构建公器共同体价值体系</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>节点名称 *</Label>
                      <Input placeholder="给您的节点起个名字" value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>节点类型</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.nodeType}
                        onChange={(e) => setFormData(p => ({ ...p, nodeType: e.target.value }))}>
                        {NODE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>贡献内容 *</Label>
                    <Textarea placeholder="详细描述您提供的节点服务内容..." value={formData.content}
                      onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={3} required />
                  </div>
                  <div>
                    <Label>节点描述</Label>
                    <Textarea placeholder="对节点服务的补充说明..." value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>设备规格</Label>
                      <Input placeholder="如：8核CPU、16GB内存、1TB SSD" value={formData.specs}
                        onChange={(e) => setFormData(p => ({ ...p, specs: e.target.value }))} />
                    </div>
                    <div>
                      <Label>网络带宽</Label>
                      <Input placeholder="如：100Mbps、1Gbps" value={formData.bandwidth}
                        onChange={(e) => setFormData(p => ({ ...p, bandwidth: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>在线率（%）</Label>
                      <Input type="number" placeholder="如：99.9" value={formData.uptime}
                        onChange={(e) => setFormData(p => ({ ...p, uptime: e.target.value }))} />
                    </div>
                    <div>
                      <Label>所在地区</Label>
                      <Input placeholder="如：上海市浦东新区" value={formData.region}
                        onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))} />
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
                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white flex-1">提交记录</Button>
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
