import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getUserByEmail, createUser, hashPassword, generateToken, getUserById } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 })
    }

    const existing = getUserByEmail(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
    }

    const userId = uuidv4()
    const hashedPassword = hashPassword(password)
    createUser(userId, email.toLowerCase(), hashedPassword, name || null)

    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }

    const token = generateToken(userId)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      broker: user.broker,
      token,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
