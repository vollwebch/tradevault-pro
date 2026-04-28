import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const trade = await db.trade.findUnique({ where: { id } })
    if (!trade || trade.userId !== token) {
      return NextResponse.json({ error: 'Trade no encontrado' }, { status: 404 })
    }

    const updated = await db.trade.update({
      where: { id },
      data: {
        date: new Date(body.date),
        symbol: body.symbol,
        direction: body.direction,
        entryPrice: body.entryPrice,
        exitPrice: body.exitPrice,
        stopLoss: body.stopLoss ?? null,
        takeProfit: body.takeProfit ?? null,
        shares: body.shares,
        setup: body.setup || null,
        notes: body.notes || null,
        emotion: body.emotion ?? null,
        screenshot: body.screenshot || null,
        tags: body.tags || null,
      },
    })

    const mapped = {
      id: Math.abs(updated.id.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)) % 100000000,
      userId: updated.userId,
      date: updated.date.toISOString(),
      symbol: updated.symbol,
      direction: updated.direction,
      entryPrice: updated.entryPrice,
      exitPrice: updated.exitPrice,
      stopLoss: updated.stopLoss,
      takeProfit: updated.takeProfit,
      shares: updated.shares,
      setup: updated.setup,
      notes: updated.notes,
      emotion: updated.emotion,
      screenshot: updated.screenshot,
      tags: updated.tags,
      createdAt: updated.createdAt.toISOString(),
      _dbId: updated.id,
    }

    return NextResponse.json({ trade: mapped })
  } catch (error) {
    console.error('Update trade error:', error)
    return NextResponse.json({ error: 'Error al actualizar trade' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const trade = await db.trade.findUnique({ where: { id } })
    if (!trade || trade.userId !== token) {
      return NextResponse.json({ error: 'Trade no encontrado' }, { status: 404 })
    }

    await db.trade.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete trade error:', error)
    return NextResponse.json({ error: 'Error al eliminar trade' }, { status: 500 })
  }
}
