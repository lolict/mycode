import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 创建组织单元
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, unitType, parentUnitId, description } = body

    if (!name || !unitType) {
      return NextResponse.json(
        { error: '缺少必填字段：name, unitType' },
        { status: 400 }
      )
    }

    const validTypes = ['group', 'squad', 'battalion']
    if (!validTypes.includes(unitType)) {
      return NextResponse.json(
        { error: `无效的组织类型，有效类型：${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // 检查组织成员限制
    // 组(group): 1残+6健全=7人
    // 班(squad): 6+36+6=48人
    const maxMembers = unitType === 'group' ? 7 : unitType === 'squad' ? 48 : 336

    const unit = await db.organizationUnit.create({
      data: {
        name,
        unitType,
        parentUnitId: parentUnitId || null,
        description: description || null,
        status: 'forming'
      }
    })

    return NextResponse.json({
      unit,
      maxMembers,
      message: `${name} 组织单元创建成功，最多容纳 ${maxMembers} 人`
    }, { status: 201 })
  } catch (error) {
    console.error('创建组织单元失败:', error)
    return NextResponse.json(
      { error: '创建组织单元失败' },
      { status: 500 }
    )
  }
}

// 获取组织列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unitType = searchParams.get('unitType')
    const status = searchParams.get('status')

    const where: any = {}
    if (unitType) where.unitType = unitType
    if (status) where.status = status

    const units = await db.organizationUnit.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, email: true }
            }
          }
        },
        childUnits: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // 为每个单元计算统计信息
    const unitsWithStats = units.map(unit => {
      const disabledCount = unit.members.filter(m => m.isDisabled).length
      const ableCount = unit.members.filter(m => !m.isDisabled).length
      const maxMembers = unit.unitType === 'group' ? 7 : unit.unitType === 'squad' ? 48 : 336

      return {
        ...unit,
        disabledCount,
        ableCount,
        maxMembers,
        fillRate: Math.round((unit.members.length / maxMembers) * 100)
      }
    })

    return NextResponse.json({ units: unitsWithStats })
  } catch (error) {
    console.error('获取组织列表失败:', error)
    return NextResponse.json(
      { error: '获取组织列表失败' },
      { status: 500 }
    )
  }
}

// 加入组织
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, unitId, role, isDisabled, disabilityType, disabilityLevel } = body

    if (!userId || !unitId) {
      return NextResponse.json(
        { error: '缺少必填字段：userId, unitId' },
        { status: 400 }
      )
    }

    // 检查组织是否存在
    const unit = await db.organizationUnit.findUnique({
      where: { id: unitId },
      include: { members: true }
    })

    if (!unit) {
      return NextResponse.json(
        { error: '组织单元不存在' },
        { status: 404 }
      )
    }

    // 检查是否已在组织中
    const existingMember = unit.members.find(m => m.userId === userId)
    if (existingMember) {
      return NextResponse.json(
        { error: '您已在此组织中' },
        { status: 400 }
      )
    }

    // 检查人数限制
    const maxMembers = unit.unitType === 'group' ? 7 : unit.unitType === 'squad' ? 48 : 336
    if (unit.members.length >= maxMembers) {
      return NextResponse.json(
        { error: `组织已满（${maxMembers}人）` },
        { status: 400 }
      )
    }

    // 检查残疾人数量限制（组：最多1人，班：最多6人）
    const disabledCount = unit.members.filter(m => m.isDisabled).length
    const maxDisabled = unit.unitType === 'group' ? 1 : unit.unitType === 'squad' ? 6 : 36
    if (isDisabled && disabledCount >= maxDisabled) {
      return NextResponse.json(
        { error: `残疾人名额已满（${maxDisabled}人）` },
        { status: 400 }
      )
    }

    // 计算残疾人优先级分数
    let disabilityPriorityScore = 0
    if (isDisabled) {
      // 一级最重=100分，二级=75，三级=50，四级=25
      const levelScores: Record<string, number> = {
        '一级': 100, '二级': 75, '三级': 50, '四级': 25
      }
      disabilityPriorityScore = levelScores[disabilityLevel || '四级'] || 25
    }

    // 加入组织
    const member = await db.organizationMember.create({
      data: {
        userId,
        organizationUnitId: unitId,
        role: role || (isDisabled ? 'disabled' : 'able'),
        isDisabled: isDisabled || false,
        disabilityType: disabilityType || null,
        disabilityLevel: disabilityLevel || null
      }
    })

    // 更新组织的残疾人优先级（取最高值）
    if (isDisabled) {
      const currentMaxPriority = unit.disabilityPriorityScore || 0
      await db.organizationUnit.update({
        where: { id: unitId },
        data: {
          disabilityPriorityScore: Math.max(currentMaxPriority, disabilityPriorityScore),
          status: unit.members.length + 1 >= maxMembers ? 'active' : 'forming'
        }
      })
    } else {
      // 检查是否已满员
      await db.organizationUnit.update({
        where: { id: unitId },
        data: {
          status: unit.members.length + 1 >= maxMembers ? 'active' : 'forming'
        }
      })
    }

    return NextResponse.json({
      member,
      message: `成功加入 ${unit.name}`
    })
  } catch (error) {
    console.error('加入组织失败:', error)
    return NextResponse.json(
      { error: '加入组织失败' },
      { status: 500 }
    )
  }
}
