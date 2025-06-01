import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set")
}
const JWT_SECRET = process.env.JWT_SECRET

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

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    // Buscar todos os usuários
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: data.id || data.username,
        username: data.username || data.name || "Usuário",
        avatar_url: data.avatar_url || "/placeholder-user.jpg",
        score: data.score || 0,
        rank: data.rank || 0,
        isBanned: data.isBanned || false,
        updated_at: data.updated_at || data.created_at || new Date().toISOString(),
        commits: data.commits || 0,
        pull_requests: data.pull_requests || 0,
        issues: data.issues || 0,
        code_reviews: data.code_reviews || 0
      }
    })

    // Ordenar por score (rank)
    users.sort((a, b) => b.score - a.score)

    return NextResponse.json(users)

  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 401 }
    )
  }
}
