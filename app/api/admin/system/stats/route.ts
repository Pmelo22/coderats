import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getLeaderboard } from "@/lib/firestore-user"

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

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    verifyAdminToken(authorization)

    // Get system statistics
    const leaderboard = await getLeaderboard()
    const totalUsers = leaderboard.length
    const activeUsers = leaderboard.filter(user => user.active_days > 0).length
    const totalCommits = leaderboard.reduce((sum, user) => sum + (user.commits || 0), 0)
    
    const stats = {
      totalUsers,
      activeUsers,
      totalCommits,
      lastDataRefresh: new Date().toISOString(),
      systemUptime: process.uptime() * 1000, // Convert to milliseconds
      databaseSize: '2.5 GB', // This would be calculated from actual database
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error in system stats API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
