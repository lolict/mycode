/**
 * 云端同步系统 - Cloud Sync System
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
 * - 写数据 → GitHub主存 + WebDAV备份
 * - 读数据 → 本地缓存 → GitHub → WebDAV → 志愿者节点
 * - 实时通信 → P2P直连 → 志愿者节点中转
 * - 离线可用 → 本地SQLite优先
 */

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
    url: string      // 例如 https://dav.jianguoyun.com/dav/
    username: string
    password: string  // 坚果云用应用专用密码
    dataPath: string  // 例如 /yuanju-data/
  }
  /** 志愿者节点列表 */
  volunteerNodes?: Array<{
    name: string
    url: string       // 例如 https://volunteer1.example.com
    status: 'active' | 'offline' | 'unknown'
    lastPing?: number
    providedBy: string  // 志愿者名称
  }>
  /** 同步策略 */
  syncStrategy?: {
    /** 主通道（默认 github） */
    primary: 'github' | 'gitee' | 'webdav' | 'volunteer'
    /** 备份通道 */
    backup: ('github' | 'gitee' | 'webdav')[]
    /** 同步间隔（毫秒，默认30000=30秒） */
    syncInterval: number
    /** 冲突解决策略 */
    conflictResolution: 'last-write-wins' | 'manual'
  }
}

export interface SyncResult {
  success: boolean
  source: string
  data?: any
  error?: string
  timestamp: number
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
}

// ============================================
// 同步状态管理
// ============================================

class CloudSyncManager {
  private config: CloudSyncConfig | null = null
  private syncIntervalId: NodeJS.Timeout | null = null
  private pendingWrites: Map<string, any> = new Map()
  private localCache: Map<string, { data: any; timestamp: number }> = new Map()

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
  }

  /**
   * 获取当前配置
   */
  getConfig(): CloudSyncConfig | null {
    return this.config
  }

  /**
   * 写入数据 — 先写本地，再异步同步到云端
   * 就像先在草稿纸上写，再抄到正式本上
   */
  async write(key: string, data: any): Promise<void> {
    // 1. 写入本地缓存（立即生效）
    this.localCache.set(key, { data, timestamp: Date.now() })

    // 2. 加入待同步队列
    this.pendingWrites.set(key, data)

    // 3. 异步同步到云端
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
      }
    }

    // 2. 查主通道
    if (this.config) {
      const primary = this.config.syncStrategy?.primary || 'github'
      const result = await this.readFromChannel(key, primary)
      if (result.success) {
        this.localCache.set(key, { data: result.data, timestamp: Date.now() })
        return result
      }

      // 3. 主通道失败，查备份通道
      const backups = this.config.syncStrategy?.backup || []
      for (const backup of backups) {
        const backupResult = await this.readFromChannel(key, backup)
        if (backupResult.success) {
          this.localCache.set(key, { data: backupResult.data, timestamp: Date.now() })
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
   * 手动触发全量同步
   */
  async sync(): Promise<{ pushed: number; pulled: number; errors: string[] }> {
    const errors: string[] = []
    let pushed = 0
    let pulled = 0

    // 推送待写入的数据
    for (const [key, data] of this.pendingWrites) {
      try {
        await this.syncKey(key, data)
        pushed++
      } catch (e: any) {
        errors.push(`推送 ${key} 失败: ${e.message}`)
      }
    }

    // 拉取远端更新
    // TODO: 实现增量拉取

    return { pushed, pulled, errors }
  }

  /**
   * 获取同步状态
   */
  getStatus(): SyncStatus {
    return {
      primary: {
        type: this.config?.syncStrategy?.primary || 'none',
        connected: false, // TODO: 实际检测
        lastSync: null,
      },
      backup: (this.config?.syncStrategy?.backup || []).map(type => ({
        type,
        connected: false,
        lastSync: null,
      })),
      pendingChanges: this.pendingWrites.size,
      isSyncing: false,
    }
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
    } catch {
      // 主通道失败，尝试备份
    }

    // 写备份通道
    for (const backup of backups) {
      try {
        await this.writeToChannel(key, data, backup)
      } catch {
        // 备份失败不影响
      }
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
   *
   * 原理：把JSON数据存到仓库的 data/ 目录下
   * - 读取：GET /repos/{owner}/{repo}/contents/data/{key}.json
   * - 写入：PUT /repos/{owner}/{repo}/contents/data/{key}.json
   */
  private async writeToGitHub(key: string, data: any, platform: 'github' | 'gitee'): Promise<void> {
    const config = platform === 'github' ? this.config!.github : this.config!.gitee
    if (!config) throw new Error(`${platform} 未配置`)

    const baseUrl = platform === 'github'
      ? 'https://api.github.com'
      : 'https://gitee.com/api/v5'

    const path = `${config.dataPath}${key}.json`
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')

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
      const content = JSON.parse(Buffer.from(fileInfo.content, 'base64').toString('utf-8'))

      return {
        success: true,
        source: platform,
        data: content,
        timestamp: Date.now(),
      }
    } catch (error: any) {
      return { success: false, source: platform, error: error.message, timestamp: Date.now() }
    }
  }

  /**
   * WebDAV 读写 — 网盘即服务器
   *
   * 坚果云 WebDAV：
   * - 地址：https://dav.jianguoyun.com/dav/
   * - 用户名：坚果云账号
   * - 密码：应用专用密码（在坚果云安全设置中生成）
   *
   * 其他支持 WebDAV 的网盘：
   * - Koofr: https://app.koofr.net/dav/
   * - Nextcloud: 各实例不同
   * - Box.com: https://dav.box.com/dav/
   */
  private async writeToWebDAV(key: string, data: any): Promise<void> {
    const config = this.config!.webdav
    if (!config) throw new Error('WebDAV 未配置')

    const url = `${config.url}${config.dataPath}${key}.json`
    const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data, null, 2),
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

      const data = await res.json()
      return { success: true, source: 'webdav', data, timestamp: Date.now() }
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

    // 并行请求所有活跃节点，谁先返回用谁
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
