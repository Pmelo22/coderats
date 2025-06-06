import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

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

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    verifyAdminToken(authorization)

    const body = await request.json()
    const { operation } = body

    // Simulate operation execution
    let result
    let status = 'success'

    switch (operation) {
      case 'refresh-data':
        await new Promise(resolve => setTimeout(resolve, 2000))
        result = {
          usersUpdated: 150,
          repositoriesProcessed: 500,
          commitsAnalyzed: 2500
        }
        break

      case 'update-rankings':
        await new Promise(resolve => setTimeout(resolve, 1500))
        result = {
          ranksRecalculated: 150,
          positionChanges: 25
        }
        break

      case 'backup-database':
        await new Promise(resolve => setTimeout(resolve, 3000))
        result = {
          backupSize: '2.5 GB',
          tablesBackedUp: 12,
          backupLocation: 's3://coderats-backups/backup-' + Date.now()
        }
        break

      case 'maintenance-mode':
        result = {
          maintenanceEnabled: true,
          scheduledDuration: '30 minutes'
        }
        break

      default:
        status = 'error'
        result = { error: 'Unknown operation' }
    }

    return NextResponse.json({
      status,
      operation,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error in system operation API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
