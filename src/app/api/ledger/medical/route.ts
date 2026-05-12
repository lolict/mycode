import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    let whereClause: any = { ledgerType: 'medical' }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status !== 'all') {
      whereClause.status = status
    }

    const [medicalRecords, total] = await Promise.all([
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

    const medicalRecordsWithDetails = medicalRecords.map(record => {
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
        console.error('Error parsing medical record data:', error)
      }

      return {
        ...record,
        specialData,
        tags
      }
    })

    return NextResponse.json({
      medicalRecords: medicalRecordsWithDetails,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch medical records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
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

    let medicalData = {}
    if (specialData) {
      medicalData = {
        diseaseType: specialData.diseaseType || '',
        cause: specialData.cause || '',
        diagnosis: specialData.diagnosis || '',
        treatment: specialData.treatment || '',
        medication: specialData.medication || '',
        hospital: specialData.hospital || '',
        doctor: specialData.doctor || '',
        startDate: specialData.startDate || '',
        severity: specialData.severity || 'medium',
        isChronic: specialData.isChronic || false,
        needsHelp: specialData.needsHelp || false,
        helpType: specialData.helpType || '',
        ...specialData
      }
    }

    const medicalRecord = await db.namedLedger.create({
      data: {
        userId,
        ledgerType: 'medical',
        content,
        specialData: JSON.stringify(medicalData),
        tags: tags ? JSON.stringify(tags) : null,
        privacy,
        projectId,
        status: 'pending',
        value: calculateMedicalValue(medicalData)
      }
    })

    return NextResponse.json(medicalRecord, { status: 201 })
  } catch (error) {
    console.error('Failed to create medical record:', error)
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    )
  }
}

function calculateMedicalValue(medicalData: any): number {
  let baseValue = 10
  
  if (medicalData.severity === 'severe') baseValue += 20
  else if (medicalData.severity === 'medium') baseValue += 10
  
  if (medicalData.isChronic) baseValue += 15
  if (medicalData.needsHelp) baseValue += 10
  if (medicalData.diagnosis && medicalData.treatment) baseValue += 10
  if (medicalData.medication) baseValue += 5
  
  return baseValue
}
