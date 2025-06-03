import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

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

    const { collections: targetCollections, format } = await request.json()

    // Default collections to backup if none specified
    const collectionsToBackup = targetCollections || ["users", "notices", "audit_logs", "updates"]
    
    const backup: any = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {}
    }

    // Export each collection
    for (const collectionName of collectionsToBackup) {
      try {
        const snapshot = await getDocs(collection(db, collectionName))
        backup.data[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to ISO strings
          ...(doc.data().created_at && { 
            created_at: doc.data().created_at.toDate?.()?.toISOString() || doc.data().created_at 
          }),
          ...(doc.data().updated_at && { 
            updated_at: doc.data().updated_at.toDate?.()?.toISOString() || doc.data().updated_at 
          }),
          ...(doc.data().timestamp && { 
            timestamp: doc.data().timestamp.toDate?.()?.toISOString() || doc.data().timestamp 
          })
        }))
      } catch (error) {
        console.error(`Erro ao fazer backup da coleção ${collectionName}:`, error)
        backup.data[collectionName] = { error: "Falha ao fazer backup desta coleção" }
      }
    }

    // Log the backup action
    try {
      await fetch(`${request.nextUrl.origin}/api/admin/audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify({
          action: "system_backup",
          details: `Backup criado para coleções: ${collectionsToBackup.join(", ")}`,
          metadata: {
            collections: collectionsToBackup,
            recordCount: Object.values(backup.data).reduce((acc: number, collection: any) => 
              acc + (Array.isArray(collection) ? collection.length : 0), 0
            )
          }
        })
      })
    } catch (auditError) {
      console.error("Erro ao registrar audit log:", auditError)
    }

    if (format === "csv" && collectionsToBackup.length === 1) {
      // Export single collection as CSV
      const collectionData = backup.data[collectionsToBackup[0]]
      if (Array.isArray(collectionData) && collectionData.length > 0) {
        const headers = Object.keys(collectionData[0])
        const csvContent = [
          headers.join(","),
          ...collectionData.map(row => 
            headers.map(header => 
              JSON.stringify(row[header] || "")
            ).join(",")
          )
        ].join("\n")

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${collectionsToBackup[0]}_backup_${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }
    }

    // Return JSON backup
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="coderats_backup_${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error("Erro ao criar backup:", error)
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

    // Return available collections and their info
    const availableCollections = ["users", "notices", "audit_logs", "updates"]
    const collectionInfo: any = {}

    for (const collectionName of availableCollections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName))
        collectionInfo[collectionName] = {
          documentCount: snapshot.docs.length,
          lastUpdated: snapshot.docs.length > 0 ? 
            Math.max(...snapshot.docs.map(doc => {
              const data = doc.data()
              const timestamps = [data.created_at, data.updated_at, data.timestamp]
                .filter(Boolean)
                .map(ts => ts.toDate?.()?.getTime() || new Date(ts).getTime())
                .filter(time => !isNaN(time))
              return timestamps.length > 0 ? Math.max(...timestamps) : 0
            })) : null
        }
        
        if (collectionInfo[collectionName].lastUpdated) {
          collectionInfo[collectionName].lastUpdated = new Date(collectionInfo[collectionName].lastUpdated).toISOString()
        }
      } catch (error) {
        collectionInfo[collectionName] = { error: "Não foi possível acessar esta coleção" }
      }
    }

    return NextResponse.json({
      availableCollections,
      collectionInfo,
      supportedFormats: ["json", "csv"]
    })

  } catch (error) {
    console.error("Erro ao obter informações de backup:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
