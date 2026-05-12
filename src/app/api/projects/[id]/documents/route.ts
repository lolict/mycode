import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDigestiveSystem } from '@/core/v2/digestive'
import { persistError } from '@/core/v2/digestive/persist'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const docType = searchParams.get('docType')
    const isPublic = searchParams.get('public')

    let whereClause: any = { projectId: id }
    
    if (docType) {
      whereClause.docType = docType
    }
    
    if (isPublic === 'true') {
      whereClause.isPublic = true
    }

    const documents = await db.projectDocument.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ documents })
  } catch (error) {
    const digestive = getDigestiveSystem()
    const digested = digestive.digest(error, { source: 'documents-api', operation: 'fetch-documents' })
    persistError(digested).catch(() => {})
    return NextResponse.json(
      { error: digested.message, ...(digested.suggestion ? { suggestion: digested.suggestion } : {}) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { docType, content, isPublic = false } = body

    if (!docType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      )
    }

    // 检查项目是否存在
    const project = await db.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const document = await db.projectDocument.create({
      data: {
        docType,
        content,
        isPublic,
        projectId: id
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    const digestive = getDigestiveSystem()
    const digested = digestive.digest(error, { source: 'documents-api', operation: 'create-document' })
    persistError(digested).catch(() => {})
    return NextResponse.json(
      { error: digested.message, ...(digested.suggestion ? { suggestion: digested.suggestion } : {}) },
      { status: 500 }
    )
  }
}