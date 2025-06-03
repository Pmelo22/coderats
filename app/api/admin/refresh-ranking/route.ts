import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getGitHubUserStats } from "@/lib/github/getUserStats"

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

    console.log("🚀 Iniciando atualização em massa do ranking com sistema de commits aprimorado...")

    // Buscar todos os usuários ativos
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => doc.data())
    
    const activeUsers = users.filter(user => !user.isBanned && user.username)
    console.log(`📊 Total de usuários ativos encontrados: ${activeUsers.length}`)

    let updated = 0
    let errors = 0
    let skipped = 0
    const updateResults: Array<{username: string, status: string, commits?: number, error?: string}> = []

    // Token administrativo do GitHub para fazer as consultas
    const adminGitHubToken = process.env.GITHUB_ADMIN_TOKEN
    
    if (!adminGitHubToken) {
      return NextResponse.json({
        success: false,
        error: "GITHUB_ADMIN_TOKEN não configurado no servidor"
      }, { status: 500 })
    }

    // Processar usuários em lotes para não sobrecarregar as APIs
    const batchSize = 3 // Reduzido para evitar rate limits
    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize)
      console.log(`📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(activeUsers.length/batchSize)}...`)

      const batchPromises = batch.map(async (user) => {
        try {
          console.log(`🔄 Atualizando usuário: ${user.username}`)
          
          // Buscar stats do GitHub usando o sistema aprimorado
          const stats = await getGitHubUserStats(user.username, adminGitHubToken)
          
          // Calcular score usando a mesma fórmula do sistema
          const score = Math.round(
            stats.commits * 4 +
            stats.pullRequests * 2.5 +
            stats.issues * 1.5 +
            stats.codeReviews * 1 +
            stats.diversity * 0.5 +
            stats.activeDays * 0.3
          )

          // Calcular streak se disponível
          let streak = user.streak || 0
          if (stats.contributionDates && stats.contributionDates.length > 0) {
            const sortedDates = stats.contributionDates
              .map(d => new Date(d))
              .sort((a, b) => b.getTime() - a.getTime())
            
            streak = 1
            for (let i = 1; i < sortedDates.length; i++) {
              const diff = (sortedDates[i - 1].getTime() - sortedDates[i].getTime()) / (1000 * 60 * 60 * 24)
              if (diff === 1) {
                streak++
              } else if (diff > 1) {
                break
              }
            }
          }

          const now = new Date().toISOString()
          const userRef = doc(db, "users", user.username)
          
          // Manter dados existentes importantes
          const existingDoc = await getDoc(userRef)
          const existingData = existingDoc.exists() ? existingDoc.data() : {}

          const userData = {
            ...existingData, // Preservar dados existentes
            id: user.username,
            username: user.username,
            avatar_url: user.avatar_url,
            name: user.name,
            email: user.email,
            score,
            commits: stats.commits,
            pull_requests: stats.pullRequests,
            issues: stats.issues,
            code_reviews: stats.codeReviews,
            projects: stats.diversity,
            active_days: stats.activeDays,
            updated_at: now,
            lastRank: existingData.rank || existingData.lastRank,
            streak,
            // Manter logs de refresh existentes
            refresh_logs: existingData.refresh_logs || [],
            // Adicionar timestamp desta atualização administrativa
            last_admin_update: now,
            admin_update_method: "batch_refresh_enhanced"
          }

          await setDoc(userRef, userData, { merge: true })
          
          updateResults.push({
            username: user.username,
            status: 'success',
            commits: stats.commits
          })
          
          console.log(`✅ ${user.username}: ${stats.commits} commits, score: ${score}`)
          updated++

        } catch (error) {
          console.error(`❌ Erro ao atualizar ${user.username}:`, error)
          updateResults.push({
            username: user.username,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })
          errors++
        }
      })

      // Aguardar conclusão do lote
      await Promise.all(batchPromises)
      
      // Pausa entre lotes para respeitar rate limits
      if (i + batchSize < activeUsers.length) {
        console.log("⏳ Aguardando 3 segundos antes do próximo lote...")
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    console.log("🎉 Atualização em massa concluída!")
    console.log(`📊 Resumo: ${updated} atualizados, ${errors} erros, ${skipped} ignorados`)

    return NextResponse.json({ 
      success: true, 
      message: `Atualização com sistema aprimorado concluída: ${updated} usuários atualizados, ${errors} erros`,
      details: {
        totalUsers: activeUsers.length,
        updated,
        errors,
        skipped,
        updateResults: updateResults.slice(0, 10), // Primeiros 10 resultados para não sobrecarregar resposta
        timestamp: new Date().toISOString(),
        method: "enhanced_commits_system"
      }
    })

  } catch (error) {
    console.error("❌ Erro ao atualizar dados do ranking:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        timestamp: new Date().toISOString()
      },
      { status: error instanceof Error && error.message.includes("Token") ? 401 : 500 }
    )
  }
}
