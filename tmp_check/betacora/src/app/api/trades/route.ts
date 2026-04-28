import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const trades = await db.trade.findMany({
      where: { userId: token },
      orderBy: { date: 'desc' },
    })

    const mapped = trades.map(t => ({
      id: Math.abs(t.id.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)) % 100000000,
      userId: t.userId,
      date: t.date.toISOString(),
      symbol: t.symbol,
      direction: t.direction,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      stopLoss: t.stopLoss,
      takeProfit: t.takeProfit,
      shares: t.shares,
      setup: t.setup,
      notes: t.notes,
      emotion: t.emotion,
      screenshot: t.screenshot,
      tags: t.tags,
      createdAt: t.createdAt.toISOString(),
      _dbId: t.id,
    }))

    return NextResponse.json({ trades: mapped })
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

    const body = await request.json()
    const trade = await db.trade.create({
      data: {
        userId: token,
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
      id: Math.abs(trade.id.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)) % 100000000,
      userId: trade.userId,
      date: trade.date.toISOString(),
      symbol: trade.symbol,
      direction: trade.direction,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      shares: trade.shares,
      setup: trade.setup,
      notes: trade.notes,
      emotion: trade.emotion,
      screenshot: trade.screenshot,
      tags: trade.tags,
      createdAt: trade.createdAt.toISOString(),
      _dbId: trade.id,
    }

    return NextResponse.json({ trade: mapped }, { status: 201 })
  } catch (error) {
    console.error('Create trade error:', error)
    return NextResponse.json({ error: 'Error al crear trade' }, { status: 500 })
  }
}
