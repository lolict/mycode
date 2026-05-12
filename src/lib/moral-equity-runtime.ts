/**
 * 道德股权运行时引擎 (Moral Equity Runtime Engine)
 *
 * 串联整条链路：
 * 完成道德任务 → 五德评分更新 → 多巴胺分泌 → 神经信号广播 → 插板联动
 *
 * 这是平台的"灵魂引擎"，让道德不再是静态数据，
 * 而是活生生的、会成长的、会影响整个系统的力量。
 */

import { getNervousSystem } from '@/core/v2/nervous'
import { getDopamineEngine, type MoralAction } from '@/core/v2/dopamine'
import { MORAL_TASKS, VIRTUE_LABELS, calculateEquityLevel, type VirtueCategory } from '@/lib/moral-equity-tasks'
import { getPlugBoardNeuralBridge, PLUGBOARD_CHANNELS } from '@/lib/plugboard-neural-bridge'

// ============================================
// 运行时状态
// ============================================

export interface UserMoralState {
  userId: string
  virtues: Record<VirtueCategory, number>
  totalScore: number
  equityLevel: string
  completedTasks: CompletedTask[]
  streaks: Record<string, number>   // 连续完成天数
  lastActionTime: number
}

export interface CompletedTask {
  taskCode: string
  completedAt: number
  pointsEarned: number
  virtueImproved: VirtueCategory
  evidence?: string
}

export interface MoralEquityEvent {
  type: 'task_completed' | 'level_up' | 'streak_milestone' | 'virtue_breakthrough'
  userId: string
  data: Record<string, unknown>
  timestamp: number
}

// ============================================
// 道德股权运行时引擎
// ============================================

class MoralEquityRuntime {
  private userStates: Map<string, UserMoralState> = new Map()
  private events: MoralEquityEvent[] = []
  private initialized = false

  /**
   * 初始化 — 接入神经系统
   */
  init(): void {
    if (this.initialized) return

    getNervousSystem().plugIn({
      id: 'moral-equity-runtime',
      name: '道德股权运行时',
      type: 'organ',
      channels: [
        'action:donate',
        'action:create',
        'action:help',
        'action:share',
        'action:volunteer',
        'action:complete',
        'dopamine:released',
        PLUGBOARD_CHANNELS.PLUG_CONNECTED,
        PLUGBOARD_CHANNELS.NEURAL_ACTIVATED,
      ],
      onSignal: (signal) => this.handleSignal(signal),
      status: 'active',
    })

    this.initialized = true
  }

  /**
   * 处理神经信号
   */
  private handleSignal(signal: any): void {
    switch (signal.channel) {
      case 'action:complete':
        // 行为完成信号可能对应某个道德任务
        if (signal.payload?.taskCode) {
          this.completeTask(signal.payload.userId, signal.payload.taskCode, signal.payload.evidence)
        }
        break
      case PLUGBOARD_CHANNELS.NEURAL_ACTIVATED:
        // 神经节点激活时，检查是否触发道德任务
        if (signal.payload?.nodeCode === 'neural_actuator') {
          // 执行器节点激活 = 完成了某个善行
          this.onNeuralDrivenAction(signal.payload)
        }
        break
    }
  }

  // ============================================
  // 核心：完成道德任务
  // ============================================

