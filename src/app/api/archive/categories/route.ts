import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// GET /api/archive/categories - List all categories (hierarchical)
export async function GET() {
  try {
    const categories = await prisma.archiveCategory.findMany({
      include: {
        childCategories: {
          include: {
            _count: { select: { archives: true } }
          }
        },
        _count: { select: { archives: true } }
      },
      where: { parentCategoryId: null },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 })
  }
}

// POST /api/archive/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, color, layer = 'application', sortOrder = 0, parentCategoryId } = body

    if (!name) {
      return NextResponse.json({ error: '分类名称为必填项' }, { status: 400 })
    }

    const category = await prisma.archiveCategory.create({
      data: {
        name,
        description,
        icon,
        color,
        layer,
        sortOrder,
        parentCategoryId
      },
      include: {
        childCategories: true,
        _count: { select: { archives: true } }
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('创建分类失败:', error)
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 })
  }
}
