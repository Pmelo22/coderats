import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/firebase"
import { collection, doc, setDoc, addDoc, getDocs, updateDoc } from "firebase/firestore"

const JWT_SECRET = process.env.JWT_SECRET || "admin-secret-key"

// Middleware to verify admin token
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded.admin) {
      return null
    }
    return decoded
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

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo foi enviado" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Formato de arquivo não suportado. Use JSON ou CSV." 
      }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()
    let importData: any[] = []

    try {
      if (file.type === 'application/json') {
        const jsonData = JSON.parse(fileContent)
        
        // Handle different JSON structures
        if (Array.isArray(jsonData)) {
          importData = jsonData
        } else if (jsonData.users) {
          importData = jsonData.users
        } else if (jsonData.data?.users) {
          importData = jsonData.data.users
        } else if (jsonData.data) {
          importData = jsonData.data
        } else {
          return NextResponse.json({ 
            error: "Formato JSON inválido. Esperado array de usuários ou objeto com propriedade 'users' ou 'data'." 
          }, { status: 400 })
        }
      } else {
        // Parse CSV
        const lines = fileContent.split('\n').filter(line => line.trim() !== '')
        if (lines.length < 2) {
          return NextResponse.json({ 
            error: "Arquivo CSV deve conter cabeçalho e pelo menos uma linha de dados." 
          }, { status: 400 })
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const record: any = {}
          
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              // Try to parse numbers and booleans
              let value: any = values[index]
              if (value === 'true') value = true
              else if (value === 'false') value = false
              else if (!isNaN(Number(value)) && value !== '') value = Number(value)
              
              record[header] = value
            }
          })
          
          if (Object.keys(record).length > 0) {
            importData.push(record)
          }
        }
      }
    } catch (parseError) {
      return NextResponse.json({ 
        error: "Erro ao analisar arquivo. Verifique o formato dos dados." 
      }, { status: 400 })
    }

    if (importData.length === 0) {
      return NextResponse.json({ 
        error: "Nenhum dado válido encontrado no arquivo." 
      }, { status: 400 })
    }

    let importedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Get existing users to avoid duplicates
    const existingUsersSnapshot = await getDocs(collection(db, "users"))
    const existingUsers = new Set(existingUsersSnapshot.docs.map(doc => doc.data().username))

    // Process each record
    for (const record of importData) {
      try {
        // Validate required fields for user import
        if (!record.username && !record.github_username) {
          errors.push(`Registro ignorado: username ou github_username é obrigatório`)
          errorCount++
          continue
        }

        const username = record.username || record.github_username
        
        // Prepare user document
        const userDoc: any = {
          username,
          github_username: username,
          avatar_url: record.avatar_url || record.avatarUrl || `https://github.com/${username}.png`,
          score: Number(record.score || 0),
          rank: Number(record.rank || 0),
          updated_at: new Date(),
          isBanned: Boolean(record.isBanned || record.is_banned || false)
        }

        // Add optional fields if present
        if (record.email) userDoc.email = record.email
        if (record.name) userDoc.name = record.name
        if (record.bio) userDoc.bio = record.bio
        if (record.location) userDoc.location = record.location
        if (record.company) userDoc.company = record.company
        if (record.blog) userDoc.blog = record.blog
        if (record.twitter_username) userDoc.twitter_username = record.twitter_username
        
        // Add contribution stats if present
        if (record.commits !== undefined) userDoc.commits = Number(record.commits)
        if (record.pull_requests !== undefined) userDoc.pull_requests = Number(record.pull_requests)
        if (record.issues !== undefined) userDoc.issues = Number(record.issues)
        if (record.code_reviews !== undefined) userDoc.code_reviews = Number(record.code_reviews)

        // Add timestamp fields
        if (record.created_at) {
          try {
            userDoc.created_at = new Date(record.created_at)
          } catch {
            userDoc.created_at = new Date()
          }
        } else {
          userDoc.created_at = new Date()
        }

        // Update existing user or create new one
        if (existingUsers.has(username)) {
          // Find the existing user document
          const existingUser = existingUsersSnapshot.docs.find(doc => doc.data().username === username)
          if (existingUser) {
            await updateDoc(doc(db, "users", existingUser.id), userDoc)
          }
        } else {
          // Create new user
          await addDoc(collection(db, "users"), userDoc)
          existingUsers.add(username)
        }

        importedCount++
      } catch (recordError) {
        errors.push(`Erro ao processar registro ${record.username || 'desconhecido'}: ${recordError}`)
        errorCount++
      }
    }

    // Log import action
    try {
      await addDoc(collection(db, "audit_logs"), {
        action: "data_import_completed",
        adminId: decoded.username || "admin",
        details: {
          filename: file.name,
          fileSize: file.size,
          totalRecords: importData.length,
          imported: importedCount,
          errors: errorCount
        },
        ipAddress: request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   "unknown",
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
        created_at: new Date()
      })
    } catch (auditError) {
      console.error("Erro ao registrar log de auditoria:", auditError)
    }

    // Return import results
    return NextResponse.json({
      success: true,
      message: `Importação concluída com sucesso`,
      imported: importedCount,
      errors: errorCount,
      totalProcessed: importData.length,
      errorDetails: errors.length > 0 ? errors.slice(0, 10) : undefined // Show first 10 errors
    })

  } catch (error) {
    console.error("Erro na importação de dados:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor durante a importação" },
      { status: 500 }
    )
  }
}