  /**
   * 完成道德任务 — 核心链路入口
   *
   * 1. 记录完成
   * 2. 更新五德评分
   * 3. 触发多巴胺
   * 4. 广播神经信号
   * 5. 检查等级提升
   * 6. 通知插板系统
   */
  completeTask(userId: string, taskCode: string, evidence?: string): {
    success: boolean
    pointsEarned: number
    newScore: number
    levelUp: boolean
    newLevel?: string
  } {
    const task = MORAL_TASKS.find(t => t.code === taskCode)
    if (!task) {
      return { success: false, pointsEarned: 0, newScore: 0, levelUp: false }
    }

    // 获取或创建用户状态
    const state = this.getOrCreateState(userId)
    const oldLevel = state.equityLevel
    const oldVirtueScore = state.virtues[task.virtue]

    // 1. 记录完成
    const completedTask: CompletedTask = {
      taskCode: task.code,
      completedAt: Date.now(),
      pointsEarned: task.points,
      virtueImproved: task.virtue,
      evidence,
    }
    state.completedTasks.push(completedTask)

    // 2. 更新五德评分
    state.virtues[task.virtue] += task.points
    state.totalScore = Object.values(state.virtues).reduce((sum, v) => sum + v, 0)
    state.lastActionTime = Date.now()

    // 更新连续天数
    const today = new Date().toDateString()
    const streakKey = `${task.frequency}_${today}`
    state.streaks[streakKey] = (state.streaks[streakKey] || 0) + 1

    // 3. 检查等级提升
    const newLevel = calculateEquityLevel(state.totalScore)
    state.equityLevel = newLevel
    const levelUp = newLevel !== oldLevel

    // 4. 触发多巴胺引擎
    const action: MoralAction = {
      type: this.mapVirtueToAction(task.virtue),
      description: `完成道德任务: ${task.name}`,
      userId,
      targetId: taskCode,
      data: {
        taskCode,
        virtue: task.virtue,
        points: task.points,
        frequency: task.frequency,
      },
      timestamp: Date.now(),
    }
    const dopamineRecord = getDopamineEngine().release(action)

    // 5. 广播神经信号 — 道德评分更新
    getNervousSystem().emit({
      channel: 'moral:score-updated',
      from: 'moral-equity-runtime',
      payload: {
        userId,
        oldScores: { [task.virtue]: oldVirtueScore },
        newScores: { [task.virtue]: state.virtues[task.virtue] },
        totalScore: state.totalScore,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
        taskCode,
      },
      priority: 7,
    })

    // 6. 通知插板-神经联动引擎
    const bridge = getPlugBoardNeuralBridge()
    bridge.notifyPlugUpdated({
      plugCode: 'vocab_value_unit',
      plugType: 'vocab',
      field: 'value',
      oldValue: oldVirtueScore,
      newValue: state.virtues[task.virtue],
    })

    // 7. 记录事件
    this.recordEvent('task_completed', userId, {
      taskCode,
      virtue: task.virtue,
      points: task.points,
    })

    if (levelUp) {
      this.recordEvent('level_up', userId, {
        oldLevel,
        newLevel,
        totalScore: state.totalScore,
      })

      // 等级提升是重大事件，高优先级广播
      getNervousSystem().emit({
        channel: 'moral:level-up',
        from: 'moral-equity-runtime',
        payload: {
          userId,
          oldLevel,
          newLevel,
          totalScore: state.totalScore,
        },
        priority: 9,
      })
    }

    // 检查连续性里程碑
    this.checkStreakMilestones(userId, state)

    return {
      success: true,
      pointsEarned: task.points,
      newScore: state.totalScore,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
    }
  }

  /**
   * 神经驱动的善行 — 从神经网络自动触发的道德任务
   */
  private onNeuralDrivenAction(payload: any): void {
    // 当执行器神经节点被激活，可以自动完成对应的道德任务
    if (payload.activatedBy === 'dopamine') {
      // 多巴胺驱动的行为，可能是"每日一善"
      const userId = payload.userId || 'system'
      this.completeTask(userId, 'MORAL-BENE-001', 'neural-driven')
    }
  }

  // ============================================
  // 查询接口
  // ============================================

  getUserState(userId: string): UserMoralState | undefined {
    return this.userStates.get(userId)
  }

  getAllStates(): UserMoralState[] {
    return Array.from(this.userStates.values())
  }

