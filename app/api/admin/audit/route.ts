import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/firebase"
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore"

const JWT_SECRET = process.env.JWT_SECRET || "admin-secret-key"

// Middleware to verify admin token
function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyAdminToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { action, target, details, metadata } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Ação é obrigatória" }, { status: 400 })
    }

    // Create audit log entry
    const auditLog = {
      action,
      target: target || null,
      details: details || null,
      metadata: metadata || {},
      admin_id: (decoded as any).userId || "unknown",
      timestamp: serverTimestamp(),
      ip_address: request.headers.get("x-forwarded-for") || 
                  request.headers.get("x-real-ip") || 
                  "unknown",
      user_agent: request.headers.get("user-agent") || "unknown"
    }

    // Save to Firestore
    await addDoc(collection(db, "audit_logs"), auditLog)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erro ao criar log de auditoria:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyAdminToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get audit logs from Firestore
    const { getDocs, query, orderBy, limit: firestoreLimit, startAfter } = await import("firebase/firestore")
    
    let q = query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc"),
      firestoreLimit(limit)
    )

    const snapshot = await getDocs(q)
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()?.toISOString()
    }))

    return NextResponse.json({
      logs,
      hasMore: snapshot.docs.length === limit
    })

  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
