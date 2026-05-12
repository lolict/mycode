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

// POST /api/dexi/records - 创建记录（联动多巴胺系统）
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

    // 计算德值（基于模块类型和内容）+ 五维评分
    const calculatedValue = value || calculateDexiValue(moduleCode, content)
    const fiveDimScore = calculateFiveDimensions(moduleCode, content)

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

    // 联动多巴胺系统 —— 善行→多巴胺分泌→持久化
    let dopamineResult = null
    try {
      dopamineResult = await triggerDopamine(moduleCode, title, calculatedValue, fiveDimScore, userId)
    } catch (e) {
      // 多巴胺联动失败不影响主流程
      console.warn('[德系→多巴胺] 联动失败:', e)
    }

    return NextResponse.json({
      record,
      value: calculatedValue,
      fiveDimensions: fiveDimScore,
      dopamine: dopamineResult,
    }, { status: 201 })
  } catch (error) {
    console.error('创建记录失败:', error)
    return NextResponse.json({ error: '创建记录失败' }, { status: 500 })
  }
}

/**
 * 德系模块→多巴胺联动
 * 在德系模块创建善行记录时，自动触发多巴胺分泌
 */
async function triggerDopamine(
  moduleCode: string,
  actionDesc: string,
  dexiValue: number,
  fiveDim: ReturnType<typeof calculateFiveDimensions>,
  userId?: string | null
) {
  // 将德系模块代码映射为多巴胺行为类型
  const actionTypeMap: Record<string, string> = {
    dejuan: 'donate',         // 德捐→捐款
    dechuang: 'create_project', // 德创→创建项目
    defang: 'volunteer',      // 德访→志愿服务
    defu2: 'help',            // 德扶→互助
    dechuan: 'share',         // 德传→分享
    dejiao: 'volunteer',      // 德教→志愿服务
    deji: 'help',             // 德急→互助
    deyuan: 'help',           // 德援→互助
    dezhen: 'help',           // 德诊→互助
    dexie: 'help',            // 德协→互助
  }

  const actionType = actionTypeMap[moduleCode] || 'help'
  const effectiveUserId = userId || 'dexi-system'

  // 持久化到多巴胺记录表
  const dopamineRecord = await db.dopamineRecord.create({
    data: {
      userId: effectiveUserId,
      actionType,
      actionDesc: `[${moduleCode}] ${actionDesc}`,
      kindness: fiveDim.kindness,
      compassion: fiveDim.compassion,
      justice: fiveDim.justice,
      dedication: fiveDim.dedication,
      severity: fiveDim.severity,
      totalScore: fiveDim.total,
      dopamineValue: dexiValue * 0.1, // 多巴胺值 = 德值 × 0.1
      actionData: JSON.stringify({ source: 'dexi', moduleCode, dexiValue }),
    }
  })

  return {
    triggered: true,
    actionType,
    dopamineValue: dopamineRecord.dopamineValue,
    recordId: dopamineRecord.id,
  }
}

/**
 * 基于德系模块类型计算五维道德评分
 */
function calculateFiveDimensions(moduleCode: string, content: any) {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content || {})
  const contentLen = contentStr.length
  const base = Math.min(60, Math.max(10, contentLen / 5))

  // 不同模块类型有不同的五维倾向（新天枰倾斜）
  const dimensionProfiles: Record<string, { kindness: number; compassion: number; justice: number; dedication: number; severity: number }> = {
    // 应急安全类：严重度↑↑ 恻隐↑
    deji:    { kindness: 60, compassion: 80, justice: 50, dedication: 70, severity: 90 },
    deyuan:  { kindness: 65, compassion: 85, justice: 55, dedication: 75, severity: 85 },
    dejing:  { kindness: 50, compassion: 60, justice: 70, dedication: 40, severity: 80 },
    deshou:  { kindness: 55, compassion: 75, justice: 60, dedication: 65, severity: 70 },
    // 医疗健康类：恻隐↑↑ 严重度↑
    dezhen:  { kindness: 70, compassion: 90, justice: 50, dedication: 65, severity: 75 },
    dewei:   { kindness: 65, compassion: 80, justice: 50, dedication: 60, severity: 60 },
    dezhao:  { kindness: 75, compassion: 85, justice: 45, dedication: 80, severity: 55 },
    // 经济金融类：善良↑ 奉献↑
    dejuan:  { kindness: 90, compassion: 70, justice: 60, dedication: 85, severity: 50 },
    dedian:  { kindness: 80, compassion: 75, justice: 55, dedication: 80, severity: 65 },
    degong:  { kindness: 85, compassion: 65, justice: 55, dedication: 90, severity: 40 },
    // 文化教育类：善良↑ 正义↑
    dejiao:  { kindness: 75, compassion: 60, justice: 70, dedication: 80, severity: 30 },
    deshu:   { kindness: 70, compassion: 55, justice: 65, dedication: 70, severity: 25 },
    dechuan: { kindness: 65, compassion: 50, justice: 60, dedication: 55, severity: 20 },
    // 治理监督类：正义↑↑
    dedu:    { kindness: 50, compassion: 45, justice: 90, dedication: 60, severity: 55 },
    depan:   { kindness: 45, compassion: 40, justice: 95, dedication: 55, severity: 50 },
    dejianji:{ kindness: 50, compassion: 45, justice: 85, dedication: 55, severity: 45 },
    // 出行物流类：奉献↑
    dedi:    { kindness: 70, compassion: 75, justice: 45, dedication: 80, severity: 40 },
    dejia:   { kindness: 65, compassion: 70, justice: 40, dedication: 85, severity: 35 },
    // 基础设施类：奉献↑ 正义↑
    dejian:  { kindness: 60, compassion: 50, justice: 75, dedication: 85, severity: 45 },
    // 创业赋能类：善良↑ 奉献↑
    dechuang:{ kindness: 75, compassion: 60, justice: 55, dedication: 85, severity: 35 },
  }

  const profile = dimensionProfiles[moduleCode] || {
    kindness: 60, compassion: 55, justice: 50, dedication: 55, severity: 40,
  }

  // 加入内容丰富度加成
  const contentBonus = Math.min(20, Math.floor(contentLen / 50))

  const kindness = Math.min(100, profile.kindness + contentBonus)
  const compassion = Math.min(100, profile.compassion + contentBonus)
  const justice = Math.min(100, profile.justice + contentBonus)
  const dedication = Math.min(100, profile.dedication + contentBonus)
  const severity = Math.min(100, profile.severity + Math.floor(contentBonus / 2))

  // 加权总分
  const total = Math.round(
    kindness * 0.30 +
    compassion * 0.25 +
    justice * 0.20 +
    dedication * 0.15 +
    severity * 0.10
  )

  return { kindness, compassion, justice, dedication, severity, total }
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
