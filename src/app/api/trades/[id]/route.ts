import { NextRequest, NextResponse } from 'next/server'
import db, { verifyToken } from '@/lib/db'

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) % 100000000
}

function mapTrade(row: Record<string, unknown>) {
  return {
    id: hashStr(row.id as string),
    userId: row.user_id,
    date: row.date,
    symbol: row.symbol,
    direction: row.direction,
    entryPrice: row.entry_price,
    exitPrice: row.exit_price,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    shares: row.shares,
    setup: row.setup,
    notes: row.notes,
    emotion: row.emotion,
    screenshot: row.screenshot,
    tags: row.tags,
    createdAt: row.created_at,
    _dbId: row.id,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { id } = await params

    const trade = db.prepare('SELECT * FROM trades WHERE id = ? AND user_id = ?').get(id, decoded.userId) as Record<string, unknown> | undefined
    if (!trade) {
      return NextResponse.json({ error: 'Trade no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ trade: mapTrade(trade) })
  } catch (error) {
    console.error('Get trade error:', error)
    return NextResponse.json({ error: 'Error al obtener trade' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existing = db.prepare('SELECT * FROM trades WHERE id = ? AND user_id = ?').get(id, decoded.userId) as Record<string, unknown> | undefined
    if (!existing) {
      return NextResponse.json({ error: 'Trade no encontrado' }, { status: 404 })
    }

    db.prepare(`
      UPDATE trades SET date = ?, symbol = ?, direction = ?, entry_price = ?, exit_price = ?,
        stop_loss = ?, take_profit = ?, shares = ?, setup = ?, notes = ?, emotion = ?, screenshot = ?, tags = ?
      WHERE id = ? AND user_id = ?
    `).run(
      body.date,
      body.symbol,
      body.direction,
      body.entryPrice,
      body.exitPrice,
      body.stopLoss ?? null,
      body.takeProfit ?? null,
      body.shares,
      body.setup || null,
      body.notes || null,
      body.emotion ?? null,
      body.screenshot || null,
      body.tags || null,
      id,
      decoded.userId,
    )

    const updated = db.prepare('SELECT * FROM trades WHERE id = ?').get(id) as Record<string, unknown>

    return NextResponse.json({ trade: mapTrade(updated) })
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { id } = await params

    const existing = db.prepare('SELECT * FROM trades WHERE id = ? AND user_id = ?').get(id, decoded.userId) as Record<string, unknown> | undefined
    if (!existing) {
      return NextResponse.json({ error: 'Trade no encontrado' }, { status: 404 })
    }

    db.prepare('DELETE FROM trades WHERE id = ? AND user_id = ?').run(id, decoded.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete trade error:', error)
    return NextResponse.json({ error: 'Error al eliminar trade' }, { status: 500 })
  }
}
