import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MORAL_TASKS, TASK_CATEGORIES, DIFFICULTY_CONFIGS, getTaskStats } from '@/lib/moral-task-registry'

// GET /api/moral-equity/tasks — 获取任务列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const userId = searchParams.get('userId')

    // 先确保任务已同步到数据库
    await syncTasksToDb()

    // 构建查询条件
    const where: any = { isActive: true }
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty

    const tasks = await db.moralTask.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    // 如果有userId，获取今日完成情况
    let completions: any[] = []
    if (userId) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      completions = await db.moralTaskCompletion.findMany({
        where: {
          userId,
          createdAt: { gte: todayStart },
          status: 'confirmed',
        },
        select: { taskId: true }
      })
    }

    const completedTaskIds = new Set(completions.map(c => c.taskId))

    // 为每个任务附加完成状态
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      completedToday: completedTaskIds.has(task.id),
      conditions: task.conditions ? JSON.parse(task.conditions) : null,
      rewards: task.rewards ? JSON.parse(task.rewards) : null,
    }))

    return NextResponse.json({
      tasks: tasksWithStatus,
      categories: TASK_CATEGORIES,
      difficulties: DIFFICULTY_CONFIGS,
      stats: getTaskStats(),
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
    return NextResponse.json({ error: '获取任务列表失败' }, { status: 500 })
  }
}

// 同步任务注册表到数据库
async function syncTasksToDb() {
  for (const task of MORAL_TASKS) {
    await db.moralTask.upsert({
      where: { code: task.code },
      update: {
        name: task.name,
        description: task.description,
        category: task.category,
        moralValue: task.moralValue,
        difficulty: task.difficulty,
        icon: task.icon || null,
        color: task.color || null,
        conditions: task.conditions || null,
        rewards: task.rewards || null,
        sortOrder: task.sortOrder,
      },
      create: {
        code: task.code,
        name: task.name,
        description: task.description,
        category: task.category,
        moralValue: task.moralValue,
        difficulty: task.difficulty,
        icon: task.icon || null,
        color: task.color || null,
        conditions: task.conditions || null,
        rewards: task.rewards || null,
        sortOrder: task.sortOrder,
      }
    })
  }
}
