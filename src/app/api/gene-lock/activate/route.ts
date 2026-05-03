import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

// POST /api/gene-lock/activate - 激活基因锁
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      holderType, holderId,
      destinyCommunity, disabledAbleCommunity, loveCommunity, laborCommunity,
      heartScaleScore, loyaltyScore, kindnessProof,
      agreedToTerms
    } = body

    if (!holderType || !holderId) {
      return NextResponse.json({ error: '缺少holderType或holderId' }, { status: 400 })
    }

    // 必须认同基因锁十二条纲领
    if (!agreedToTerms) {
      return NextResponse.json({
        error: '必须认同基因锁十二条纲领才能激活基因锁',
        termsRequired: true
      }, { status: 403 })
    }

    // 四大共同体必须全部认同
    if (!destinyCommunity || !disabledAbleCommunity || !loveCommunity || !laborCommunity) {
      return NextResponse.json({
        error: '四大共同体认同缺一不可：命运共同体、残健共同体、爱的共同体、劳动共享共同体',
        missingCommunities: {
          destinyCommunity: !!destinyCommunity,
          disabledAbleCommunity: !!disabledAbleCommunity,
          loveCommunity: !!loveCommunity,
          laborCommunity: !!laborCommunity
        }
      }, { status: 403 })
    }

    // 检查是否已存在
    const existing = await prisma.geneLockRecord.findFirst({
      where: { holderType, holderId }
    })

    if (existing && existing.status === 'active') {
      return NextResponse.json({
        error: '基因锁已激活',
        geneLock: existing
      }, { status: 409 })
    }

    // 生成激活密钥
    const activationKey = randomBytes(16).toString('hex')

    const geneLock = await prisma.geneLockRecord.upsert({
      where: { id: existing?.id || 'nonexistent' },
      create: {
        holderType,
        holderId,
        destinyCommunity,
        disabledAbleCommunity,
        loveCommunity,
        laborCommunity,
        heartScaleScore: heartScaleScore || 60,
        loyaltyScore: loyaltyScore || 60,
        kindnessProof,
        status: 'active',
        activationKey,
        activatedAt: new Date(),
        agreedToTerms: true,
      },
      update: {
        destinyCommunity,
        disabledAbleCommunity,
        loveCommunity,
        laborCommunity,
        heartScaleScore: heartScaleScore || 60,
        loyaltyScore: loyaltyScore || 60,
        kindnessProof,
        status: 'active',
        activationKey,
        activatedAt: new Date(),
        agreedToTerms: true,
      }
    })

    return NextResponse.json({
      success: true,
      geneLock: {
        id: geneLock.id,
        status: geneLock.status,
        activatedAt: geneLock.activatedAt,
        communities: {
          destinyCommunity: geneLock.destinyCommunity,
          disabledAbleCommunity: geneLock.disabledAbleCommunity,
          loveCommunity: geneLock.loveCommunity,
          laborCommunity: geneLock.laborCommunity
        }
      }
    })
  } catch (error) {
    console.error('激活基因锁失败:', error)
    return NextResponse.json({ error: '激活基因锁失败' }, { status: 500 })
  }
}
