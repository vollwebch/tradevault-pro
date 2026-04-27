import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password,
        name: name || null,
      },
    })

    const { password: _, ...safeUser } = user
    return NextResponse.json({ user: safeUser, token: user.id })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
