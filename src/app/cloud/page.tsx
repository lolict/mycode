'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Cloud, Server, Globe, GitBranch, HardDrive, Users, RefreshCw, Check, AlertTriangle, Wifi, WifiOff, Plus, Trash2 } from 'lucide-react'

interface CloudConfig {
  configured: boolean
  status: {
    primary: { type: string; connected: boolean; lastSync: number | null }
    pendingChanges: number
    isSyncing: boolean
  }
  configInfo: {
    primary: string
    hasGithub: boolean
    hasGitee: boolean
    hasWebdav: boolean
    volunteerNodeCount: number
  } | null
}

interface VolunteerNodeInfo {
  id: string
  name: string
  url: string
  status: string
  providedBy: string
}

export default function CloudSyncPage() {
  const [config, setConfig] = useState<CloudConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'github' | 'webdav' | 'volunteer' | 'p2p'>('github')

  // GitHub 配置表单
  const [githubToken, setGithubToken] = useState('')
  const [githubOwner, setGithubOwner] = useState('')
  const [githubRepo, setGithubRepo] = useState('')
  const [githubBranch, setGithubBranch] = useState('main')

  // WebDAV 配置表单
  const [webdavUrl, setWebdavUrl] = useState('https://dav.jianguoyun.com/dav/')
  const [webdavUsername, setWebdavUsername] = useState('')
  const [webdavPassword, setWebdavPassword] = useState('')
  const [webdavPath, setWebdavPath] = useState('/yuanju-data/')

  // 志愿者节点表单
  const [nodeName, setNodeName] = useState('')
  const [nodeUrl, setNodeUrl] = useState('')
  const [nodeProvider, setNodeProvider] = useState('')
  const [nodeDesc, setNodeDesc] = useState('')
  const [nodes, setNodes] = useState<VolunteerNodeInfo[]>([])

  // 保存状态
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/cloud/sync')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch {
      // 忽略
    } finally {
      setLoading(false)
    }
  }

  const saveGithubConfig = async () => {
    if (!githubToken || !githubOwner || !githubRepo) {
      setMessage({ type: 'error', text: '请填写完整的 GitHub 配置信息' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github: {
            token: githubToken,
            owner: githubOwner,
            repo: githubRepo,
            branch: githubBranch,
            dataPath: 'data/',
          },
          syncStrategy: {
            primary: 'github',
            backup: [],
            syncInterval: 30000,
            conflictResolution: 'last-write-wins',
          },
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'GitHub 云端同步配置已保存！数据将自动同步到仓库。' })
        loadConfig()
      } else {
        setMessage({ type: 'error', text: data.error || '配置保存失败' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '网络错误' })
    } finally {
      setSaving(false)
    }
  }

  const saveWebdavConfig = async () => {
    if (!webdavUrl || !webdavUsername || !webdavPassword) {
      setMessage({ type: 'error', text: '请填写完整的 WebDAV 配置信息' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webdav: {
            url: webdavUrl,
            username: webdavUsername,
            password: webdavPassword,
            dataPath: webdavPath,
          },
          syncStrategy: {
            primary: 'webdav',
            backup: [],
            syncInterval: 30000,
            conflictResolution: 'last-write-wins',
          },
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'WebDAV 云端同步配置已保存！' })
        loadConfig()
      } else {
        setMessage({ type: 'error', text: data.error || '配置保存失败' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '网络错误' })
    } finally {
      setSaving(false)
    }
  }

  const registerNode = async () => {
    if (!nodeName || !nodeUrl || !nodeProvider) {
      setMessage({ type: 'error', text: '请填写节点名称、服务器地址和志愿者名称' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/cloud/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nodeName,
          url: nodeUrl,
          providedBy: nodeProvider,
          description: nodeDesc,
          nodeType: 'full',
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setNodeName('')
        setNodeUrl('')
        setNodeProvider('')
        setNodeDesc('')
        loadNodes()
      } else {
        setMessage({ type: 'error', text: data.error || '注册失败' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '网络错误' })
    } finally {
      setSaving(false)
    }
  }

  const loadNodes = async () => {
    try {
      const res = await fetch('/api/cloud/nodes')
      if (res.ok) {
        const data = await res.json()
        setNodes(data.nodes || [])
      }
    } catch {
      // 忽略
    }
  }

  const triggerSync = async () => {
    try {
      const res = await fetch('/api/cloud/sync?action=sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setMessage({ type: 'success', text: `同步完成：推送${data.pushed}条，拉取${data.pulled}条` })
      }
    } catch {
      setMessage({ type: 'error', text: '同步失败' })
    }
  }

  useEffect(() => {
    loadNodes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Cloud className="h-12 w-12 animate-pulse text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/apps">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Cloud className="h-6 w-6 text-blue-500" />
                <h1 className="text-xl font-bold">云端同步配置</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 同步状态指示 */}
              {config?.configured && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Wifi className="h-3 w-3 mr-1" />
                  已配置
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={triggerSync}>
                <RefreshCw className="h-4 w-4 mr-2" />
                立即同步
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 架构说明 */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-blue-800 mb-3">无服务器架构说明</h2>
            <p className="text-blue-700 mb-4">
              我们没有自己的服务器，但可以通过以下方式实现云端同步和实时通信：
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <GitBranch className="h-6 w-6 text-gray-800 mb-2" />
                <h3 className="font-semibold text-sm">GitHub/Gitee</h3>
                <p className="text-xs text-gray-600 mt-1">仓库当数据库，免费5000次/小时</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <HardDrive className="h-6 w-6 text-blue-500 mb-2" />
                <h3 className="font-semibold text-sm">WebDAV/坚果云</h3>
                <p className="text-xs text-gray-600 mt-1">网盘当服务器，免费1GB</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <Users className="h-6 w-6 text-green-500 mb-2" />
                <h3 className="font-semibold text-sm">志愿者节点</h3>
                <p className="text-xs text-gray-600 mt-1">别人出服务器，获得多巴胺积分</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <Globe className="h-6 w-6 text-purple-500 mb-2" />
                <h3 className="font-semibold text-sm">P2P直连</h3>
                <p className="text-xs text-gray-600 mt-1">浏览器直连，完全免费实时</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <span>{message.text}</span>
              <Button variant="link" size="sm" onClick={() => setMessage(null)} className="ml-auto p-0 h-auto">关闭</Button>
            </div>
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'github', label: 'GitHub/Gitee', icon: <GitBranch className="h-4 w-4" /> },
            { id: 'webdav', label: 'WebDAV/坚果云', icon: <HardDrive className="h-4 w-4" /> },
            { id: 'volunteer', label: '志愿者节点', icon: <Users className="h-4 w-4" /> },
            { id: 'p2p', label: 'P2P直连', icon: <Globe className="h-4 w-4" /> },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* GitHub/Gitee 配置 */}
        {activeTab === 'github' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                GitHub / Gitee / GitCode 配置
              </CardTitle>
              <CardDescription>
                把 GitHub 仓库当数据库用！数据以 JSON 文件存到仓库的 data/ 目录下，自动版本控制。
                GitHub API 每小时免费 5000 次请求，足够日常使用。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">GitHub Token（个人访问令牌）</label>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    在 GitHub Settings → Developer settings → Personal access tokens 生成
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">仓库所有者（用户名）</label>
                  <Input
                    placeholder="lolict"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">仓库名</label>
                  <Input
                    placeholder="mycode"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    可以用同一个仓库，数据存在 data/ 目录下
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">分支</label>
                  <Input
                    placeholder="main"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">支持的 Git 平台</h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-white rounded p-2">
                    <strong>GitHub</strong>
                    <p className="text-gray-500">api.github.com</p>
                    <p className="text-green-600">5000次/小时</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Gitee</strong>
                    <p className="text-gray-500">gitee.com/api/v5</p>
                    <p className="text-green-600">无明确限制</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>GitCode</strong>
                    <p className="text-gray-500">api.gitcode.com</p>
                    <p className="text-gray-500">兼容GitHub API</p>
                  </div>
                </div>
              </div>

              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={saveGithubConfig}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存 GitHub 配置'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* WebDAV 配置 */}
        {activeTab === 'webdav' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-blue-500" />
                WebDAV / 坚果云 配置
              </CardTitle>
              <CardDescription>
                用坚果云等支持 WebDAV 的网盘充当服务器。坚果云免费 1GB，支持文件读写，
                可以作为数据备份通道。也可以用 Koofr、Nextcloud 等。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">WebDAV 地址</label>
                  <Input
                    placeholder="https://dav.jianguoyun.com/dav/"
                    value={webdavUrl}
                    onChange={(e) => setWebdavUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    坚果云：https://dav.jianguoyun.com/dav/
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">用户名</label>
                  <Input
                    placeholder="your-email@example.com"
                    value={webdavUsername}
                    onChange={(e) => setWebdavUsername(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    坚果云账号邮箱
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">密码（应用专用密码）</label>
                  <Input
                    type="password"
                    placeholder="应用专用密码"
                    value={webdavPassword}
                    onChange={(e) => setWebdavPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    坚果云：安全设置 → 第三方应用管理 → 添加应用密码
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">数据存储路径</label>
                  <Input
                    placeholder="/yuanju-data/"
                    value={webdavPath}
                    onChange={(e) => setWebdavPath(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">支持 WebDAV 的网盘</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded p-2">
                    <strong>坚果云</strong>
                    <p className="text-gray-500">国内最稳定</p>
                    <p className="text-green-600">免费1GB</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Koofr</strong>
                    <p className="text-gray-500">app.koofr.net/dav/</p>
                    <p className="text-green-600">免费10GB</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Nextcloud</strong>
                    <p className="text-gray-500">自建或公共实例</p>
                    <p className="text-gray-500">容量自定</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Box.com</strong>
                    <p className="text-gray-500">dav.box.com/dav/</p>
                    <p className="text-green-600">免费10GB</p>
                  </div>
                </div>
              </div>

              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={saveWebdavConfig}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存 WebDAV 配置'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 志愿者节点 */}
        {activeTab === 'volunteer' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-500" />
                  注册志愿者节点
                </CardTitle>
                <CardDescription>
                  如果你有服务器（VPS、云主机、或者内网穿透的电脑），
                  可以注册为志愿者节点，为圆聚助残平台提供支持。
                  志愿者将获得多巴胺积分奖励！
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">节点名称</label>
                    <Input
                      placeholder="例如：华东节点1号"
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">服务器地址</label>
                    <Input
                      placeholder="https://your-server.com"
                      value={nodeUrl}
                      onChange={(e) => setNodeUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      需要运行圆聚助残平台程序，有 /api/health 端点
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">志愿者名称</label>
                    <Input
                      placeholder="你的名字/昵称"
                      value={nodeProvider}
                      onChange={(e) => setNodeProvider(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">节点描述（可选）</label>
                    <Input
                      placeholder="例如：4核8G服务器，华东地区"
                      value={nodeDesc}
                      onChange={(e) => setNodeDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-yellow-800 mb-2">如何提供服务器？</h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <p>1. 在你的服务器上运行圆聚助残平台（Next.js + SQLite）</p>
                    <p>2. 用花生壳、frp、ngrok 等工具把本地服务暴露到公网</p>
                    <p>3. 或者使用免费的云服务：Vercel、Railway、Render</p>
                    <p>4. 在上方填写你的服务器地址，系统会自动检测是否在线</p>
                  </div>
                </div>

                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={registerNode}
                  disabled={saving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {saving ? '注册中...' : '注册节点'}
                </Button>
              </CardContent>
            </Card>

            {/* 已注册的节点列表 */}
            <Card>
              <CardHeader>
                <CardTitle>已注册的节点</CardTitle>
              </CardHeader>
              <CardContent>
                {nodes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">暂无注册节点</p>
                ) : (
                  <div className="space-y-3">
                    {nodes.map((node) => (
                      <div key={node.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{node.name}</span>
                            <Badge variant={node.status === 'active' ? 'default' : 'secondary'}
                              className={node.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                              {node.status === 'active' ? '在线' : '离线'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{node.url}</p>
                          <p className="text-xs text-gray-400">由 {node.providedBy} 提供</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* P2P 直连 */}
        {activeTab === 'p2p' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                P2P 浏览器直连（WebRTC）
              </CardTitle>
              <CardDescription>
                浏览器之间直接建立连接，不需要服务器中转数据！
                适合即时通信和设备间同步。信号交换通过 GitHub 仓库完成。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-purple-800 mb-2">P2P 工作原理</h4>
                <div className="text-xs text-purple-700 space-y-1">
                  <p>1. 你想连接对方 → 创建 Offer 信号 → 存到 GitHub 仓库</p>
                  <p>2. 对方从 GitHub 读取 Offer → 创建 Answer 信号 → 存回 GitHub</p>
                  <p>3. 你读取 Answer → 双方建立 WebRTC 直连</p>
                  <p>4. 直连建立后，数据直接在浏览器之间传输，不经过任何服务器</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">连接状态</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">本地节点ID</span>
                    <span className="font-mono text-xs">等待初始化...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">已连接节点</span>
                    <span>0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">信令通道</span>
                    <Badge variant="secondary">未配置</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-700">
                  P2P 功能需要先配置 GitHub 信令通道。请先在 GitHub 标签页配置好仓库信息，
                  然后回到这里启动 P2P 连接。
                </p>
              </div>

              <Button variant="outline" className="w-full" disabled>
                <Globe className="h-4 w-4 mr-2" />
                需要先配置 GitHub 信令通道
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
