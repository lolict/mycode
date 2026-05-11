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
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
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

    // 如果没有提供authorId，使用默认用户
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

    // 验证用户是否存在
    const user = await db.user.findUnique({
      where: { id: finalAuthorId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid author ID' },
        { status: 400 }
      )
    }

    const comment = await db.comment.create({
      data: {
        content,
        projectId: id,
        authorId: finalAuthorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
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