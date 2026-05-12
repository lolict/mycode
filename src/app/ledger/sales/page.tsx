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
import { ArrowLeft, Plus, ShoppingCart, Lightbulb } from 'lucide-react'

/**
 * 德售共同体 — 公益销售账本
 * 公益销售分配方案，支持农产品销售
 */

const SALES_TYPES = [
  { value: 'agricultural', label: '农产品', desc: '蔬菜、水果、粮食、特产等' },
  { value: 'handicraft', label: '手工艺品', desc: '编织、陶艺、刺绣、木工等' },
  { value: 'digital', label: '数字产品', desc: '电子书、课程、软件等' },
  { value: 'service', label: '服务', desc: '咨询、培训、设计等' },
  { value: 'education', label: '教育产品', desc: '课程、教材、培训项目等' },
]

export default function SalesLedgerPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    salesType: 'agricultural',
    title: '',
    content: '',
    description: '',
    productCategory: '',
    salesChannel: '',
    revenue: '',
    quantity: '',
    privacy: 'private',
  })

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/ledger')
      if (res.ok) {
        const data = await res.json()
        setRecords((Array.isArray(data) ? data : []).filter((r: any) => r.ledgerType === 'donation'))
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
          ledgerType: 'donation',
          content: formData.content,
          value: parseFloat(formData.revenue) || 10,
          specialData: {
            salesType: formData.salesType,
            title: formData.title,
            description: formData.description,
            productCategory: formData.productCategory,
            salesChannel: formData.salesChannel,
            revenue: formData.revenue,
            quantity: formData.quantity,
          },
          privacy: formData.privacy,
          tags: [formData.salesType, formData.title].filter(Boolean),
        }),
      })
      if (res.ok) {
        setFormData({ salesType: 'agricultural', title: '', content: '', description: '', productCategory: '', salesChannel: '', revenue: '', quantity: '', privacy: 'private' })
        setActiveTab('list')
        fetchRecords()
      }
    } catch { }
  }

  const getSalesTypeLabel = (val: string) => SALES_TYPES.find(t => t.value === val)?.label || val

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/ledger"><Button variant="ghost" size="sm" className="text-white hover:bg-white/20"><ArrowLeft className="h-4 w-4 mr-2" />返回账本</Button></Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl"><ShoppingCart className="h-8 w-8" /></div>
            <div>
              <h1 className="text-2xl font-bold">德售共同体</h1>
              <p className="text-orange-100 text-sm">公益销售分配方案，支持农产品销售</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">销售记录</TabsTrigger>
            <TabsTrigger value="create">记录销售贡献</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : records.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无销售记录</h3>
                  <p className="text-gray-500 mb-4">开始记录您的公益销售贡献，让每一笔销售都有价值</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-orange-500 hover:bg-orange-600">
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
                        <div className="p-3 bg-orange-100 rounded-lg"><ShoppingCart className="h-6 w-6 text-orange-600" /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{r.specialData?.title || r.content}</h3>
                            <Badge variant="secondary">{getSalesTypeLabel(r.specialData?.salesType || 'agricultural')}</Badge>
                            <Badge variant={r.status === 'applied' ? 'default' : 'secondary'}
                              className={r.status === 'applied' ? 'bg-green-500' : ''}>
                              {r.status === 'pending' ? '待审核' : r.status === 'verified' ? '已验证' : '已应用'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{r.content}</p>
                          {r.specialData?.productCategory && <p className="text-sm text-orange-700">产品类别: {r.specialData.productCategory}</p>}
                          {r.specialData?.salesChannel && <p className="text-sm text-gray-500">销售渠道: {r.specialData.salesChannel}</p>}
                          {r.specialData?.revenue && <p className="text-sm text-gray-500">销售收入: ¥{r.specialData.revenue}</p>}
                          {r.specialData?.quantity && <p className="text-sm text-gray-500">销售数量: {r.specialData.quantity}</p>}
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
                <CardTitle>记录销售贡献</CardTitle>
                <CardDescription>记录您的公益销售贡献，构建德售共同体价值体系</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>销售标题 *</Label>
                      <Input placeholder="给您的销售项目起个名字" value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div>
                      <Label>销售类型</Label>
                      <select className="w-full border rounded-md p-2 text-sm"
                        value={formData.salesType}
                        onChange={(e) => setFormData(p => ({ ...p, salesType: e.target.value }))}>
                        {SALES_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>销售内容 *</Label>
                    <Textarea placeholder="详细描述您的销售贡献内容..." value={formData.content}
                      onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={3} required />
                  </div>
                  <div>
                    <Label>销售描述</Label>
                    <Textarea placeholder="对销售项目的补充说明..." value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>产品类别</Label>
                      <Input placeholder="如：有机蔬菜、手工艺品等" value={formData.productCategory}
                        onChange={(e) => setFormData(p => ({ ...p, productCategory: e.target.value }))} />
                    </div>
                    <div>
                      <Label>销售渠道</Label>
                      <Input placeholder="如：线上商城、线下集市、团购等" value={formData.salesChannel}
                        onChange={(e) => setFormData(p => ({ ...p, salesChannel: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>销售收入（元）</Label>
                      <Input type="number" placeholder="如：500" value={formData.revenue}
                        onChange={(e) => setFormData(p => ({ ...p, revenue: e.target.value }))} />
                    </div>
                    <div>
                      <Label>销售数量</Label>
                      <Input placeholder="如：100斤、50件等" value={formData.quantity}
                        onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))} />
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
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white flex-1">提交记录</Button>
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
