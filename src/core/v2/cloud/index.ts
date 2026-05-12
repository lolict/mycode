/**
 * 云端同步系统 - Cloud Sync System (v2 增强版)
 *
 * 没有服务器？没问题！我们有多条"电线"可以拉：
 *
 * 1. GitHub/Gitee/GitCode — 仓库即数据库
 *    优点：免费、可靠、永久保存、版本控制
 *    缺点：有频率限制、不是严格实时
 *    用途：数据持久化的主通道
 *
 * 2. WebDAV（坚果云等）— 网盘即服务器
 *    优点：免费1GB、标准协议、实时文件读写
 *    缺点：速度一般、依赖第三方
 *    用途：文件存储、数据备份
 *
 * 3. 志愿者节点 — 别人出服务器
 *    优点：真正的服务器、实时
 *    缺点：不稳定、依赖他人
 *    用途：API代理、实时中转
 *
 * 4. P2P (WebRTC) — 浏览器直连
 *    优点：完全免费、实时、无需中间人
 *    缺点：需要信令服务器、断线数据丢
 *    用途：即时通信、设备间同步
 *
 * 架构策略：
 * - 写数据 → 本地SQLite立即 → GitHub主存 + WebDAV备份
 * - 读数据 → 本地缓存 → GitHub → WebDAV → 志愿者节点
 * - 实时通信 → P2P直连 → 志愿者节点中转
 * - 离线可用 → 本地SQLite优先
 * - 冲突解决 → 版本号 + 最后写入胜出
 */

import { db } from '@/lib/db'

// ============================================
// 统一接口定义
// ============================================

export interface CloudSyncConfig {
  /** GitHub配置 */
  github?: {
    token: string
    owner: string
    repo: string
    branch: string
    /** 数据存储路径（默认 data/） */
    dataPath: string
  }
  /** Gitee配置 */
  gitee?: {
    token: string
    owner: string
    repo: string
    branch: string
    dataPath: string
  }
  /** WebDAV配置 */
  webdav?: {
    url: string
    username: string
    password: string
    dataPath: string
  }
  /** 志愿者节点列表 */
  volunteerNodes?: Array<{
    name: string
    url: string
    status: 'active' | 'offline' | 'unknown'
    lastPing?: number
    providedBy: string
  }>
  /** 同步策略 */
  syncStrategy?: {
    primary: 'github' | 'gitee' | 'webdav' | 'volunteer'
    backup: ('github' | 'gitee' | 'webdav')[]
    syncInterval: number
    conflictResolution: 'last-write-wins' | 'manual'
  }
}

export interface SyncResult {
  success: boolean
  source: string
  data?: any
  error?: string
  timestamp: number
  version?: number
}

export interface SyncStatus {
  primary: {
    type: string
    connected: boolean
    lastSync: number | null
    error?: string
  }
  backup: Array<{
    type: string
    connected: boolean
    lastSync: number | null
  }>
  pendingChanges: number
  isSyncing: boolean
  totalSynced: number
  lastFullSync: number | null
}

export interface DataEntry {
  key: string
  data: any
  version: number
  updatedAt: number
  source: string
}

// ============================================
// 同步状态管理
// ============================================

class CloudSyncManager {
  private config: CloudSyncConfig | null = null
  private syncIntervalId: NodeJS.Timeout | null = null
  private pendingWrites: Map<string, any> = new Map()
  private localCache: Map<string, { data: any; timestamp: number; version: number }> = new Map()
  private lastSyncTimes: Map<string, number> = new Map()
  private isSyncing = false
  private totalSynced = 0
  private lastFullSync: number | null = null
  private connectionStatus: Map<string, boolean> = new Map()

  /**
   * 初始化配置
   */
  configure(config: CloudSyncConfig): void {
    this.config = config

    // 启动定期同步
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
    }

    const interval = config.syncStrategy?.syncInterval || 30000
    this.syncIntervalId = setInterval(() => {
      this.sync()
    }, interval)

