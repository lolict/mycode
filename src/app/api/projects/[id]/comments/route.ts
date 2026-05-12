import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await db.comment.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
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
    const { content, authorId } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const project = await db.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    let finalAuthorId = authorId
    if (!finalAuthorId) {
      const defaultUser = await db.user.findFirst()
      if (!defaultUser) {
        return NextResponse.json(
          { error: 'No users found in database' },
          { status: 400 }
        )
      }
      finalAuthorId = defaultUser.id
    }

    const comment = await db.comment.create({
      data: {
        content,
        projectId: id,
        authorId: finalAuthorId
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
