'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Code, BookOpen, Zap, Network, Lock, Shield, Heart,
  ArrowLeft, CheckCircle2, AlertCircle, Loader2,
  Smartphone, Server, Cpu, HardDrive, Package, Play,
  Copy, ExternalLink
} from 'lucide-react'

// ====== 代码示例内容 ======

const CODE_LISTENER = `// 在嵌套式小程序中设置 PostMessage 监听器
window.addEventListener('message', (event) => {
  const msg = event.data
  if (!msg || !msg.type) return

  switch (msg.type) {
    case 'GENE_LOCK_STATUS':
      console.log('基因锁状态:', msg.payload)
      // { valid: boolean, details?: string }
      if (msg.payload.valid) {
        // 基因锁已验证，解锁高级功能
      }
      break

    case 'USER_INFO':
      console.log('用户信息:', msg.payload)
      // { id: string, name: string, moralScore: number }
      break

    case 'NODE_INFO':
      console.log('节点信息:', msg.payload)
      // { nodes: Array<{ id, name, endpoint, status }> }
      break

    case 'CLOSE_APP':
      console.log('桌面要求关闭')
      // 执行清理操作
      break

    case 'ROUTING_INFO':
      console.log('路由信息:', msg.payload)
      // { currentRoute: string, params: Record<string, string> }
      break
  }
})

// 发送消息给桌面（父程序）
function sendToParent(msg) {
  window.parent.postMessage(msg, '*')
}

// 通知桌面小程序已就绪
sendToParent({
  type: 'APP_READY',
  payload: { appId: 'your-app-id', version: '1.0.0' }
})

// 请求基因锁状态
sendToParent({ type: 'REQUEST_GENE_LOCK' })

// 请求节点信息
sendToParent({ type: 'REQUEST_NODE_INFO' })

// 请求关闭
sendToParent({ type: 'REQUEST_CLOSE' })

// 请求路由
sendToParent({ type: 'REQUEST_ROUTE', payload: { route: '/some/path' } })`

const CODE_GENE_LOCK_FLOW = `// 基因锁验证流程示例

// 1. 小程序启动时，请求基因锁状态
window.parent.postMessage({ type: 'REQUEST_GENE_LOCK' }, '*')

// 2. 监听基因锁状态响应
window.addEventListener('message', (event) => {
  if (event.data?.type === 'GENE_LOCK_STATUS') {
    const { valid, details } = event.data.payload

    if (valid) {
      // 基因锁已激活 → 解锁全部功能
      unlockPremiumFeatures()
    } else {
      // 基因锁未激活 → 显示受限模式
      showLimitedMode(details || '基因锁未激活')
    }
  }
})

// 3. 根据道德评分调整功能
window.addEventListener('message', (event) => {
  if (event.data?.type === 'USER_INFO') {
    const { moralScore } = event.data.payload
    
    if (moralScore >= 80) {
      enableAdvancedFeatures()
    } else if (moralScore >= 60) {
      enableStandardFeatures()
    } else {
      enableBasicFeatures()
    }
  }
})

// 4. 选择最佳节点运行
window.addEventListener('message', (event) => {
  if (event.data?.type === 'NODE_INFO') {
    const { nodes } = event.data.payload
    // 选择延迟最低的活跃节点
    const bestNode = nodes
      .filter(n => n.status === 'active')
      .sort((a, b) => a.latency - b.latency)[0]
    
    if (bestNode) {
      connectToNode(bestNode)
    }
  }
})`

