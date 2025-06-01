import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs } from "firebase/firestore"
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

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    // Buscar estatísticas dos usuários
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => doc.data())

    const totalUsers = users.length
    const activeUsers = users.filter(user => {
      const updatedAt = user.updated_at
      if (!updatedAt) return false
      const daysDiff = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 30 // Usuários ativos nos últimos 30 dias
    }).length
    
    const bannedUsers = users.filter(user => user.isBanned).length
    const totalContributions = users.reduce((sum, user) => {
      return sum + (user.commits || 0) + (user.pull_requests || 0) + (user.issues || 0)
    }, 0)

    return NextResponse.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      totalContributions
    })

  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 401 }
    )
  }
}