  getLeaderboard(limit = 10): Array<{
    userId: string
    totalScore: number
    equityLevel: string
    taskCount: number
  }> {
    return this.getAllStates()
      .map(s => ({
        userId: s.userId,
        totalScore: s.totalScore,
        equityLevel: s.equityLevel,
        taskCount: s.completedTasks.length,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
  }

  getVirtueBreakdown(userId: string): Record<VirtueCategory, { score: number; label: string; percentage: number }> {
    const state = this.userStates.get(userId)
    if (!state) {
      return Object.fromEntries(
        Object.entries(VIRTUE_LABELS).map(([key, val]) => [key, { score: 0, label: val.name, percentage: 0 }])
      ) as any
    }

    const maxPossible = 500 // 假设每维最高500分
    return Object.fromEntries(
      Object.entries(VIRTUE_LABELS).map(([key, val]) => [
        key,
        {
          score: state.virtues[key as VirtueCategory] || 0,
          label: val.name,
          percentage: Math.min(100, ((state.virtues[key as VirtueCategory] || 0) / maxPossible) * 100),
        },
      ])
    ) as any
  }

  getRecentEvents(limit = 20): MoralEquityEvent[] {
    return this.events.slice(-limit)
  }

  getStatus() {
    return {
      initialized: this.initialized,
      totalUsers: this.userStates.size,
      totalEvents: this.events.length,
      totalTasksCompleted: Array.from(this.userStates.values())
        .reduce((sum, s) => sum + s.completedTasks.length, 0),
      levelDistribution: this.getLevelDistribution(),
    }
  }

  getLevelDistribution(): Record<string, number> {
    const dist: Record<string, number> = { citizen: 0, scholar: 0, sage: 0, saint: 0 }
    for (const state of this.userStates.values()) {
      dist[state.equityLevel] = (dist[state.equityLevel] || 0) + 1
    }
    return dist
  }

  // ============================================
  // 内部方法
  // ============================================

  private getOrCreateState(userId: string): UserMoralState {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        userId,
        virtues: {
          benevolence: 0,
          righteousness: 0,
          propriety: 0,
          wisdom: 0,
          trust: 0,
        },
        totalScore: 0,
        equityLevel: 'citizen',
        completedTasks: [],
        streaks: {},
        lastActionTime: 0,
      })
    }
    return this.userStates.get(userId)!
  }

  private mapVirtueToAction(virtue: VirtueCategory): MoralAction['type'] {
    const map: Record<VirtueCategory, MoralAction['type']> = {
      benevolence: 'help',
      righteousness: 'verify',
      propriety: 'comment',
      wisdom: 'share',
      trust: 'volunteer',
    }
    return map[virtue] || 'help'
  }

  private checkStreakMilestones(userId: string, state: UserMoralState): void {
    const dailyKey = `daily_${new Date().toDateString()}`
    const dailyCount = state.streaks[dailyKey] || 0

    const milestones = [3, 7, 14, 30, 100]
    for (const milestone of milestones) {
      if (dailyCount === milestone) {
        this.recordEvent('streak_milestone', userId, {
          days: milestone,
          type: 'daily',
        })

        getNervousSystem().emit({
          channel: 'moral:streak-milestone',
          from: 'moral-equity-runtime',
          payload: { userId, days: milestone, type: 'daily' },
          priority: 8,
        })
      }
    }
  }

  private recordEvent(type: MoralEquityEvent['type'], userId: string, data: Record<string, unknown>): void {
    this.events.push({
      type,
      userId,
      data,
      timestamp: Date.now(),
    })

    // 保留最近1000条事件
    if (this.events.length > 1000) {
      this.events.shift()
    }
  }
}

// ============================================
// 全局单例
// ============================================

let runtimeInstance: MoralEquityRuntime | null = null

export function getMoralEquityRuntime(): MoralEquityRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new MoralEquityRuntime()
  }
  return runtimeInstance
}

// ============================================
// React Hook
// ============================================

export function useMoralEquityRuntime() {
  const runtime = getMoralEquityRuntime()

  return {
    init: () => runtime.init(),
    completeTask: (userId: string, taskCode: string, evidence?: string) =>
      runtime.completeTask(userId, taskCode, evidence),
    getUserState: (userId: string) => runtime.getUserState(userId),
    getLeaderboard: (limit?: number) => runtime.getLeaderboard(limit),
    getVirtueBreakdown: (userId: string) => runtime.getVirtueBreakdown(userId),
    getRecentEvents: (limit?: number) => runtime.getRecentEvents(limit),
    getStatus: () => runtime.getStatus(),
  }
}
