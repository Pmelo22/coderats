import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123"
}

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-admin-key"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    // Verificar credenciais
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      { admin: true, username },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    return NextResponse.json({ 
      success: true, 
      token,
      message: "Login realizado com sucesso" 
    })

  } catch (error) {
    console.error("Erro no login admin:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