const CODE_COMPATIBLE_APP = `<!-- 一个兼容圆聚助残平台的嵌套式小程序示例 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的嵌套式小程序</title>
</head>
<body>
  <div id="app">
    <h1>我的小程序</h1>
    <p id="status">正在连接桌面...</p>
    <div id="gene-lock-status"></div>
    <div id="user-info"></div>
  </div>

  <script>
    // 初始化：通知桌面已就绪
    function init() {
      window.parent.postMessage({
        type: 'APP_READY',
        payload: { appId: 'my-mini-app', version: '1.0.0' }
      }, '*')

      // 请求初始数据
      window.parent.postMessage({ type: 'REQUEST_GENE_LOCK' }, '*')
      window.parent.postMessage({ type: 'REQUEST_NODE_INFO' }, '*')

      document.getElementById('status').textContent = '已连接桌面'
    }

    // 监听来自桌面的消息
    window.addEventListener('message', (event) => {
      const msg = event.data
      if (!msg?.type) return

      switch (msg.type) {
        case 'GENE_LOCK_STATUS':
          const lockEl = document.getElementById('gene-lock-status')
          lockEl.innerHTML = msg.payload.valid
            ? '✅ 基因锁已激活 - 全功能可用'
            : '⚠️ 基因锁未激活 - 功能受限'
          break

        case 'USER_INFO':
          document.getElementById('user-info').innerHTML = 
            '用户: ' + msg.payload.name + 
            ' | 道德评分: ' + msg.payload.moralScore
          break

        case 'CLOSE_APP':
          // 执行清理后通知桌面可以关闭
          cleanup().then(() => {
            window.parent.postMessage({ type: 'REQUEST_CLOSE' }, '*')
          })
          break
      }
    })

    // 页面加载后初始化
    window.addEventListener('load', init)
  </script>
</body>
</html>`

