import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
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
    commission: row.commission,
    setup: row.setup,
    notes: row.notes,
    emotion: row.emotion,
    screenshot: row.screenshot,
    tags: row.tags,
    createdAt: row.created_at,
    _dbId: row.id,
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const trades = db.prepare('SELECT * FROM trades WHERE user_id = ? ORDER BY date DESC').all(decoded.userId) as Record<string, unknown>[]

    return NextResponse.json({ trades: trades.map(mapTrade) })
  } catch (error) {
    console.error('Get trades error:', error)
    return NextResponse.json({ error: 'Error al obtener trades' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const id = uuidv4()

    db.prepare(`
      INSERT INTO trades (id, user_id, date, symbol, direction, entry_price, exit_price, stop_loss, take_profit, shares, commission, setup, notes, emotion, screenshot, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      decoded.userId,
      body.date,
      body.symbol,
      body.direction,
      body.entryPrice,
      body.exitPrice,
      body.stopLoss ?? null,
      body.takeProfit ?? null,
      body.shares,
      body.commission ?? null,
      body.setup || null,
      body.notes || null,
      body.emotion ?? null,
      body.screenshot || null,
      body.tags || null,
    )

    const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(id) as Record<string, unknown>

    return NextResponse.json({ trade: mapTrade(trade) }, { status: 201 })
  } catch (error) {
    console.error('Create trade error:', error)
    return NextResponse.json({ error: 'Error al crear trade' }, { status: 500 })
  }
}
