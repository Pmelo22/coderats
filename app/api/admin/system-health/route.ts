import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-admin-key"

function verifyAdminToken(authorization: string | null) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Token de autorização inválido")
  }
  
  const token = authorization.substring(7)
  try {
    jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Token inválido")
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Simular métricas de sistema (em produção, você coletaria dados reais)
function getSystemMetrics() {
  // CPU Usage (simulado)
  const cpuUsage = Math.random() * 80 + 10 // 10-90%
  
  // Memory Usage (simulado) 
  const memoryUsed = Math.random() * 6 * 1024 * 1024 * 1024 + 2 * 1024 * 1024 * 1024 // 2-8GB
  const memoryTotal = 8 * 1024 * 1024 * 1024 // 8GB total
  const memoryPercentage = (memoryUsed / memoryTotal) * 100
  
  // Disk Usage (simulado)
  const diskUsed = Math.random() * 400 * 1024 * 1024 * 1024 + 100 * 1024 * 1024 * 1024 // 100-500GB
  const diskTotal = 1024 * 1024 * 1024 * 1024 // 1TB total
  const diskPercentage = (diskUsed / diskTotal) * 100
  
  // Response Times (simulados)
  const apiResponseTime = Math.random() * 300 + 50 // 50-350ms
  const databaseResponseTime = Math.random() * 100 + 20 // 20-120ms
  
  // GitHub API Rate Limit (simulado - baseado em limites reais)
  const githubRateLimit = {
    remaining: Math.floor(Math.random() * 5000),
    total: 5000,
    resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // Reset em 1 hora
  }
  
  // Error Rate (simulado)
  const errorRate = Math.random() * 5 // 0-5%
  const requestsPerMinute = Math.floor(Math.random() * 100) + 50 // 50-150 requests/min
  
  // Uptime calculation
  const uptimeSeconds = Math.floor(Math.random() * 86400 * 30) + 86400 * 7 // 7-37 days
  const uptimeFormatted = formatUptime(uptimeSeconds)
  
  // Calculate overall status
  let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy'
  if (cpuUsage > 80 || memoryPercentage > 80 || diskPercentage > 80 || apiResponseTime > 200) {
    overallStatus = 'error'
  } else if (cpuUsage > 60 || memoryPercentage > 60 || diskPercentage > 60 || errorRate > 2) {
    overallStatus = 'warning'
  }
  
  return {
    systemMetrics: {
      cpu: {
        usage: Math.round(cpuUsage * 10) / 10,
        cores: 4
      },
      memory: {
        used: Math.round(memoryUsed),
        total: memoryTotal,
        percentage: Math.round(memoryPercentage * 10) / 10
      },
      disk: {
        used: Math.round(diskUsed),
        total: diskTotal,
        percentage: Math.round(diskPercentage * 10) / 10
      }
    },
    apiMetrics: {
      responseTime: Math.round(apiResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      requestsPerMinute
    },
    database: {
      responseTime: Math.round(databaseResponseTime),
      activeConnections: Math.floor(Math.random() * 50) + 10, // 10-60 conexões
      status: (databaseResponseTime > 100 ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'error'
    },
    github: {
      rateLimit: githubRateLimit,
      apiStatus: (githubRateLimit.remaining < 1000 ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'error'
    },
    uptime: {
      seconds: uptimeSeconds,
      formatted: uptimeFormatted
    },
    overallStatus,
    lastUpdated: new Date().toISOString()
  }
}

async function getDatabaseMetrics() {
  try {
    const startTime = Date.now()
    const usersSnapshot = await getDocs(collection(db, "users"))
    const queryTime = Date.now() - startTime
    
    const users = usersSnapshot.docs.map(doc => doc.data())
    const totalUsers = users.length
    const activeUsers = users.filter(user => {
      const updatedAt = user.updated_at
      if (!updatedAt) return false
      const daysDiff = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7 // Usuários ativos nos últimos 7 dias
    }).length
    
    const recentActivity = users.filter(user => {
      const updatedAt = user.updated_at
      if (!updatedAt) return false
      const hoursDiff = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60)
      return hoursDiff <= 24 // Atividade nas últimas 24 horas
    }).length
    
    return {
      queryTime,
      totalUsers,
      activeUsers,
      recentActivity,
      avgScore: Math.round(users.reduce((sum, user) => sum + (user.score || 0), 0) / totalUsers),
      dataHealth: queryTime < 1000 ? "healthy" : queryTime < 3000 ? "warning" : "critical"
    }
  } catch (error) {
    return {
      queryTime: -1,
      totalUsers: 0,
      activeUsers: 0,
      recentActivity: 0,
      avgScore: 0,
      dataHealth: "critical",
      error: "Erro ao conectar com o banco de dados"
    }
  }
}

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    const systemMetrics = getSystemMetrics()
    const databaseMetrics = await getDatabaseMetrics()
    
    return NextResponse.json({
      ...systemMetrics,
      databaseMetrics,
      security: {
        failedLogins: Math.floor(Math.random() * 10), // 0-10 failed logins in last hour
        blockedIPs: Math.floor(Math.random() * 5), // 0-5 blocked IPs
        suspiciousActivity: Math.floor(Math.random() * 3), // 0-3 suspicious activities
        lastSecurityScan: new Date(Date.now() - Math.random() * 86400000).toISOString() // Last scan within 24h
      }
    })

  } catch (error) {
    console.error("Erro ao buscar métricas do sistema:", error)
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 401 }
    )
  }
}
