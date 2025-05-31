import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-admin-key"

function verifyAdminToken(authorization: string | null) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Token não fornecido")
  }

  const token = authorization.split(" ")[1]
  const decoded = jwt.verify(token, JWT_SECRET) as any
  
  if (!decoded.admin) {
    throw new Error("Token inválido")
  }

  return decoded
}

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    const { userId, ban } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      )
    }

    // Atualizar status de banimento do usuário
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      isBanned: ban,
      bannedAt: ban ? new Date().toISOString() : null,
      bannedBy: ban ? "admin" : null
    })

    return NextResponse.json({ 
      success: true, 
      message: `Usuário ${ban ? "banido" : "desbanido"} com sucesso` 
    })

  } catch (error) {
    console.error("Erro ao banir/desbanir usuário:", error)
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 401 }
    )
  }
}
