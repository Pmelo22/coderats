import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-admin-key"

// Interface para definir a estrutura do usuário
interface User {
  id: string
  username?: string
  score?: number
  commits?: number
  pull_requests?: number
  issues?: number
  code_reviews?: number
  avatar_url?: string
  isBanned?: boolean
  updated_at?: string
  [key: string]: any // Para outras propriedades que possam existir
}

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
    verifyAdminToken(authorization)    // Buscar todos os usuários
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users: User[] = usersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as User))

    // Calcular analytics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))

    // Usuários por período
    const usersLast30Days = users.filter(user => {
      const updatedAt = user.updated_at ? new Date(user.updated_at) : null
      return updatedAt && updatedAt >= thirtyDaysAgo
    }).length

    const usersLast7Days = users.filter(user => {
      const updatedAt = user.updated_at ? new Date(user.updated_at) : null
      return updatedAt && updatedAt >= sevenDaysAgo
    }).length

    // Top 10 usuários por score
    const topUsers = users
      .filter(user => !user.isBanned && user.score)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10)
      .map(user => ({
        username: user.username,
        score: user.score || 0,
        commits: user.commits || 0,
        pull_requests: user.pull_requests || 0,
        issues: user.issues || 0
      }))

    // Distribuição de scores
    const scoreRanges = {
      "0-100": 0,
      "101-500": 0,
      "501-1000": 0,
      "1001-2000": 0,
      "2000+": 0
    }

    users.forEach(user => {
      const score = user.score || 0
      if (score <= 100) scoreRanges["0-100"]++
      else if (score <= 500) scoreRanges["101-500"]++
      else if (score <= 1000) scoreRanges["501-1000"]++
      else if (score <= 2000) scoreRanges["1001-2000"]++
      else scoreRanges["2000+"]++
    })

    // Estatísticas de contribuições
    const totalCommits = users.reduce((sum, user) => sum + (user.commits || 0), 0)
    const totalPRs = users.reduce((sum, user) => sum + (user.pull_requests || 0), 0)
    const totalIssues = users.reduce((sum, user) => sum + (user.issues || 0), 0)
    const totalCodeReviews = users.reduce((sum, user) => sum + (user.code_reviews || 0), 0)

    // Usuários mais ativos (por commits)
    const mostActiveUsers = users
      .filter(user => !user.isBanned && user.commits)
      .sort((a, b) => (b.commits || 0) - (a.commits || 0))
      .slice(0, 5)
      .map(user => ({
        username: user.username,
        commits: user.commits || 0,
        avatar_url: user.avatar_url
      }))

    // Cálculo de crescimento
    const activeUsersGrowth = ((usersLast7Days / Math.max(usersLast30Days, 1)) * 100).toFixed(1)

    return NextResponse.json({
      summary: {
        totalUsers: users.length,
        activeUsers: users.filter(user => !user.isBanned).length,
        bannedUsers: users.filter(user => user.isBanned).length,
        usersLast30Days,
        usersLast7Days,
        activeUsersGrowth: parseFloat(activeUsersGrowth)
      },
      contributions: {
        totalCommits,
        totalPRs,
        totalIssues,
        totalCodeReviews,
        avgCommitsPerUser: Math.round(totalCommits / Math.max(users.length, 1))
      },
      topUsers,
      mostActiveUsers,
      scoreDistribution: scoreRanges,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Erro ao buscar analytics:", error)
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 401 }
    )
  }
}