    // 立即检测连接
    this.detectConnections()
  }

  /**
   * 获取当前配置
   */
  getConfig(): CloudSyncConfig | null {
    return this.config
  }

  /**
   * 检测各通道连接状态
   */
  async detectConnections(): Promise<void> {
    if (!this.config) return

    // 检测 GitHub 连接
    if (this.config.github?.token) {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `token ${this.config.github.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
          signal: AbortSignal.timeout(5000),
        })
        this.connectionStatus.set('github', res.ok)
      } catch {
        this.connectionStatus.set('github', false)
      }
    }

    // 检测 Gitee 连接
    if (this.config.gitee?.token) {
      try {
        const res = await fetch('https://gitee.com/api/v5/user', {
          headers: {
            Authorization: `token ${this.config.gitee.token}`,
          },
          signal: AbortSignal.timeout(5000),
        })
        this.connectionStatus.set('gitee', res.ok)
      } catch {
        this.connectionStatus.set('gitee', false)
      }
    }

    // 检测 WebDAV 连接
    if (this.config.webdav?.url) {
      try {
        const credentials = Buffer.from(
          `${this.config.webdav.username}:${this.config.webdav.password}`
        ).toString('base64')
        const res = await fetch(this.config.webdav.url, {
          method: 'PROPFIND',
          headers: {
            Authorization: `Basic ${credentials}`,
            Depth: '0',
          },
          signal: AbortSignal.timeout(5000),
        })
        this.connectionStatus.set('webdav', res.ok || res.status === 207)
      } catch {
        this.connectionStatus.set('webdav', false)
      }
    }
  }

  /**
   * 测试指定通道的连接
   */
  async testConnection(channel: 'github' | 'gitee' | 'webdav'): Promise<{ ok: boolean; error?: string; info?: any }> {
    if (!this.config) return { ok: false, error: '未配置' }

    switch (channel) {
      case 'github': {
        if (!this.config.github) return { ok: false, error: 'GitHub 未配置' }
        try {
          const res = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `token ${this.config.github.token}`,
              Accept: 'application/vnd.github.v3+json',
            },
            signal: AbortSignal.timeout(10000),
          })
          if (res.ok) {
            const user = await res.json()
            this.connectionStatus.set('github', true)
            return { ok: true, info: { login: user.login, name: user.name } }
          }
          this.connectionStatus.set('github', false)
          return { ok: false, error: `认证失败: HTTP ${res.status}` }
        } catch (e: any) {
          this.connectionStatus.set('github', false)
          return { ok: false, error: e.message }
        }
      }

      case 'gitee': {
        if (!this.config.gitee) return { ok: false, error: 'Gitee 未配置' }
        try {
          const res = await fetch('https://gitee.com/api/v5/user', {
            headers: {
              Authorization: `token ${this.config.gitee.token}`,
            },
            signal: AbortSignal.timeout(10000),
          })
          if (res.ok) {
            const user = await res.json()
            this.connectionStatus.set('gitee', true)
            return { ok: true, info: { login: user.login, name: user.name } }
          }
          this.connectionStatus.set('gitee', false)
          return { ok: false, error: `认证失败: HTTP ${res.status}` }
        } catch (e: any) {
          this.connectionStatus.set('gitee', false)
          return { ok: false, error: e.message }
        }
      }

      case 'webdav': {
        if (!this.config.webdav) return { ok: false, error: 'WebDAV 未配置' }
        try {
          const credentials = Buffer.from(
            `${this.config.webdav.username}:${this.config.webdav.password}`
          ).toString('base64')
          const res = await fetch(this.config.webdav.url, {
            method: 'PROPFIND',
            headers: {
              Authorization: `Basic ${credentials}`,
              Depth: '0',
            },
            signal: AbortSignal.timeout(10000),
          })
          const ok = res.ok || res.status === 207
          this.connectionStatus.set('webdav', ok)
          return ok
            ? { ok: true, info: { url: this.config.webdav.url } }
            : { ok: false, error: `连接失败: HTTP ${res.status}` }
        } catch (e: any) {
          this.connectionStatus.set('webdav', false)
          return { ok: false, error: e.message }
        }
      }

      default:
        return { ok: false, error: '未知通道' }
    }
  }

  /**
   * 写入数据 — 先写本地，再异步同步到云端
   * 就像先在草稿纸上写，再抄到正式本上
   */
  async write(key: string, data: any): Promise<void> {
    // 1. 获取当前版本
    let version = 1
    const cached = this.localCache.get(key)
    if (cached) {
      version = cached.version + 1
    } else {
      // 从数据库查版本
      const syncVer = await db.syncVersion.findUnique({ where: { dataKey: key } })
      if (syncVer) version = syncVer.version + 1
    }

    // 2. 写入本地缓存（立即生效）
    this.localCache.set(key, { data, timestamp: Date.now(), version })

    // 3. 加入待同步队列
    this.pendingWrites.set(key, data)

    // 4. 更新数据库版本
    await db.syncVersion.upsert({
      where: { dataKey: key },
      create: { dataKey: key, version, checksum: this.checksum(data), source: 'local' },
      update: { version, lastSyncAt: new Date(), checksum: this.checksum(data), source: 'local' },
    })

    // 5. 异步同步到云端
    this.syncKey(key, data).catch(() => {
      // 同步失败不影响本地使用，等下次重试
    })
  }

  /**
   * 读取数据 — 本地优先，云端补充
   * 就像先翻口袋，口袋没有再翻柜子
   */
  async read(key: string): Promise<SyncResult> {
    // 1. 先查本地缓存
    const cached = this.localCache.get(key)
    if (cached && Date.now() - cached.timestamp < 60000) {
      return {
        success: true,
        source: 'local-cache',
        data: cached.data,
        timestamp: cached.timestamp,
        version: cached.version,
      }
    }

    // 2. 查主通道
    if (this.config) {
      const primary = this.config.syncStrategy?.primary || 'github'
      const result = await this.readFromChannel(key, primary)
      if (result.success) {
        // 检查版本冲突
        const localVersion = await db.syncVersion.findUnique({ where: { dataKey: key } })
        const cloudVersion = result.version || 0

        if (localVersion && localVersion.version > cloudVersion) {
          // 本地版本更新，用本地的
          if (cached) {
            return {
              success: true,
              source: 'local-cache-stale',
              data: cached.data,
              timestamp: cached.timestamp,
              version: localVersion.version,
            }
          }
        }

        // 云端版本更新或没有本地版本，用云端的
        this.localCache.set(key, { data: result.data, timestamp: Date.now(), version: cloudVersion })

        // 更新本地版本记录
        await db.syncVersion.upsert({
          where: { dataKey: key },
          create: { dataKey: key, version: cloudVersion, checksum: this.checksum(result.data), source: primary },
          update: { version: cloudVersion, lastSyncAt: new Date(), checksum: this.checksum(result.data), source: primary },
        })

        return { ...result, version: cloudVersion }
      }

      // 3. 主通道失败，查备份通道
      const backups = this.config.syncStrategy?.backup || []
      for (const backup of backups) {
        const backupResult = await this.readFromChannel(key, backup)
        if (backupResult.success) {
          this.localCache.set(key, { data: backupResult.data, timestamp: Date.now(), version: backupResult.version || 0 })
          return backupResult
        }
      }

      // 4. 所有云端都失败，查志愿者节点
      const volunteerResult = await this.readFromVolunteers(key)
      if (volunteerResult.success) return volunteerResult
    }

    // 5. 全部失败，返回本地缓存（可能过期）
    if (cached) {
      return {
        success: true,
        source: 'local-cache-stale',
        data: cached.data,
        timestamp: cached.timestamp,
        version: cached.version,
      }
    }

    return {
      success: false,
      source: 'none',
      error: '数据不存在',
      timestamp: Date.now(),
    }
  }

  /**
   * 列出所有已同步的数据键
   */
  async listKeys(): Promise<DataEntry[]> {
    const versions = await db.syncVersion.findMany({
      orderBy: { lastSyncAt: 'desc' },
    })

    return versions.map(v => ({
      key: v.dataKey,
      data: this.localCache.get(v.dataKey)?.data || null,
      version: v.version,
      updatedAt: new Date(v.lastSyncAt).getTime(),
      source: v.source || 'unknown',
    }))
  }

  /**
   * 手动触发全量同步
   */
  async sync(): Promise<{ pushed: number; pulled: number; errors: string[] }> {
    if (this.isSyncing) {
      return { pushed: 0, pulled: 0, errors: ['正在同步中，请稍后再试'] }
    }

    this.isSyncing = true
    const errors: string[] = []
    let pushed = 0
    let pulled = 0

    try {
      // 推送待写入的数据
      for (const [key, data] of this.pendingWrites) {
        try {
          await this.syncKey(key, data)
          pushed++
        } catch (e: any) {
          errors.push(`推送 ${key} 失败: ${e.message}`)
        }
      }

      // 增量拉取远端更新
      if (this.config) {
        const primary = this.config.syncStrategy?.primary || 'github'
        pulled = await this.pullFromChannel(primary)

        // 也从备份通道拉取
        const backups = this.config.syncStrategy?.backup || []
        for (const backup of backups) {
          pulled += await this.pullFromChannel(backup)
        }
      }

      this.totalSynced += pushed + pulled
      this.lastFullSync = Date.now()
    } finally {
      this.isSyncing = false
    }

    return { pushed, pulled, errors }
  }

  /**
   * 从指定通道增量拉取
   */
  private async pullFromChannel(channel: string): Promise<number> {
    try {
      // 从云端读取索引文件（记录所有数据键和版本）
      const indexResult = await this.readFromChannel('__index__', channel)
      if (!indexResult.success) return 0

      const cloudIndex = indexResult.data as Record<string, { version: number; updatedAt: number }>
      if (!cloudIndex) return 0

      let pulled = 0
      for (const [key, meta] of Object.entries(cloudIndex)) {
        // 跳过索引文件自身
        if (key === '__index__') continue

        // 检查本地版本
        const localVersion = await db.syncVersion.findUnique({ where: { dataKey: key } })
        if (!localVersion || localVersion.version < meta.version) {
          // 云端更新，拉取
          const result = await this.readFromChannel(key, channel)
          if (result.success) {
            this.localCache.set(key, {
              data: result.data,
              timestamp: Date.now(),
              version: meta.version,
            })

            await db.syncVersion.upsert({
              where: { dataKey: key },
              create: { dataKey: key, version: meta.version, checksum: this.checksum(result.data), source: channel },
              update: { version: meta.version, lastSyncAt: new Date(), checksum: this.checksum(result.data), source: channel },
            })

            pulled++
          }
        }
      }

      return pulled
    } catch {
      return 0
    }
  }

  /**
   * 获取同步状态
   */
  getStatus(): SyncStatus {
    const primary = this.config?.syncStrategy?.primary || 'none'
    const primaryConnected = this.connectionStatus.get(primary) ?? false

    return {
      primary: {
        type: primary,
        connected: primaryConnected,
        lastSync: this.lastSyncTimes.get(primary) || null,
      },
      backup: (this.config?.syncStrategy?.backup || []).map(type => ({
        type,
        connected: this.connectionStatus.get(type) ?? false,
        lastSync: this.lastSyncTimes.get(type) || null,
      })),
      pendingChanges: this.pendingWrites.size,
      isSyncing: this.isSyncing,
      totalSynced: this.totalSynced,
      lastFullSync: this.lastFullSync,
    }
  }

  /**
   * 持久化配置到数据库
   */
  async persistConfig(): Promise<void> {
    if (!this.config) return

    const configs: Array<{ key: string; value: string }> = []

    if (this.config.github) {
      configs.push({ key: 'github', value: JSON.stringify(this.config.github) })
    }
    if (this.config.gitee) {
      configs.push({ key: 'gitee', value: JSON.stringify(this.config.gitee) })
    }
    if (this.config.webdav) {
      configs.push({ key: 'webdav', value: JSON.stringify(this.config.webdav) })
    }
    if (this.config.syncStrategy) {
      configs.push({ key: 'syncStrategy', value: JSON.stringify(this.config.syncStrategy) })
    }

    for (const c of configs) {
      await db.cloudSyncConfig.upsert({
        where: { configKey: c.key },
        create: { configKey: c.key, configValue: c.value },
        update: { configValue: c.value },
      })
    }
  }

  /**
   * 从数据库加载配置
   */
  async loadConfig(): Promise<CloudSyncConfig | null> {
    const configs = await db.cloudSyncConfig.findMany({ where: { isActive: true } })
    if (configs.length === 0) return null

    const result: CloudSyncConfig = {}
    for (const c of configs) {
      try {
        const parsed = JSON.parse(c.configValue)
        switch (c.configKey) {
          case 'github': result.github = parsed; break
          case 'gitee': result.gitee = parsed; break
          case 'webdav': result.webdav = parsed; break
          case 'syncStrategy': result.syncStrategy = parsed; break
        }
      } catch {
        // 配置格式错误，跳过
      }
    }

    if (Object.keys(result).length > 0) {
      this.config = result
      return result
    }

    return null
  }

  // ============================================
  // 私有方法
  // ============================================

  private async syncKey(key: string, data: any): Promise<void> {
    if (!this.config) return

    const primary = this.config.syncStrategy?.primary || 'github'
    const backups = this.config.syncStrategy?.backup || []

    // 写主通道
    try {
      await this.writeToChannel(key, data, primary)
      this.pendingWrites.delete(key)
      this.lastSyncTimes.set(primary, Date.now())
      this.totalSynced++
    } catch {
      // 主通道失败，尝试备份
    }

    // 写备份通道
    for (const backup of backups) {
      try {
        await this.writeToChannel(key, data, backup)
        this.lastSyncTimes.set(backup, Date.now())
      } catch {
        // 备份失败不影响
      }
    }

    // 更新云端索引
    await this.updateCloudIndex(key)
  }

  /**
   * 更新云端索引 — 记录所有数据键和版本
   */
  private async updateCloudIndex(updatedKey: string): Promise<void> {
    if (!this.config) return

    const primary = this.config.syncStrategy?.primary || 'github'

    // 读取现有索引
    let index: Record<string, { version: number; updatedAt: number }> = {}
    const indexResult = await this.readFromChannel('__index__', primary)
    if (indexResult.success && indexResult.data) {
      index = indexResult.data
    }

    // 更新索引条目
    const version = await db.syncVersion.findUnique({ where: { dataKey: updatedKey } })
    index[updatedKey] = {
      version: version?.version || 1,
      updatedAt: Date.now(),
    }

    // 写回索引
    try {
      await this.writeToChannel('__index__', index, primary)
    } catch {
      // 索引更新失败不影响数据同步
    }
  }

  private async writeToChannel(key: string, data: any, channel: string): Promise<void> {
    switch (channel) {
      case 'github':
        await this.writeToGitHub(key, data, 'github')
        break
      case 'gitee':
        await this.writeToGitHub(key, data, 'gitee')
        break
      case 'webdav':
        await this.writeToWebDAV(key, data)
        break
    }
  }

  private async readFromChannel(key: string, channel: string): Promise<SyncResult> {
    switch (channel) {
      case 'github':
        return this.readFromGitHub(key, 'github')
      case 'gitee':
        return this.readFromGitHub(key, 'gitee')
      case 'webdav':
        return this.readFromWebDAV(key)
      default:
        return { success: false, source: channel, error: '未知通道', timestamp: Date.now() }
    }
  }

  /**
   * GitHub/Gitee 读写 — 仓库即数据库
   */
  private async writeToGitHub(key: string, data: any, platform: 'github' | 'gitee'): Promise<void> {
    const config = platform === 'github' ? this.config!.github : this.config!.gitee
    if (!config) throw new Error(`${platform} 未配置`)

    const baseUrl = platform === 'github'
      ? 'https://api.github.com'
      : 'https://gitee.com/api/v5'

    const path = `${config.dataPath}${key}.json`
    // 包含版本和元数据
    const fullData = {
      _meta: {
        version: (await db.syncVersion.findUnique({ where: { dataKey: key } }))?.version || 1,
        updatedAt: Date.now(),
        source: 'yuanju-cloud-sync',
      },
      data,
    }
    const content = Buffer.from(JSON.stringify(fullData, null, 2)).toString('base64')

    // 先获取当前文件的SHA（如果存在）
    let sha: string | undefined
    try {
      const getRes = await fetch(`${baseUrl}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`, {
        headers: {
          Authorization: `token ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
      if (getRes.ok) {
        const fileInfo = await getRes.json()
        sha = fileInfo.sha
      }
    } catch {
      // 文件不存在，首次创建
    }

    // 写入文件
    const body: any = {
      message: `sync: 更新 ${key} [${new Date().toISOString()}]`,
      content,
      branch: config.branch,
    }
    if (sha) body.sha = sha

    const res = await fetch(`${baseUrl}/repos/${config.owner}/${config.repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`${platform} 写入失败: ${err}`)
    }
  }

  private async readFromGitHub(key: string, platform: 'github' | 'gitee'): Promise<SyncResult> {
    const config = platform === 'github' ? this.config!.github : this.config!.gitee
    if (!config) {
      return { success: false, source: platform, error: '未配置', timestamp: Date.now() }
    }

    const baseUrl = platform === 'github'
      ? 'https://api.github.com'
      : 'https://gitee.com/api/v5'

    const path = `${config.dataPath}${key}.json`

    try {
      const res = await fetch(`${baseUrl}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`, {
        headers: {
          Authorization: `token ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!res.ok) {
        return { success: false, source: platform, error: `HTTP ${res.status}`, timestamp: Date.now() }
      }

      const fileInfo = await res.json()
      const parsed = JSON.parse(Buffer.from(fileInfo.content, 'base64').toString('utf-8'))

      // 兼容：有 _meta 包裹和没有 _meta 包裹两种格式
      const version = parsed._meta?.version || 0
      const data = parsed._meta ? parsed.data : parsed

      return {
        success: true,
        source: platform,
        data,
        timestamp: Date.now(),
        version,
      }
    } catch (error: any) {
      return { success: false, source: platform, error: error.message, timestamp: Date.now() }
    }
  }

  /**
   * WebDAV 读写 — 网盘即服务器
   */
  private async writeToWebDAV(key: string, data: any): Promise<void> {
    const config = this.config!.webdav
    if (!config) throw new Error('WebDAV 未配置')

    const url = `${config.url}${config.dataPath}${key}.json`
    const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')

    const fullData = {
      _meta: {
        version: (await db.syncVersion.findUnique({ where: { dataKey: key } }))?.version || 1,
        updatedAt: Date.now(),
        source: 'yuanju-cloud-sync',
      },
      data,
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullData, null, 2),
    })

    if (!res.ok) {
      throw new Error(`WebDAV 写入失败: HTTP ${res.status}`)
    }
  }

  private async readFromWebDAV(key: string): Promise<SyncResult> {
    const config = this.config!.webdav
    if (!config) {
      return { success: false, source: 'webdav', error: '未配置', timestamp: Date.now() }
    }

    try {
      const url = `${config.url}${config.dataPath}${key}.json`
      const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      })

      if (!res.ok) {
        return { success: false, source: 'webdav', error: `HTTP ${res.status}`, timestamp: Date.now() }
      }

      const parsed = await res.json()
      const version = parsed._meta?.version || 0
      const data = parsed._meta ? parsed.data : parsed

      return { success: true, source: 'webdav', data, timestamp: Date.now(), version }
    } catch (error: any) {
      return { success: false, source: 'webdav', error: error.message, timestamp: Date.now() }
    }
  }

  /**
   * 从志愿者节点读取数据
   */
  private async readFromVolunteers(key: string): Promise<SyncResult> {
    const nodes = this.config?.volunteerNodes || []
    const activeNodes = nodes.filter(n => n.status === 'active')

    const results = await Promise.allSettled(
      activeNodes.map(async (node) => {
        const res = await fetch(`${node.url}/api/cloud/data/${key}`, {
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        return {
          success: true,
          source: 'volunteer',
          data: result.value,
          timestamp: Date.now(),
        }
      }
    }

    return { success: false, source: 'volunteer', error: '所有节点不可用', timestamp: Date.now() }
  }

  /**
   * 计算数据校验和（简易版）
   */
  private checksum(data: any): string {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
      this.syncIntervalId = null
    }
  }
}

// ============================================
// 全局单例
// ============================================

let instance: CloudSyncManager | null = null

export function getCloudSync(): CloudSyncManager {
  if (!instance) {
    instance = new CloudSyncManager()
  }
  return instance
}

export { CloudSyncManager }
