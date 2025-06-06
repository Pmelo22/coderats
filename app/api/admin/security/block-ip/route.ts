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

    const { ip, reason } = await request.json()

    if (!ip) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 }
      )
    }

    // In a real implementation, this would add the IP to a firewall or database
    // For now, we'll just simulate the action
    console.log(`[SECURITY] IP ${ip} blocked by admin. Reason: ${reason || 'No reason provided'}`)
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `IP ${ip} has been successfully blocked`,
      blockedIp: ip,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error blocking IP:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
