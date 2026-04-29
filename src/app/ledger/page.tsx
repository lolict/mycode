'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Cpu, 
  Wrench, 
  Lightbulb, 
  Zap, 
  Heart, 
  HandHelping, 
  Users, 
  Clock, 
  Shield, 
  ShakeHand,
  PlusCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface NamedLedger {
  id: string
  ledgerType: string
  content: string
  value: number
  status: string
  createdAt: string
}

const LEDGER_TYPES = [
  { value: 'technology', label: '记名科技', icon: Cpu, description: '科技账本 - 记录科技创新贡献' },
  { value: 'technique', label: '记名技术', icon: Wrench, description: '技术账本 - 记录技术协作贡献' },
  { value: 'public_tool', label: '记名公器', icon: Shield, description: '公器账本 - 记录公共服务贡献' },
  { value: 'intelligence', label: '记名智力', icon: Lightbulb, description: '智力账本 - 记录智力贡献' },
  { value: 'energy', label: '记名能源', icon: Zap, description: '能源账本 - 记录能源贡献' },
  { value: 'charity', label: '记名公益', icon: Heart, description: '公益账本 - 记录公益贡献' },
  { value: 'donation', label: '记名捐赠', icon: HandHelping, description: '捐赠账本 - 记录捐赠贡献' },
  { value: 'volunteer', label: '记名雷锋', icon: Users, description: '雷锋账本 - 记录志愿服务' },
  { value: 'time', label: '记名时间', icon: Clock, description: '时间账本 - 记录时间贡献' },
  { value: 'deposit', label: '记名押金', icon: Shield, description: '押金账本 - 记录押金贡献' },
  { value: 'cooperation', label: '记名合作', icon: ShakeHand, description: '合作账本 - 记录合作贡献' }
]

export default function LedgerPage() {
  const [ledgers, setLedgers] = useState<NamedLedger[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    ledgerType: '',
    content: '',
    value: ''
  })

  useEffect(() => {
    fetchLedgers()
  }, [])

  const fetchLedgers = async () => {
    try {
      const response = await fetch('/api/ledger')
      if (response.ok) {
        const data = await response.json()
        setLedgers(data)
      }
    } catch (error) {
      console.error('Failed to fetch ledgers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.ledgerType || !formData.content) {
      alert('请填写所有必填字段')
      return
    }

    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value) || 0
        }),
      })

      if (response.ok) {
        alert('记名账本记录创建成功！')
        setFormData({ ledgerType: '', content: '', value: '' })
        setShowForm(false)
        fetchLedgers()
      } else {
        const error = await response.json()
        alert(error.error || '创建失败，请重试')
      }
    } catch (error) {
      console.error('Failed to create ledger:', error)
      alert('创建失败，请重试')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />待审核</Badge>
      case 'verified':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />已验证</Badge>
      case 'applied':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已应用</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getLedgerTypeInfo = (type: string) => {
    return LEDGER_TYPES.find(t => t.value === type) || LEDGER_TYPES[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">记名账本系统</h1>
              <p className="text-pink-100">记录个人贡献，实现各尽其能、物尽其用、人尽其力</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PlusCircle className="h-5 w-5 text-green-300" />
                <span className="text-green-100">总贡献记录</span>
              </div>
              <div className="text-2xl font-bold">{ledgers.length}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-300" />
                <span className="text-blue-100">已验证记录</span>
              </div>
              <div className="text-2xl font-bold">
                {ledgers.filter(l => l.status === 'verified').length}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-300" />
                <span className="text-yellow-100">待审核记录</span>
              </div>
              <div className="text-2xl font-bold">
                {ledgers.filter(l => l.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">我的贡献记录</h2>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            添加贡献记录
          </Button>
        </div>

        {/* 添加贡献表单 */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>添加新的贡献记录</CardTitle>
              <CardDescription>
                记录您的贡献，体现个人价值，获得相应认可
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ledgerType">贡献类型 *</Label>
                  <Select value={formData.ledgerType} onValueChange={(value) => setFormData(prev => ({ ...prev, ledgerType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择贡献类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEDGER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">贡献描述 *</Label>
                  <Textarea
                    id="content"
                    placeholder="请详细描述您的贡献内容、过程和成果..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="value">贡献价值评估</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="请输入贡献价值（可选）"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
                    提交记录
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 贡献记录列表 */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">全部记录</TabsTrigger>
            <TabsTrigger value="pending">待审核</TabsTrigger>
            <TabsTrigger value="verified">已验证</TabsTrigger>
            <TabsTrigger value="applied">已应用</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {ledgers.map((ledger) => {
                const typeInfo = getLedgerTypeInfo(ledger.ledgerType)
                const Icon = typeInfo.icon
                
                return (
                  <Card key={ledger.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-pink-100 rounded-lg">
                            <Icon className="h-6 w-6 text-pink-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{typeInfo.label}</h3>
                            {getStatusBadge(ledger.status)}
                            {ledger.value > 0 && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                价值: {ledger.value}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{ledger.content}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{typeInfo.description}</span>
                            <span>{new Date(ledger.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4">
              {ledgers.filter(l => l.status === 'pending').map((ledger) => {
                const typeInfo = getLedgerTypeInfo(ledger.ledgerType)
                const Icon = typeInfo.icon
                
                return (
                  <Card key={ledger.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <Icon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{typeInfo.label}</h3>
                          <p className="text-gray-600">{ledger.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="verified" className="mt-6">
            <div className="grid gap-4">
              {ledgers.filter(l => l.status === 'verified').map((ledger) => {
                const typeInfo = getLedgerTypeInfo(ledger.ledgerType)
                const Icon = typeInfo.icon
                
                return (
                  <Card key={ledger.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{typeInfo.label}</h3>
                          <p className="text-gray-600">{ledger.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="applied" className="mt-6">
            <div className="grid gap-4">
              {ledgers.filter(l => l.status === 'applied').map((ledger) => {
                const typeInfo = getLedgerTypeInfo(ledger.ledgerType)
                const Icon = typeInfo.icon
                
                return (
                  <Card key={ledger.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{typeInfo.label}</h3>
                          <p className="text-gray-600">{ledger.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}