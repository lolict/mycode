import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDexiModule } from '@/lib/dexi-registry'

// GET /api/dexi/records?moduleCode=xxx - 获取模块记录
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleCode = searchParams.get('moduleCode')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')

    if (!moduleCode) {
      return NextResponse.json({ error: '缺少moduleCode参数' }, { status: 400 })
    }

    const where: any = { moduleCode }
    if (status) where.status = status

    const [records, total] = await Promise.all([
      db.dexiRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.dexiRecord.count({ where }),
    ])

    return NextResponse.json({
      records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }
    })
  } catch (error) {
    console.error('获取记录失败:', error)
    return NextResponse.json({ error: '获取记录失败' }, { status: 500 })
  }
}

// POST /api/dexi/records - 创建记录
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { moduleCode, title, content, value, userId } = body

    if (!moduleCode || !title) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const moduleDef = getDexiModule(moduleCode)
    if (!moduleDef) {
      return NextResponse.json({ error: '模块不存在' }, { status: 404 })
    }

    // 确保模块存在于数据库中
    let dbModule = await db.dexiModule.findUnique({ where: { code: moduleCode } })
    if (!dbModule) {
      dbModule = await db.dexiModule.create({
        data: {
          code: moduleDef.code,
          name: moduleDef.name,
          fullName: moduleDef.fullName,
          category: moduleDef.category,
          description: moduleDef.description,
          icon: moduleDef.icon,
          color: moduleDef.color,
          features: JSON.stringify(moduleDef.features),
          status: moduleDef.status,
          priority: moduleDef.priority,
        }
      })
    }

    // 计算德值（基于模块类型和内容）
    const calculatedValue = value || calculateDexiValue(moduleCode, content)

    const record = await db.dexiRecord.create({
      data: {
        moduleCode,
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        value: calculatedValue,
        userId: userId || null,
        status: 'active',
      }
    })

    return NextResponse.json({ record, value: calculatedValue }, { status: 201 })
  } catch (error) {
    console.error('创建记录失败:', error)
    return NextResponse.json({ error: '创建记录失败' }, { status: 500 })
  }
}

// 基于模块类型计算德值
function calculateDexiValue(moduleCode: string, content: any): number {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content)
  const contentLen = contentStr.length

  // 基础德值 5-50，根据内容丰富度和模块类型计算
  const baseValue = Math.min(50, Math.max(5, Math.floor(contentLen / 10)))

  // 模块类型加成
  const typeBonus: Record<string, number> = {
    deji: 15,      // 急救加成
    deyuan: 12,    // 救援加成
    dejuan: 10,    // 捐赠加成
    degong: 10,    // 贡献加成
    dejing2: 8,    // 荣誉加成
    defang: 8,     // 家访加成
    dezhen: 8,     // 诊断加成
    dexie: 6,      // 协调加成
    dejiao: 6,     // 教育加成
    dechuang: 6,   // 创业加成
  }

  const bonus = typeBonus[moduleCode] || 5
  return Math.min(100, baseValue + bonus)
}
