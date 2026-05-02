/**
 * 正确奖励器容器
 * 正向反馈机制，强化正确行为
 */

import { RewardBoundary } from './boundary'
import { RewardAmplifier } from './amplifier'
import { RewardDistributor } from './distributor'

export class RewardContainer {
  private static instance: RewardContainer
  private boundary: RewardBoundary
  private amplifier: RewardAmplifier
  private distributor: RewardDistributor

  private constructor() {
    this.boundary = new RewardBoundary()
    this.amplifier = new RewardAmplifier()
    this.distributor = new RewardDistributor()
  }

  static getInstance(): RewardContainer {
    if (!RewardContainer.instance) {
      RewardContainer.instance = new RewardContainer()
    }
    return RewardContainer.instance
  }

  /**
   * 奖励成功执行
   */
  async reward<T>(
    fn: () => Promise<T> | T,
    context: string,
    options: {
      multiplier?: number
      share?: boolean
      persist?: boolean
    } = {}
  ): Promise<T | null> {
    return this.boundary.enhance(async () => {
      const result = await fn()
      
      if (result !== null && result !== undefined) {
        const reward = this.amplifier.calculate(result, context, options)
        await this.distributor.distribute(reward)
      }
      
      return result
    }, context)
  }

  /**
   * 创建奖励区域
   */
  createRewardZone(zoneId: string, rules: RewardRule[]) {
    return this.boundary.createZone(zoneId, rules)
  }

  /**
   * 获取奖励统计
   */
  getStats() {
    return {
      boundaries: this.boundary.getStats(),
      amplifiers: this.amplifier.getStats(),
      distributors: this.distributor.getStats()
    }
  }
}

interface RewardRule {
  condition: (result: any) => boolean
  multiplier: number
  type: 'success' | 'performance' | 'quality'
}