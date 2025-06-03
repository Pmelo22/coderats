// Real-time Dashboard Updates API
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Verify admin token
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true || decoded.admin === true
  } catch (error) {
    return false
  }
}

// Server-Sent Events for real-time dashboard updates
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const token = authHeader.substring(7)
  if (!verifyAdminToken(token)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Set up Server-Sent Events
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Send initial connection confirmation
      sendUpdate({
        type: 'connection',
        message: 'Real-time dashboard updates connected',
        timestamp: new Date().toISOString()
      })

      // Send periodic system updates
      const interval = setInterval(async () => {
        try {
          // Get system health data
          const systemHealthResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/system-health`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (systemHealthResponse.ok) {
            const systemHealth = await systemHealthResponse.json()
            
            sendUpdate({
              type: 'system-health',
              data: {
                cpu: systemHealth.systemMetrics.cpu.usage,
                memory: systemHealth.systemMetrics.memory.percentage,
                disk: systemHealth.systemMetrics.disk.percentage,
                apiResponseTime: systemHealth.apiMetrics.responseTime,
                overallStatus: systemHealth.overallStatus,
                timestamp: new Date().toISOString()
              }
            })
          }

          // Get recent notifications
          const notificationsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (notificationsResponse.ok) {
            const notifications = await notificationsResponse.json()
            const recentNotifications = notifications.filter((n: any) => 
              !n.isRead && new Date(n.createdAt) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            )
            
            if (recentNotifications.length > 0) {
              sendUpdate({
                type: 'notifications',
                data: recentNotifications,
                count: recentNotifications.length
              })
            }
          }

          // Get latest audit events
          const auditResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/audit`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (auditResponse.ok) {
            const auditData = await auditResponse.json()
            const recentAudit = auditData.logs?.filter((log: any) => 
              new Date(log.timestamp) > new Date(Date.now() - 2 * 60 * 1000) // Last 2 minutes
            ) || []
            
            if (recentAudit.length > 0) {
              sendUpdate({
                type: 'audit-events',
                data: recentAudit,
                count: recentAudit.length
              })
            }
          }

        } catch (error) {
          console.error('Error sending real-time update:', error)
          sendUpdate({
            type: 'error',
            message: 'Error fetching update data',
            timestamp: new Date().toISOString()
          })
        }
      }, 15000) // Update every 15 seconds

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Authorization'
    }
  })
}

// Trigger immediate updates for specific events
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.substring(7)
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { type, data } = await request.json()

    // Handle different types of real-time updates
    switch (type) {
      case 'system-alert':
        return NextResponse.json({ 
          success: true, 
          message: 'System alert broadcasted',
          timestamp: new Date().toISOString()
        })

      case 'user-action':
        return NextResponse.json({ 
          success: true, 
          message: 'User action update processed',
          timestamp: new Date().toISOString()
        })

      case 'notification-trigger':
        return NextResponse.json({ 
          success: true, 
          message: 'Notification triggered',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ 
          error: 'Unknown update type',
          supportedTypes: ['system-alert', 'user-action', 'notification-trigger']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Real-time update error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
