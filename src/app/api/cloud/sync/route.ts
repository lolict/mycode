import { NextRequest, NextResponse } from 'next/server'
import { getCloudSync, type CloudSyncConfig } from '@/core/v2/cloud'

/**
 * 云端同步配置 API
 *
 * POST /api/cloud/sync — 保存配置
 * GET  /api/cloud/sync — 获取当前配置和状态
 * POST /api/cloud/sync?action=sync — 手动触发同步
 * POST /api/cloud/sync?action=write — 写入数据
 * GET  /api/cloud/sync?key=xxx — 读取数据
 */

// 内存中的配置（生产环境应持久化到数据库）
let savedConfig: CloudSyncConfig | null = null

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  const cloud = getCloudSync()

  // 如果有 key 参数，读取数据
  if (key) {
    const result = await cloud.read(key)
    return NextResponse.json(result)
  }

  // 否则返回配置和状态
  const config = cloud.getConfig()
  const status = cloud.getStatus()

  return NextResponse.json({
    configured: !!config,
    status,
    // 脱敏：不返回token等敏感信息
    configInfo: config ? {
      primary: config.syncStrategy?.primary || 'none',
      hasGithub: !!config.github?.token,
      hasGitee: !!config.gitee?.token,
      hasWebdav: !!config.webdav?.password,
      volunteerNodeCount: config.volunteerNodes?.length || 0,
    } : null,
  })
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const cloud = getCloudSync()

  // 手动触发同步
  if (action === 'sync') {
    const result = await cloud.sync()
    return NextResponse.json(result)
  }

  // 写入数据
  if (action === 'write') {
    const body = await request.json()
    const { key, data } = body

    if (!key) {
      return NextResponse.json({ error: '缺少 key 参数' }, { status: 400 })
    }

    await cloud.write(key, data)
    return NextResponse.json({ success: true, key })
  }

  // 保存配置
  const body = await request.json() as CloudSyncConfig

  // 验证配置
  if (body.github && (!body.github.token || !body.github.owner || !body.github.repo)) {
    return NextResponse.json({ error: 'GitHub 配置不完整' }, { status: 400 })
  }

  if (body.webdav && (!body.webdav.url || !body.webdav.username || !body.webdav.password)) {
    return NextResponse.json({ error: 'WebDAV 配置不完整' }, { status: 400 })
  }

  // 设置默认同步策略
  if (!body.syncStrategy) {
    body.syncStrategy = {
      primary: body.github ? 'github' : body.webdav ? 'webdav' : 'volunteer',
      backup: body.webdav ? ['webdav'] : [],
      syncInterval: 30000,
      conflictResolution: 'last-write-wins',
    }
  }

  cloud.configure(body)
  savedConfig = body

  return NextResponse.json({
    success: true,
    message: '云端同步配置已保存',
    primary: body.syncStrategy.primary,
  })
}
