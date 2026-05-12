'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Cloud, Server, Globe, GitBranch, HardDrive, Users, RefreshCw, Check, AlertTriangle, Wifi, WifiOff, Plus, Trash2, Database, Eye, User, Edit3, Save, X, Search, Zap } from 'lucide-react'

interface CloudConfig {
  configured: boolean
  status: {
    primary: { type: string; connected: boolean; lastSync: number | null }
    backup: Array<{ type: string; connected: boolean; lastSync: number | null }>
    pendingChanges: number
    isSyncing: boolean
    totalSynced: number
    lastFullSync: number | null
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
  nodeType: string
}

interface DataKeyEntry {
  key: string
  version: number
  updatedAt: number
  source: string
}

interface IdentityInfo {
  deviceId: string
  name: string | null
  userType: string
  isVerified: boolean
}

export default function CloudSyncPage() {
  const [config, setConfig] = useState<CloudConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'github' | 'webdav' | 'volunteer' | 'p2p' | 'data' | 'identity'>('github')

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

  // 数据浏览器
  const [dataKeys, setDataKeys] = useState<DataKeyEntry[]>([])
  const [dataViewKey, setDataViewKey] = useState<string | null>(null)
  const [dataViewContent, setDataViewContent] = useState<any>(null)

  // 身份信息
  const [identity, setIdentity] = useState<IdentityInfo | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBio, setNewBio] = useState('')

