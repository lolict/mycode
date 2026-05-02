import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            projects: {
              where: {
                status: 'active'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // 初始化默认分类
    const defaultCategories = [
      { name: '乡村基建', description: '支持农村基础设施建设', icon: '🏗️' },
      { name: '残障创业', description: '帮助残障人士创业就业', icon: '♿' },
      { name: '教育助学', description: '资助贫困学生完成学业', icon: '📚' },
      { name: '医疗救助', description: '帮助困难家庭解决医疗问题', icon: '🏥' },
      { name: '灾害救助', description: '为自然灾害受害者提供援助', icon: '🆘' },
      { name: '环境保护', description: '支持环保公益项目', icon: '🌱' },
      { name: '文化传承', description: '保护传统文化遗产', icon: '🎭' },
      { name: '扶贫济困', description: '帮助困难群体改善生活', icon: '🤝' }
    ]

    const createdCategories = await Promise.all(
      defaultCategories.map(async (category) => {
        const existing = await db.category.findUnique({
          where: { name: category.name }
        })
        
        if (!existing) {
          return await db.category.create({
            data: category
          })
        }
        return existing
      })
    )

    return NextResponse.json(createdCategories, { status: 201 })
  } catch (error) {
    console.error('Failed to create categories:', error)
    return NextResponse.json(
      { error: 'Failed to create categories' },
      { status: 500 }
    )
  }
}