// ====== 开发者门户主页面 ======

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [nodes, setNodes] = useState<Array<{ id: string; name: string; status: string }>>([])
  const [regForm, setRegForm] = useState({
    name: '',
    description: '',
    icon: '📱',
    entryType: 'iframe',
    entryUrl: '',
    entryRoute: '',
    category: 'tool',
    tags: '',
    requiresGeneLock: true,
    minMoralScore: 0,
    preferredNodeId: '',
    developerId: 'demo-user'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // 加载可用节点列表
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await fetch('/api/nodes?status=active')
        if (res.ok) {
          const data = await res.json()
          setNodes(data.nodes || [])
        }
      } catch { /* ignore */ }
    }
    fetchNodes()
  }, [])

  const EMOJI_OPTIONS = ['📱', '🛠️', '📊', '💬', '🎮', '🎵', '📷', '📝', '🔧', '🎨', '📚', '🌐', '⚡', '🔒', '💡', '🎯']

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleRegisterApp = async () => {
    if (!regForm.name || !regForm.description) {
      setError('请填写小程序名称和描述')
      return
    }
    if (regForm.entryType === 'iframe' && !regForm.entryUrl) {
      setError('iframe类型需要填写入口URL')
      return
    }
    if (regForm.entryType === 'route' && !regForm.entryRoute) {
      setError('route类型需要填写内部路由')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/mini-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          tags: regForm.tags ? regForm.tags.split(',').map(t => t.trim()) : [],
          developerName: '演示开发者'
        })
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(`小程序【${regForm.name}】注册成功！ID: ${data.app?.id}`)
        setRegForm({
          name: '',
          description: '',
          icon: '📱',
          entryType: 'iframe',
          entryUrl: '',
          entryRoute: '',
          category: 'tool',
          tags: '',
          requiresGeneLock: true,
          minMoralScore: 0,
          preferredNodeId: '',
          developerId: 'demo-user'
        })
      } else {
        setError(data.error || '注册失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 顶部导航 */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/desktop" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">开发者门户</h1>
                <p className="text-xs text-slate-400">嵌套式程序 · 开发者生态</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/desktop">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <ArrowLeft className="h-4 w-4 mr-1" />返回桌面
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              <BookOpen className="h-4 w-4 mr-2" />架构概述
            </TabsTrigger>
            <TabsTrigger value="sdk" className="data-[state=active]:bg-slate-700">
              <Code className="h-4 w-4 mr-2" />SDK文档
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-slate-700">
              <Package className="h-4 w-4 mr-2" />注册小程序
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-slate-700">
              <Play className="h-4 w-4 mr-2" />代码示例
            </TabsTrigger>
          </TabsList>

          {/* ====== 架构概述 ====== */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-pink-400 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    什么是嵌套式程序架构？
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-3">
                  <p>
                    嵌套式程序架构是圆聚助残平台的核心设计理念。主程序（桌面）作为唯一入口，
                    所有其他程序都像图标一样嵌入在桌面内运行。
                  </p>
                  <p>
                    不需要Android手机桌面，避免用户的应用被忽略。所有小程序都依托本程序运行，
                    形成一个完整的生态系统。
                  </p>
                  <div className="p-3 bg-slate-700/50 rounded-lg mt-3">
                    <h4 className="font-semibold text-pink-300 mb-2">核心原则</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• 主程序 = 桌面（手机主屏），唯一入口</li>
                      <li>• 其他程序嵌入在主程序内运行</li>
                      <li>• 每个嵌套程序都携带基因锁烙印</li>
                      <li>• 分布式节点提供算力和存储</li>
                      <li>• 开发者生态吸引外部贡献</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    架构流程图
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300">
                  <div className="p-4 bg-slate-700/50 rounded-lg font-mono text-xs">
                    <div className="text-center mb-3 text-pink-400">┌─────────────────────────┐</div>
                    <div className="text-center mb-1 text-pink-400">│   共同体桌面 (主程序)     │</div>
                    <div className="text-center mb-3 text-pink-400">│   唯一入口 + PostMessage  │</div>
                    <div className="text-center mb-2 text-pink-400">└────────────┬────────────┘</div>
                    <div className="text-center mb-2 text-slate-500">             │</div>
                    <div className="text-center mb-2 text-slate-500">    ┌────────┼────────┐</div>
                    <div className="text-center mb-2 text-slate-500">    │        │        │</div>
                    <div className="text-center mb-2 text-blue-300">┌───┴──┐ ┌──┴───┐ ┌──┴───┐</div>
                    <div className="text-center mb-1 text-blue-300">│小程序A│ │小程序B│ │小程序C│</div>
                    <div className="text-center mb-2 text-blue-300">│iframe│ │route │ │ API  │</div>
                    <div className="text-center mb-2 text-blue-300">└───┬──┘ └──┬───┘ └──┬───┘</div>
                    <div className="text-center mb-2 text-slate-500">    │        │        │</div>
                    <div className="text-center mb-2 text-slate-500">    └────────┼────────┘</div>
                    <div className="text-center mb-2 text-slate-500">             │</div>
                    <div className="text-center mb-2 text-green-300">┌────────────┴────────────┐</div>
                    <div className="text-center mb-1 text-green-300">│  分布式节点网络           │</div>
                    <div className="text-center mb-2 text-green-300">│  服务器/API/算力/存储     │</div>
                    <div className="text-center mb-2 text-green-300">└─────────────────────────┘</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 三种程序类型 */}
            <h3 className="text-lg font-semibold mb-4 text-slate-300">三种嵌套程序类型</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2 text-base">
                    <Smartphone className="h-5 w-5" /> iframe 嵌入
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-400">
                  <p>通过iframe嵌入外部网页，适用于独立的Web应用。支持PostMessage双向通信。</p>
                  <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs font-mono">
                    entryType: &apos;iframe&apos;<br/>
                    entryUrl: &apos;https://...&apos;
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2 text-base">
                    <Code className="h-5 w-5" /> route 内部路由
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-400">
                  <p>直接跳转到平台内部路由页面，适用于平台原生功能模块。无需iframe。</p>
                  <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs font-mono">
                    entryType: &apos;route&apos;<br/>
                    entryRoute: &apos;/moral-ledger&apos;
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2 text-base">
                    <Zap className="h-5 w-5" /> API 驱动
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-400">
                  <p>通过API端点驱动，适用于纯后端服务或数据接口。由桌面负责渲染。</p>
                  <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs font-mono">
                    entryType: &apos;api&apos;<br/>
                    entryUrl: &apos;https://api...&apos;
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 关键概念 */}
            <h3 className="text-lg font-semibold mb-4 text-slate-300">关键概念</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-amber-900/30 to-red-900/30 border-amber-800/50">
                <CardContent className="p-4 text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                  <h4 className="font-semibold text-amber-300 mb-1">基因锁</h4>
                  <p className="text-xs text-slate-400">灵魂密码，每个嵌套程序的先天资质烙印</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-800/50">
                <CardContent className="p-4 text-center">
                  <Network className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                  <h4 className="font-semibold text-blue-300 mb-1">分布式节点</h4>
                  <p className="text-xs text-slate-400">免费共享的全球服务器和算力网络</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-800/50">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <h4 className="font-semibold text-green-300 mb-1">道德门槛</h4>
                  <p className="text-xs text-slate-400">五维评分体系，确保使用者心性天平</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-800/50">
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-pink-400" />
                  <h4 className="font-semibold text-pink-300 mb-1">命运共同体</h4>
                  <p className="text-xs text-slate-400">残健共建，天平向底层和残疾人倾斜</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ====== SDK文档 ====== */}
          <TabsContent value="sdk" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-400" />
                  PostMessage Bridge API
                </CardTitle>
                <CardDescription className="text-slate-400">
                  桌面（父程序）与嵌套小程序（子程序）通过 PostMessage 进行双向通信
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-slate-700/50 rounded-lg text-sm text-slate-300 mb-4">
                  <p>所有嵌套式小程序（iframe类型）都可以通过 PostMessage 与桌面通信。</p>
                  <p className="mt-1">桌面会自动在子程序就绪后发送基因锁状态、用户信息和节点信息。</p>
                </div>
              </CardContent>
            </Card>

            {/* 父→子 消息 */}
            <h3 className="text-lg font-semibold mb-4 text-slate-300">父程序 → 子程序 (Parent → Child)</h3>
            <div className="space-y-4 mb-8">
              {[
                {
                  type: 'GENE_LOCK_STATUS',
                  payload: '{ valid: boolean; details?: string }',
                  desc: '基因锁验证状态。valid=true表示已激活，可解锁高级功能。',
                  trigger: '子程序发送 REQUEST_GENE_LOCK 后自动返回'
                },
                {
                  type: 'USER_INFO',
                  payload: '{ id: string; name: string; moralScore: number }',
                  desc: '当前用户信息，包括道德评分。小程序可根据评分调整功能。',
                  trigger: '子程序就绪后自动发送'
                },
                {
                  type: 'NODE_INFO',
                  payload: '{ nodes: Array<{ id, name, endpoint, status }> }',
                  desc: '分布式节点列表，小程序可选择最佳节点运行。',
                  trigger: '子程序发送 REQUEST_NODE_INFO 后自动返回'
                },
                {
                  type: 'CLOSE_APP',
                  payload: '无',
                  desc: '桌面要求小程序关闭，子程序应执行清理操作。',
                  trigger: '桌面关闭按钮点击'
                },
                {
                  type: 'ROUTING_INFO',
                  payload: '{ currentRoute: string; params: Record<string, string> }',
                  desc: '路由信息，用于子程序内部的页面导航。',
                  trigger: '桌面路由变化时自动发送'
                }
              ].map(msg => (
                <Card key={msg.type} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">{msg.type}</Badge>
                      <span className="text-xs text-slate-400">Parent → Child</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{msg.desc}</p>
                    <div className="p-2 bg-slate-700/50 rounded text-xs font-mono text-green-300 mb-2">
                      payload: {msg.payload}
                    </div>
                    <p className="text-xs text-slate-500">触发: {msg.trigger}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 子→父 消息 */}
            <h3 className="text-lg font-semibold mb-4 text-slate-300">子程序 → 父程序 (Child → Parent)</h3>
            <div className="space-y-4 mb-8">
              {[
                {
                  type: 'APP_READY',
                  payload: '{ appId: string; version: string }',
                  desc: '小程序加载完成，通知桌面可以开始通信。',
                  action: '页面加载后立即发送'
                },
                {
                  type: 'APP_ERROR',
                  payload: '{ message: string; code?: string }',
                  desc: '小程序发生错误，通知桌面显示错误信息。',
                  action: '发生异常时发送'
                },
                {
                  type: 'REQUEST_CLOSE',
                  payload: '无',
                  desc: '小程序主动请求关闭自身。',
                  action: '用户点击小程序内关闭按钮'
                },
                {
                  type: 'REQUEST_GENE_LOCK',
                  payload: '无',
                  desc: '请求桌面发送基因锁状态。',
                  action: '需要验证基因锁时发送'
                },
                {
                  type: 'REQUEST_NODE_INFO',
                  payload: '无',
                  desc: '请求桌面发送节点列表。',
                  action: '需要连接节点时发送'
                },
                {
                  type: 'REQUEST_ROUTE',
                  payload: '{ route: string }',
                  desc: '请求桌面导航到指定路由。',
                  action: '需要页面跳转时发送'
                }
              ].map(msg => (
                <Card key={msg.type} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-600 text-white">{msg.type}</Badge>
                      <span className="text-xs text-slate-400">Child → Parent</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{msg.desc}</p>
                    <div className="p-2 bg-slate-700/50 rounded text-xs font-mono text-green-300 mb-2">
                      payload: {msg.payload}
                    </div>
                    <p className="text-xs text-slate-500">使用场景: {msg.action}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 基因锁集成文档 */}
            <h3 className="text-lg font-semibold mb-4 text-slate-300">基因锁集成</h3>
            <Card className="bg-gradient-to-r from-amber-900/20 to-red-900/20 border-amber-800/50">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-slate-300">
                  每个嵌套式小程序都应该检查基因锁状态，根据验证结果调整功能权限：
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/30">
                    <h4 className="font-semibold text-green-400 mb-2">✅ 基因锁已激活</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>- 解锁全部功能</li>
                      <li>- 可访问核心数据</li>
                      <li>- 可使用高级服务</li>
                      <li>- 可连接分布式节点</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-800/30">
                    <h4 className="font-semibold text-amber-400 mb-2">⚠️ 基因锁未激活</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>- 仅基础功能可用</li>
                      <li>- 无法访问敏感数据</li>
                      <li>- 显示激活引导</li>
                      <li>- 节点连接受限</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 节点路由文档 */}
            <h3 className="text-lg font-semibold mt-8 mb-4 text-slate-300">节点路由</h3>
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-slate-300">
                  小程序可以通过 REQUEST_NODE_INFO 获取可用节点列表，选择最佳节点运行：
                </p>
                <div className="p-3 bg-slate-700/50 rounded-lg text-xs font-mono text-green-300 mt-3">
                  {`// 选择最佳节点策略:
1. 过滤 status === 'active' 的节点
2. 按 avgLatency 排序，选择延迟最低的
3. 检查节点 capabilities 是否满足需求
4. 检查 maxConcurrent 是否还有余量
5. 如果首选节点可用，优先使用`}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ====== 注册小程序 ====== */}
          <TabsContent value="register" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-400" />
                  注册新的嵌套式小程序
                </CardTitle>
                <CardDescription className="text-slate-400">
                  将您开发的应用注册到共同体桌面，让所有用户可以使用
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-900/20 border-green-800/50">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">小程序名称 *</Label>
                  <Input
                    value={regForm.name}
                    onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：助残导航"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">小程序描述 *</Label>
                  <Input
                    value={regForm.description}
                    onChange={(e) => setRegForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="简要描述小程序的功能和用途"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">图标 (emoji)</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          regForm.icon === emoji
                            ? 'bg-pink-600 scale-110'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        onClick={() => setRegForm(prev => ({ ...prev, icon: emoji }))}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">入口类型</Label>
                    <select
                      value={regForm.entryType}
                      onChange={(e) => setRegForm(prev => ({ ...prev, entryType: e.target.value }))}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
                    >
                      <option value="iframe">iframe 嵌入</option>
                      <option value="route">内部路由</option>
                      <option value="api">API 驱动</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">分类</Label>
                    <select
                      value={regForm.category}
                      onChange={(e) => setRegForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
                    >
                      <option value="tool">工具</option>
                      <option value="social">社交</option>
                      <option value="ledger">账本</option>
                      <option value="creative">创作</option>
                      <option value="service">服务</option>
                    </select>
                  </div>
                </div>

                {regForm.entryType === 'iframe' && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">入口URL *</Label>
                    <Input
                      value={regForm.entryUrl}
                      onChange={(e) => setRegForm(prev => ({ ...prev, entryUrl: e.target.value }))}
                      placeholder="https://your-app.example.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                )}

                {regForm.entryType === 'route' && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">内部路由 *</Label>
                    <Input
                      value={regForm.entryRoute}
                      onChange={(e) => setRegForm(prev => ({ ...prev, entryRoute: e.target.value }))}
                      placeholder="/your-app-route"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">标签 (逗号分隔)</Label>
                  <Input
                    value={regForm.tags}
                    onChange={(e) => setRegForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="助残, 导航, 公益"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">是否需要基因锁</Label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regForm.requiresGeneLock}
                          onChange={(e) => setRegForm(prev => ({ ...prev, requiresGeneLock: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-300">需要基因锁验证</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">最低道德评分</Label>
                    <Input
                      type="number"
                      value={regForm.minMoralScore}
                      onChange={(e) => setRegForm(prev => ({ ...prev, minMoralScore: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">首选节点</Label>
                  <select
                    value={regForm.preferredNodeId}
                    onChange={(e) => setRegForm(prev => ({ ...prev, preferredNodeId: e.target.value }))}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
                  >
                    <option value="">无首选节点（自动分配）</option>
                    {nodes.map(node => (
                      <option key={node.id} value={node.id}>{node.name} ({node.status})</option>
                    ))}
                  </select>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading || !regForm.name || !regForm.description}
                  onClick={handleRegisterApp}
                >
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />注册中...</> : '注册小程序'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ====== 代码示例 ====== */}
          <TabsContent value="examples" className="mt-6">
            {/* 完整兼容小程序 */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Smartphone className="h-5 w-5" />
                    完整的兼容嵌套式小程序
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() => handleCopyCode(CODE_COMPATIBLE_APP, 'compatible')}
                  >
                    {copiedCode === 'compatible' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription className="text-slate-400">
                  一个完整的HTML页面示例，展示如何构建兼容圆聚助残桌面的嵌套式小程序
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto max-h-96 overflow-y-auto text-xs text-green-300 font-mono">
                  {CODE_COMPATIBLE_APP}
                </pre>
              </CardContent>
            </Card>

            {/* PostMessage 监听器 */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Code className="h-5 w-5" />
                    PostMessage 监听器设置
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() => handleCopyCode(CODE_LISTENER, 'listener')}
                  >
                    {copiedCode === 'listener' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription className="text-slate-400">
                  在嵌套式小程序中设置 PostMessage 监听器，处理来自桌面的所有消息类型
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto max-h-96 overflow-y-auto text-xs text-green-300 font-mono">
                  {CODE_LISTENER}
                </pre>
              </CardContent>
            </Card>

            {/* 基因锁验证流程 */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-amber-400">
                    <Lock className="h-5 w-5" />
                    基因锁验证流程
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() => handleCopyCode(CODE_GENE_LOCK_FLOW, 'genelock')}
                  >
                    {copiedCode === 'genelock' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription className="text-slate-400">
                  如何在小程序中集成基因锁验证，根据验证结果调整功能权限
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto max-h-96 overflow-y-auto text-xs text-green-300 font-mono">
                  {CODE_GENE_LOCK_FLOW}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
