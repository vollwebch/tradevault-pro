import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const db = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

function parseBody(req) {
  return req.json().catch(() => null)
}

async function handleRequest(req) {
  const url = new URL(req.url)
  const path = url.pathname

  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' } })
  }

  // === AUTH: REGISTER ===
  if (path === '/api/auth/register' && req.method === 'POST') {
    const body = await parseBody(req)
    if (!body?.email || !body?.password) return json({ error: 'Email y contraseña requeridos' }, 400)
    const existing = await db.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (existing) return json({ error: 'Email ya registrado' }, 409)
    const user = await db.user.create({ data: { email: body.email.toLowerCase(), password: body.password, name: body.name || null } })
    const { password: _, ...safe } = user
    return json({ ...safe, token: user.id })
  }

  // === AUTH: LOGIN ===
  if (path === '/api/auth/login' && req.method === 'POST') {
    const body = await parseBody(req)
    if (!body?.email || !body?.password) return json({ error: 'Email y contraseña requeridos' }, 400)
    const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (!user || user.password !== body.password) return json({ error: 'Email o contraseña incorrectos' }, 401)
    const { password: _, ...safe } = user
    return json({ ...safe, token: user.id })
  }

  // === AUTH: ME ===
  if (path === '/api/auth/me' && req.method === 'GET') {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'No autorizado' }, 401)
    const user = await db.user.findUnique({ where: { id: token } })
    if (!user) return json({ error: 'Usuario no encontrado' }, 404)
    const { password: _, ...safe } = user
    return json({ user: safe })
  }

  // === TRADES: GET ===
  if (path === '/api/trades' && req.method === 'GET') {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'No autorizado' }, 401)
    const trades = await db.trade.findMany({ where: { userId: token }, orderBy: { date: 'desc' } })
    return json({ trades })
  }

  // === TRADES: POST ===
  if (path === '/api/trades' && req.method === 'POST') {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'No autorizado' }, 401)
    const body = await parseBody(req)
    const trade = await db.trade.create({ data: { userId: token, date: new Date(body.date), symbol: body.symbol, direction: body.direction, entryPrice: body.entryPrice, exitPrice: body.exitPrice, stopLoss: body.stopLoss, takeProfit: body.takeProfit, shares: body.shares, setup: body.setup, notes: body.notes, emotion: body.emotion, tags: body.tags } })
    return json({ trade }, 201)
  }

  // === TRADES: DELETE ===
  if (path.startsWith('/api/trades/') && req.method === 'DELETE') {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'No autorizado' }, 401)
    const id = path.split('/').pop()
    await db.trade.deleteMany({ where: { id, userId: token } })
    return json({ success: true })
  }

  // === TRADES: PUT ===
  if (path.startsWith('/api/trades/') && req.method === 'PUT') {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'No autorizado' }, 401)
    const id = path.split('/').pop()
    const body = await parseBody(req)
    const trade = await db.trade.update({ where: { id }, data: { date: new Date(body.date), symbol: body.symbol, direction: body.direction, entryPrice: body.entryPrice, exitPrice: body.exitPrice, stopLoss: body.stopLoss, takeProfit: body.takeProfit, shares: body.shares, setup: body.setup, notes: body.notes, emotion: body.emotion, tags: body.tags } })
    return json({ trade })
  }

  return json({ error: 'Not found' }, 404)
}

const server = Deno?.createServe ? Deno.serve({ port: 3001, handler: handleRequest }) : null
if (!server) {
  // Node.js/Bun fallback
  import('node:http').then(http => {
    const s = http.createServer(async (req, res) => {
      try {
        const response = await handleRequest(new Request(`http://localhost${req.url}`, { method: req.method, headers: req.headers, body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined }))
        res.writeHead(response.status, Object.fromEntries(response.headers))
        const body = await response.text()
        res.end(body)
      } catch (e) {
        res.writeHead(500)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    s.listen(3001, () => console.log('API server on :3001'))
  })
}
