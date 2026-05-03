import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

// POST /api/gene-lock/verify - 验证基因锁
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { holderType, holderId, appId } = body

    // 验证用户的基因锁
    if (holderType === 'user' && holderId) {
      const geneLock = await prisma.geneLockRecord.findFirst({
        where: { holderType: 'user', holderId, status: 'active' }
      })

      if (!geneLock) {
        return NextResponse.json({
          valid: false,
          reason: '未激活基因锁',
          details: '您尚未完成基因锁激活，无法使用此功能。请先完成四大共同体认同和心性天平考核。'
        })
      }

      // 检查四大共同体认同
      const communities = {
        destinyCommunity: geneLock.destinyCommunity,
        disabledAbleCommunity: geneLock.disabledAbleCommunity,
        loveCommunity: geneLock.loveCommunity,
        laborCommunity: geneLock.laborCommunity
      }

      const missingCommunities = Object.entries(communities)
        .filter(([_, v]) => !v)
        .map(([k]) => {
          const names: Record<string, string> = {
            destinyCommunity: '命运共同体',
            disabledAbleCommunity: '残健共同体',
            loveCommunity: '爱的共同体',
            laborCommunity: '劳动共享共同体'
          }
          return names[k] || k
        })

      if (missingCommunities.length > 0) {
        return NextResponse.json({
          valid: false,
          reason: '共同体认同不完整',
          details: `您还缺少以下共同体认同：${missingCommunities.join('、')}。四大共同体认同缺一不可。`,
          missingCommunities
        })
      }

      // 检查心性天平
      if (geneLock.heartScaleScore < 60) {
        return NextResponse.json({
          valid: false,
          reason: '心性天平评分不足',
          details: `您的心性天平评分为${geneLock.heartScaleScore}分，需要达到60分才能使用此功能。`,
          heartScaleScore: geneLock.heartScaleScore
        })
      }

      // 如果指定了appId，检查道德门槛
      if (appId) {
        const app = await prisma.miniApp.findUnique({
          where: { id: appId },
          include: { geneLock: true }
        })

        if (app && app.requiresGeneLock) {
          const moralLedger = await prisma.moralLedger.findUnique({
            where: { userId: holderId }
          })

          if (moralLedger && moralLedger.compositeScore < app.minMoralScore) {
            return NextResponse.json({
              valid: false,
              reason: '道德评分不足',
              details: `此小程序需要道德评分${app.minMoralScore}分以上，您当前评分为${moralLedger.compositeScore}分。`,
              currentScore: moralLedger.compositeScore,
              requiredScore: app.minMoralScore
            })
          }
        }
      }

      return NextResponse.json({
        valid: true,
        geneLock: {
          id: geneLock.id,
          heartScaleScore: geneLock.heartScaleScore,
          loyaltyScore: geneLock.loyaltyScore,
          communities
        }
      })
    }

    // 验证小程序的基因锁
    if (holderType === 'app' && holderId) {
      const geneLock = await prisma.geneLockRecord.findFirst({
        where: { holderType: 'app', holderId, status: 'active' }
      })

      if (!geneLock) {
        return NextResponse.json({
          valid: false,
          reason: '小程序基因锁无效',
          details: '此小程序未携带共同体基因，无法在平台上运行。'
        })
      }

      return NextResponse.json({ valid: true, geneLock: { id: geneLock.id } })
    }

    // 验证节点的基因锁
    if (holderType === 'node' && holderId) {
      const geneLock = await prisma.geneLockRecord.findFirst({
        where: { holderType: 'node', holderId, status: 'active' }
      })

      if (!geneLock) {
        return NextResponse.json({
          valid: false,
          reason: '节点基因锁无效',
          details: '此节点未通过共同体基因验证，无法接入平台网络。'
        })
      }

      return NextResponse.json({ valid: true, geneLock: { id: geneLock.id } })
    }

    return NextResponse.json({ valid: false, reason: '参数不完整' }, { status: 400 })
  } catch (error) {
    console.error('基因锁验证失败:', error)
    return NextResponse.json({ error: '基因锁验证失败' }, { status: 500 })
  }
}
