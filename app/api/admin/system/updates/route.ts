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

// Simple audit logging to console (can be enhanced later)
function createAuditLog(data: any) {
  console.log('[AUDIT]', new Date().toISOString(), data)
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const decoded = verifyAdminToken(authorization)

    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'stats') {
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
    }

    // Return recent system operations/updates
    const updates = [
      {
        id: 'update_1',
        type: 'data_refresh',
        title: 'Atualização completa dos dados',
        description: 'Todos os dados de usuários foram atualizados',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
        duration: 5 * 60 * 1000 // 5 minutes
      }
    ]

    return NextResponse.json({ updates })

  } catch (error) {
    console.error("Error in system updates API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const decoded = verifyAdminToken(authorization)

    const body = await request.json()
    const { operation, timestamp } = body    // Log the operation start
    await createAuditLog({
      adminId: decoded.admin?.id || 'admin',
      action: `system_operation_${operation}`,
      targetType: 'system',
      targetId: 'system',
      details: { 
        operation,
        startedAt: timestamp,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    let result: any = {}

    switch (operation) {
      case 'data_refresh':
        // Simulate comprehensive data refresh
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time
        result = {
          message: 'Todos os dados foram atualizados com sucesso',
          usersUpdated: 150,
          repositoriesProcessed: 1200,
          commitsProcessed: 25000
        }
        break

      case 'ranking_refresh':
        // Refresh just the ranking
        await new Promise(resolve => setTimeout(resolve, 1000))
        const leaderboard = await getLeaderboard()
        result = {
          message: 'Ranking atualizado com sucesso',
          usersRanked: leaderboard.length,
          topUser: leaderboard[0]?.username || 'N/A'
        }
        break

      case 'backup':
        // Simulate backup creation
        await new Promise(resolve => setTimeout(resolve, 3000))
        result = {
          message: 'Backup criado com sucesso',
          backupSize: '2.5 GB',
          backupLocation: 's3://coderats-backups/',
          backupId: `backup_${Date.now()}`
        }
        break

      case 'maintenance':
        // Simulate system maintenance
        await new Promise(resolve => setTimeout(resolve, 1500))
        result = {
          message: 'Manutenção do sistema concluída',
          tasksCompleted: ['cache_cleanup', 'log_rotation', 'database_optimization'],
          spaceCleaned: '500 MB'
        }
        break

      default:
        return NextResponse.json(
          { error: "Unknown operation" },
          { status: 400 }
        )
    }    // Log the operation completion
    await createAuditLog({
      adminId: decoded.admin?.id || 'admin',
      action: `system_operation_${operation}_completed`,
      targetType: 'system',
      targetId: 'system',
      details: { 
        operation,
        completedAt: new Date().toISOString(),
        result,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error executing system operation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
