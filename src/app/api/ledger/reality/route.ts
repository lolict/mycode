import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'pending'
    const realityType = searchParams.get('realityType') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    let whereClause: any = { ledgerType: 'reality' }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status !== 'all') {
      whereClause.status = status
    }

    const [realityRecords, total] = await Promise.all([
      db.namedLedger.findMany({
        where: whereClause,
        orderBy: [
          { createdAt: 'desc' },
          { status: 'asc' }
        ],
        take: pageSize,
        skip: (page - 1) * pageSize
      }),
      db.namedLedger.count({ where: whereClause })
    ])

    const realityRecordsWithDetails = realityRecords
      .map(record => {
        let specialData = null
        let tags = []
        
        try {
          if (record.specialData) {
            specialData = JSON.parse(record.specialData)
          }
          if (record.tags) {
            tags = JSON.parse(record.tags)
          }
        } catch (error) {
          console.error('Error parsing reality record data:', error)
        }

        return {
          ...record,
          specialData,
          tags
        }
      })
      .filter(record => {
        if (realityType === 'all') return true
        return record.specialData?.realityType === realityType
      })

    return NextResponse.json({
      realityRecords: realityRecordsWithDetails,
      pagination: {
        page,
        pageSize,
        total: realityRecordsWithDetails.length,
        totalPages: Math.ceil(realityRecordsWithDetails.length / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch reality records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reality records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      content,
      specialData,
      tags,
      privacy = 'private',
      projectId
    } = body

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields', details: '用户ID和内容是必填的' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let realityData = {}
    if (specialData) {
      realityData = {
        realityType: specialData.realityType || 'daily',
        eventTitle: specialData.eventTitle || '',
        eventDate: specialData.eventDate || '',
        location: specialData.location || '',
        participants: specialData.participants || [],
        detailedDescription: specialData.detailedDescription || '',
        emotionalImpact: specialData.emotionalImpact || '',
        lessonsLearned: specialData.lessonsLearned || '',
        evidence: specialData.evidence || [],
        witnesses: specialData.witnesses || [],
        consequences: specialData.consequences || [],
        resolution: specialData.resolution || '',
        currentStatus: specialData.currentStatus || '',
        futureOutlook: specialData.futureOutlook || '',
        authenticity: specialData.authenticity || 'verified',
        impact: specialData.impact || 'personal',
        ...specialData
      }
    }

    const realityRecord = await db.namedLedger.create({
      data: {
        userId,
        ledgerType: 'reality',
        content,
        specialData: JSON.stringify(realityData),
        tags: tags ? JSON.stringify(tags) : null,
        privacy,
        projectId,
        status: 'pending',
        value: calculateRealityValue(realityData)
      }
    })

    return NextResponse.json(realityRecord, { status: 201 })
  } catch (error) {
    console.error('Failed to create reality record:', error)
    return NextResponse.json(
      { error: 'Failed to create reality record' },
      { status: 500 }
    )
  }
}

function calculateRealityValue(realityData: any): number {
  let baseValue = 12
  
  if (realityData.realityType === 'struggle') baseValue += 20
  else if (realityData.realityType === 'achievement') baseValue += 18
  else if (realityData.realityType === 'change') baseValue += 15
  else if (realityData.realityType === 'truth') baseValue += 25
  
  if (realityData.impact === 'social') baseValue += 20
  else if (realityData.impact === 'community') baseValue += 15
  else if (realityData.impact === 'family') baseValue += 10
  
  if (realityData.detailedDescription && realityData.detailedDescription.length > 100) baseValue += 10
  if (realityData.lessonsLearned) baseValue += 8
  if (realityData.emotionalImpact) baseValue += 7
  
  if (realityData.evidence && realityData.evidence.length > 0) baseValue += 12
  if (realityData.witnesses && realityData.witnesses.length > 0) baseValue += 8
  
  if (realityData.authenticity === 'verified') baseValue += 15
  else if (realityData.authenticity === 'reported') baseValue += 8
  
  return baseValue
}
