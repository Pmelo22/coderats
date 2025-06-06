import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getNotifications, markNotificationAsRead, createNotification } from "@/lib/notifications"

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

// GET - Get notifications for admin
export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    const admin = verifyAdminToken(authorization)
    
    const url = new URL(req.url)
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 50
    const unreadOnly = url.searchParams.get("unreadOnly") === "true"

    const notifications = await getNotifications(admin.username, limit)
    
    const filteredNotifications = unreadOnly 
      ? notifications.filter(n => !n.isRead)
      : notifications

    return NextResponse.json({ 
      success: true, 
      notifications: filteredNotifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: error instanceof Error && error.message.includes("Token") ? 401 : 500 }
    )
  }
}

// POST - Create new notification or mark as read
export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    const admin = verifyAdminToken(authorization)
    
    const body = await req.json()
    const { action, notificationData, notificationId } = body

    if (action === "markAsRead" && notificationId) {
      await markNotificationAsRead(notificationId)
      return NextResponse.json({ success: true, message: "Notification marked as read" })
    }

    if (action === "create" && notificationData) {
      const notification = await createNotification({
        ...notificationData,
        adminId: admin.username
      })
      return NextResponse.json({ success: true, notification })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing data" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error processing notification request:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: error instanceof Error && error.message.includes("Token") ? 401 : 500 }
    )
  }
}

// PUT - Bulk mark notifications as read
export async function PUT(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)
    
    const body = await req.json()
    const { notificationIds } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification IDs" },
        { status: 400 }
      )
    }

    // Mark all notifications as read
    await Promise.all(
      notificationIds.map(id => markNotificationAsRead(id))
    )

    return NextResponse.json({ 
      success: true, 
      message: `${notificationIds.length} notifications marked as read` 
    })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: error instanceof Error && error.message.includes("Token") ? 401 : 500 }
    )
  }
}
