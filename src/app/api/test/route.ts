import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // 测试数据库连接
    const projectCount = await db.project.count()
    const userCount = await db.user.count()
    
    // 获取第一个项目作为测试
    const firstProject = await db.project.findFirst({
      include: {
        creator: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        projectCount,
        userCount,
        firstProject: firstProject ? {
          id: firstProject.id,
          title: firstProject.title,
          status: firstProject.status,
          currentAmount: firstProject.currentAmount,
          targetAmount: firstProject.targetAmount
        } : null
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}