  // 通用状态
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [testing, setTesting] = useState<string | null>(null) // 正在测试的通道
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; info?: any; error?: string }>>({})

  useEffect(() => {
    loadConfig()
    loadNodes()
    loadIdentity()
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

  const loadIdentity = async () => {
    try {
      const res = await fetch('/api/identity')
      if (res.ok) {
        const data = await res.json()
        setIdentity(data.identity)
      }
    } catch {
      // 忽略
    }
  }

  const loadDataKeys = async () => {
    try {
      const res = await fetch('/api/cloud/sync?action=list')
      if (res.ok) {
        const data = await res.json()
        setDataKeys(data.keys || [])
      }
    } catch {
      // 忽略
    }
  }

  const viewDataKey = async (key: string) => {
    try {
      const res = await fetch(`/api/cloud/sync?key=${encodeURIComponent(key)}`)
      if (res.ok) {
        const data = await res.json()
        setDataViewKey(key)
        setDataViewContent(data)
      }
    } catch {
      // 忽略
    }
  }

  const testConnection = async (channel: 'github' | 'gitee' | 'webdav') => {
    setTesting(channel)
    try {
      const res = await fetch('/api/cloud/sync?action=test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      })
      const data = await res.json()
      setTestResult(prev => ({ ...prev, [channel]: data }))

      if (data.ok) {
        setMessage({ type: 'success', text: `${channel} 连接成功！${data.info?.login ? `用户: ${data.info.login}` : ''}` })
      } else {
        setMessage({ type: 'error', text: `${channel} 连接失败: ${data.error}` })
      }
    } catch (err: any) {
      setTestResult(prev => ({ ...prev, [channel]: { ok: false, error: err.message } }))
      setMessage({ type: 'error', text: `测试失败: ${err.message}` })
    } finally {
      setTesting(null)
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
        setMessage({ type: 'success', text: 'GitHub 云端同步配置已保存并持久化！数据将自动同步到仓库。' })
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

  const removeNode = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/cloud/nodes?id=${nodeId}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ type: 'success', text: '节点已移除' })
        loadNodes()
      }
    } catch {
      setMessage({ type: 'error', text: '移除失败' })
    }
  }

  const checkAllNodes = async () => {
    try {
      const res = await fetch('/api/cloud/nodes?action=check', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setMessage({ type: 'info', text: `检查了 ${data.results.length} 个节点` })
        loadNodes()
      }
    } catch {
      setMessage({ type: 'error', text: '检查失败' })
    }
  }

  const triggerSync = async () => {
    try {
      const res = await fetch('/api/cloud/sync?action=sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setMessage({
          type: 'success',
          text: `同步完成：推送${data.pushed}条，拉取${data.pulled}条${data.errors.length > 0 ? `，${data.errors.length}个错误` : ''}`
        })
        loadConfig()
      }
    } catch {
      setMessage({ type: 'error', text: '同步失败' })
    }
  }

  const updateIdentity = async (updates: { name?: string; bio?: string; userType?: string }) => {
    try {
      const res = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        loadIdentity()
        setEditingName(false)
        setMessage({ type: 'success', text: '身份信息已更新' })
      }
    } catch {
      setMessage({ type: 'error', text: '更新失败' })
    }
  }

  const formatTime = (ts: number | null) => {
    if (!ts) return '从未'
    return new Date(ts).toLocaleString('zh-CN')
  }

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
                <Badge variant="outline" className={`border-green-600 ${config.status.primary.connected ? 'text-green-600' : 'text-yellow-600'}`}>
                  {config.status.primary.connected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {config.status.primary.connected ? '已连接' : '未连接'}
                </Badge>
              )}
              <Badge variant="secondary">
                已同步: {config?.status.totalSynced || 0}
              </Badge>
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
            <div className="grid md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4">
                <User className="h-6 w-6 text-pink-500 mb-2" />
                <h3 className="font-semibold text-sm">设备身份</h3>
                <p className="text-xs text-gray-600 mt-1">自动生成，无需注册</p>
              </div>
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
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : message.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <Check className="h-5 w-5" /> : message.type === 'info' ? <Search className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <span>{message.text}</span>
              <Button variant="link" size="sm" onClick={() => setMessage(null)} className="ml-auto p-0 h-auto">关闭</Button>
            </div>
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'identity', label: '身份', icon: <User className="h-4 w-4" /> },
            { id: 'github', label: 'GitHub/Gitee', icon: <GitBranch className="h-4 w-4" /> },
            { id: 'webdav', label: 'WebDAV/坚果云', icon: <HardDrive className="h-4 w-4" /> },
            { id: 'volunteer', label: '志愿者节点', icon: <Users className="h-4 w-4" /> },
            { id: 'p2p', label: 'P2P直连', icon: <Globe className="h-4 w-4" /> },
            { id: 'data', label: '数据管理', icon: <Database className="h-4 w-4" /> },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTab(tab.id as any)
                if (tab.id === 'data') loadDataKeys()
              }}
              className={activeTab === tab.id ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* 身份卡片 */}
        {activeTab === 'identity' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-pink-500" />
                  设备身份
                </CardTitle>
                <CardDescription>
                  本地优先身份系统 — 首次访问自动生成，无需注册服务器。
                  你的身份存在本地数据库，配置云端后自动同步。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {identity && (
                  <>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {(identity.name || identity.deviceId.slice(-2)).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {editingName ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  placeholder="输入昵称"
                                  className="w-40 h-8"
                                />
                                <Button size="sm" onClick={() => updateIdentity({ name: newName })}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <h3 className="text-lg font-bold">
                                {identity.name || `用户${identity.deviceId.slice(-6)}`}
                                <Button variant="ghost" size="sm" onClick={() => { setEditingName(true); setNewName(identity.name || '') }}>
                                  <Edit3 className="h-3 w-3 ml-1" />
                                </Button>
                              </h3>
                            )}
                            <Badge className={identity.isVerified ? 'bg-green-500' : 'bg-gray-400'}>
                              {identity.isVerified ? '已验证' : '未验证'}
                            </Badge>
                            <Badge variant="outline">
                              {identity.userType === 'disabled' ? '残疾人' : '健全人'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 font-mono">设备ID: {identity.deviceId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">用户类型</label>
                        <div className="flex gap-2">
                          <Button
                            variant={identity.userType === 'disabled' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateIdentity({ userType: 'disabled' })}
                            className={identity.userType === 'disabled' ? 'bg-pink-500' : ''}
                          >
                            残疾人
                          </Button>
                          <Button
                            variant={identity.userType === 'able-bodied' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateIdentity({ userType: 'able-bodied' })}
                            className={identity.userType === 'able-bodied' ? 'bg-blue-500' : ''}
                          >
                            健全人
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          残疾人获得额外30%账户庇佑
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">个人简介</label>
                        <Input
                          placeholder="介绍一下自己..."
                          value={newBio}
                          onChange={(e) => setNewBio(e.target.value)}
                          onBlur={() => newBio && updateIdentity({ bio: newBio })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">身份同步说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                  <p>你的身份信息存储在本地 SQLite 数据库中，无需服务器即可使用。</p>
                  <p>配置 GitHub 或 WebDAV 同步后，身份会自动随数据一起同步到云端。</p>
                  <p>换设备时，从云端拉取数据即可恢复身份（自动合并或选择）。</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

              <div className="flex gap-3">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={saveGithubConfig}
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存 GitHub 配置'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testConnection('github')}
                  disabled={testing === 'github' || !githubToken}
                >
                  {testing === 'github' ? '测试中...' : '测试连接'}
                </Button>
              </div>

              {testResult.github && (
                <div className={`p-3 rounded-lg ${testResult.github.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 text-sm">
                    {testResult.github.ok ? <Check className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                    <span>{testResult.github.ok ? `连接成功！用户: ${testResult.github.info?.login}` : `连接失败: ${testResult.github.error}`}</span>
                  </div>
                </div>
              )}

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
                可以作为数据备份通道。
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

              <div className="flex gap-3">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={saveWebdavConfig}
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存 WebDAV 配置'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testConnection('webdav')}
                  disabled={testing === 'webdav' || !webdavUrl}
                >
                  {testing === 'webdav' ? '测试中...' : '测试连接'}
                </Button>
              </div>

              {testResult.webdav && (
                <div className={`p-3 rounded-lg ${testResult.webdav.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 text-sm">
                    {testResult.webdav.ok ? <Check className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                    <span>{testResult.webdav.ok ? 'WebDAV 连接成功！' : `连接失败: ${testResult.webdav.error}`}</span>
                  </div>
                </div>
              )}

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
                      需要运行圆聚助残平台程序，有 /api/cloud/health 端点
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

                <div className="flex gap-3">
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={registerNode}
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {saving ? '注册中...' : '注册节点'}
                  </Button>
                  <Button variant="outline" onClick={checkAllNodes}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    检查所有节点
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 已注册的节点列表 */}
            <Card>
              <CardHeader>
                <CardTitle>已注册的节点（持久化存储）</CardTitle>
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
                              {node.status === 'active' ? '在线' : node.status === 'pending' ? '待验证' : '离线'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{node.nodeType}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">{node.url}</p>
                          <p className="text-xs text-gray-400">由 {node.providedBy} 提供</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeNode(node.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
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
                    <span className="font-mono text-xs">{identity?.deviceId || '等待初始化...'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">已连接节点</span>
                    <span>0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">信令通道</span>
                    <Badge variant={config?.configInfo?.hasGithub ? 'default' : 'secondary'}
                      className={config?.configInfo?.hasGithub ? 'bg-green-500' : ''}>
                      {config?.configInfo?.hasGithub ? 'GitHub已配置' : '未配置'}
                    </Badge>
                  </div>
                </div>
              </div>

              {config?.configInfo?.hasGithub ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-sm text-green-800">信令通道已就绪</span>
                  </div>
                  <p className="text-xs text-green-700 mb-3">
                    GitHub 仓库已配置，P2P 信令通道可用。点击下方按钮启动 P2P 服务。
                  </p>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    <Zap className="h-4 w-4 mr-2" />
                    启动 P2P 服务
                  </Button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-700">
                    P2P 功能需要先配置 GitHub 信令通道。请先在 GitHub 标签页配置好仓库信息，
                    然后回到这里启动 P2P 连接。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 数据管理 */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  同步数据管理
                </CardTitle>
                <CardDescription>
                  查看和管理已同步的数据。所有数据都有版本追踪，支持冲突解决。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Button variant="outline" size="sm" onClick={loadDataKeys}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                  <Button variant="outline" size="sm" onClick={triggerSync}>
                    <Cloud className="h-4 w-4 mr-2" />
                    立即同步
                  </Button>
                </div>

                {dataKeys.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">暂无同步数据</p>
                ) : (
                  <div className="space-y-2">
                    {dataKeys.map((entry) => (
                      <div key={entry.key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100"
                        onClick={() => viewDataKey(entry.key)}>
                        <div className="flex items-center gap-3">
                          <Database className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{entry.key}</p>
                            <p className="text-xs text-gray-400">
                              版本 {entry.version} · 来源 {entry.source} · 更新于 {formatTime(entry.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 数据查看 */}
            {dataViewKey && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    数据: {dataViewKey}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-auto max-h-96">
                    {JSON.stringify(dataViewContent, null, 2)}
                  </pre>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => { setDataViewKey(null); setDataViewContent(null) }}>
                    关闭
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 同步状态 */}
            <Card>
              <CardHeader>
                <CardTitle>同步状态详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">主通道</span>
                    <span>{config?.status.primary.type || 'none'} {config?.status.primary.connected ? '(已连接)' : '(未连接)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最后全量同步</span>
                    <span>{formatTime(config?.status.lastFullSync || null)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">待推送</span>
                    <span>{config?.status.pendingChanges || 0} 条</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">总同步次数</span>
                    <span>{config?.status.totalSynced || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">正在同步</span>
                    <span>{config?.status.isSyncing ? '是' : '否'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
