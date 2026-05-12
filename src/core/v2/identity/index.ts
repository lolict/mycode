/**
 * 本地优先身份系统 — Local-First Identity
 *
 * 没有服务器？没问题！身份先存本地，再同步到云端。
 *
 * 原理：
 * 1. 首次访问 → 自动生成设备ID（基于随机数+时间戳）
 * 2. 身份存 SQLite → 离线也能用
 * 3. 配置云端同步后 → 身份自动同步到 GitHub/WebDAV
 * 4. 换设备？从云端拉取身份 → 合并或选择
 *
 * 这就是 D4D 的"第一滴"——身份是一切的起点。
 */

import { db } from '@/lib/db'

// ============================================
// 类型定义
// ============================================

export interface LocalIdentity {
  deviceId: string
  name: string | null
  avatar: string | null
  userType: 'disabled' | 'able-bodied'
  bio: string | null
  location: string | null
  isVerified: boolean
  createdAt: number
}

export interface IdentitySummary {
  deviceId: string
  displayName: string
  userType: string
  hasProfile: boolean
  totalDopamine: number
  totalLedgers: number
  totalDonations: number
}

// ============================================
// 设备身份管理器
// ============================================

class IdentityManager {
  private currentIdentity: LocalIdentity | null = null

  /**
   * 初始化身份 — 如果本地没有就创建
   * 就像出生：第一次打开就自动获得一个身份
   */
  async init(): Promise<LocalIdentity> {
    // 1. 先查内存缓存
    if (this.currentIdentity) return this.currentIdentity

    // 2. 查数据库
    const dbIdentity = await db.deviceIdentity.findFirst()
    if (dbIdentity) {
      this.currentIdentity = {
        deviceId: dbIdentity.deviceId,
        name: dbIdentity.name,
        avatar: dbIdentity.avatar,
        userType: dbIdentity.userType as 'disabled' | 'able-bodied',
        bio: dbIdentity.bio,
        location: dbIdentity.location,
        isVerified: dbIdentity.isVerified,
        createdAt: new Date(dbIdentity.createdAt).getTime(),
      }
      return this.currentIdentity
    }

    // 3. 创建新身份
    const newIdentity = this.generateIdentity()
    await db.deviceIdentity.create({
      data: {
        deviceId: newIdentity.deviceId,
        name: newIdentity.name,
        avatar: newIdentity.avatar,
        userType: newIdentity.userType,
        bio: newIdentity.bio,
        location: newIdentity.location,
        isVerified: newIdentity.isVerified,
      },
    })

    this.currentIdentity = newIdentity
    return newIdentity
  }

  /**
   * 获取当前身份
   */
  async getIdentity(): Promise<LocalIdentity> {
    if (this.currentIdentity) return this.currentIdentity
    return this.init()
  }

  /**
   * 获取设备ID（快速获取，不需要异步）
   */
  getDeviceId(): string {
    if (this.currentIdentity) return this.currentIdentity.deviceId
    return 'pending_init'
  }

  /**
   * 更新身份信息
   */
  async updateProfile(updates: Partial<Pick<LocalIdentity, 'name' | 'avatar' | 'userType' | 'bio' | 'location'>>): Promise<LocalIdentity> {
    const identity = await this.getIdentity()

    await db.deviceIdentity.update({
      where: { deviceId: identity.deviceId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    this.currentIdentity = {
      ...identity,
      ...updates,
    }

    return this.currentIdentity
  }

  /**
   * 验证身份（标记为已验证）
   */
  async verify(): Promise<void> {
    const identity = await this.getIdentity()
    await db.deviceIdentity.update({
      where: { deviceId: identity.deviceId },
      data: { isVerified: true },
    })
    this.currentIdentity!.isVerified = true
  }

  /**
   * 获取身份摘要 — 包含统计数据
   */
  async getIdentitySummary(): Promise<IdentitySummary> {
    const identity = await this.getIdentity()

    const [dopamineStats, ledgerCount, donationCount] = await Promise.all([
      db.dopamineRecord.aggregate({
        where: { userId: identity.deviceId },
        _sum: { dopamineValue: true },
      }),
      db.namedLedger.count({
        where: { userId: identity.deviceId },
      }),
      db.donation.count({
        where: { donorId: identity.deviceId },
      }),
    ])

    return {
      deviceId: identity.deviceId,
      displayName: identity.name || `用户${identity.deviceId.slice(-6)}`,
      userType: identity.userType,
      hasProfile: !!(identity.name || identity.bio),
      totalDopamine: dopamineStats._sum.dopamineValue || 0,
      totalLedgers: ledgerCount,
      totalDonations: donationCount,
    }
  }

  /**
   * 从云端同步身份
   */
  async syncFromCloud(cloudData: Partial<LocalIdentity>): Promise<LocalIdentity> {
    const identity = await this.getIdentity()

    const merged: LocalIdentity = {
      ...identity,
      name: cloudData.name || identity.name,
      avatar: cloudData.avatar || identity.avatar,
      bio: cloudData.bio || identity.bio,
      location: cloudData.location || identity.location,
      userType: cloudData.userType || identity.userType,
      isVerified: identity.isVerified || (cloudData.isVerified || false),
    }

    await db.deviceIdentity.update({
      where: { deviceId: identity.deviceId },
      data: {
        name: merged.name,
        avatar: merged.avatar,
        bio: merged.bio,
        location: merged.location,
        userType: merged.userType,
        isVerified: merged.isVerified,
      },
    })

    this.currentIdentity = merged
    return merged
  }

  /**
   * 生成新的设备身份
   */
  private generateIdentity(): LocalIdentity {
    const deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
    return {
      deviceId,
      name: null,
      avatar: null,
      userType: 'disabled',
      bio: null,
      location: null,
      isVerified: false,
      createdAt: Date.now(),
    }
  }
}

// ============================================
// 全局单例
// ============================================

let instance: IdentityManager | null = null

export function getIdentityManager(): IdentityManager {
  if (!instance) {
    instance = new IdentityManager()
  }
  return instance
}

export { IdentityManager }
