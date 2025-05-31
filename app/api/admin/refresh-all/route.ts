import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { updateUserData } from "@/lib/firestore-user"

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

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    // Buscar todos os usuários ativos
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => doc.data())
    
    const activeUsers = users.filter(user => !user.isBanned)
    
    let updated = 0
    let errors = 0
    const updatePromises = []

    for (const user of activeUsers) {
      // Para atualizar os dados, precisamos de um token do GitHub
      // Como é uma operação administrativa, você pode usar um token de admin
      const adminGitHubToken = process.env.GITHUB_ADMIN_TOKEN
        if (adminGitHubToken && user.username) {
        updatePromises.push(
          updateUserData({
            username: user.username,
            token: adminGitHubToken,
            avatar_url: user.avatar_url,
            name: user.name,
            email: user.email, // use existing email if available
            force: true
          }).then(() => {
            updated++
          }).catch((error) => {
            console.error(`Erro ao atualizar ${user.username}:`, error)
            errors++
          })
        )
      }
    }

    // Executar atualizações em lotes para não sobrecarregar a API
    const batchSize = 5
    for (let i = 0; i < updatePromises.length; i += batchSize) {
      const batch = updatePromises.slice(i, i + batchSize)
      await Promise.all(batch)
      
      // Aguardar um pouco entre os lotes para respeitar rate limits
      if (i + batchSize < updatePromises.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Atualização concluída: ${updated} usuários atualizados, ${errors} erros`,
      totalUsers: activeUsers.length,
      updated,
      errors
    })

  } catch (error) {
    console.error("Erro ao atualizar dados:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Acesso negado" },
      { status: 401 }
    )
  }
}
