import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { MultiPlatformService } from "@/lib/platforms/multi-platform"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar dados do usuário
    const userRef = doc(db, "users", session.user.email)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        error: "Usuário não encontrado" 
      }, { status: 404 })
    }

    const userData = userDoc.data()
    const connectedPlatforms = userData.connectedPlatforms || []
    
    if (connectedPlatforms.length === 0) {
      return NextResponse.json({
        error: "Nenhuma plataforma conectada" 
      }, { status: 400 })
    }

    // Preparar tokens e usernames
    const tokens: any = {}
    const usernames: any = {}

    if (connectedPlatforms.includes('github')) {
      tokens.github_token = userData.github_token || session.accessToken
      usernames.github = userData.github_username || userData.username || session.user.login
    }

    // Se não há plataformas conectadas formalmente, mas o usuário está logado via OAuth
    if (connectedPlatforms.length === 0 && session.provider) {
      const currentProvider = session.provider
      if (currentProvider === 'github') {
        tokens.github_token = session.accessToken
        usernames.github = session.user.login
        connectedPlatforms.push('github')
      }
    }

    // Buscar estatísticas de todas as plataformas
    const multiPlatformService = new MultiPlatformService(tokens, usernames)
    const contributions = await multiPlatformService.getUserContributions()

    // Calcular score baseado em contribuições unificadas
    const score = (
      contributions.total_commits * 4 +
      contributions.total_prs * 2.5 +
      contributions.total_issues * 1.5 +
      contributions.total_repositories * 0.5
    )

    // Atualizar plataformas individuais com dados sincronizados
    const updatedPlatforms = userData.platforms || {}
    Object.keys(contributions.platforms).forEach(platform => {
      const platformData = contributions.platforms[platform]
      if (updatedPlatforms[platform]) {
        updatedPlatforms[platform] = {
          ...updatedPlatforms[platform],
          commits: platformData.commits || 0,
          pull_requests: platformData.prs || 0,
          issues: platformData.issues || 0,
          repositories: platformData.repositories || 0,
          last_updated: new Date().toISOString()
        }
      }
    })

    // Atualizar documento do usuário
    const updateData = {
      commits: contributions.total_commits,
      pull_requests: contributions.total_prs,
      issues: contributions.total_issues,
      projects: contributions.total_repositories,
      score: Math.round(score),
      platforms: updatedPlatforms,
      updated_at: new Date().toISOString(),
      lastSynced: new Date().toISOString()
    }

    await updateDoc(userRef, updateData)

    return NextResponse.json({ 
      success: true,
      contributions,
      score: Math.round(score),
      message: "Dados sincronizados com sucesso!"
    })

  } catch (error) {
    console.error("Erro ao sincronizar dados das plataformas:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}
