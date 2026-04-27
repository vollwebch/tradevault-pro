import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, comparePassword, generateToken, getUserById } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const user = getUserByEmail(email.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const valid = comparePassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const token = generateToken(user.id)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      broker: user.broker,
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
