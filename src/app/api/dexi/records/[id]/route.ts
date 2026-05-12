import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await db.dexiRecord.findUnique({
      where: { id },
      include: {
        module: true,
      }
    })

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Failed to fetch dexi record:', error)
    return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, value, status } = body

    const record = await db.dexiRecord.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(value !== undefined && { value }),
        ...(status !== undefined && { status }),
      },
      include: {
        module: {
          select: {
            name: true,
            fullName: true,
            icon: true,
            color: true,
          }
        }
      }
    })

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Failed to update dexi record:', error)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.dexiRecord.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete dexi record:', error)
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
  }
}
