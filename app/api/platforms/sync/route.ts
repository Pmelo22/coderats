import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { MultiPlatformService } from "@/lib/platforms/multi-platform"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
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
      tokens.github_token = userData.github_token
      usernames.github = userData.github_username || userData.username
    }
    
    if (connectedPlatforms.includes('gitlab')) {
      tokens.gitlab_token = userData.gitlab_token
      usernames.gitlab = userData.gitlab_username
    }
    
    if (connectedPlatforms.includes('bitbucket')) {
      tokens.bitbucket_token = userData.bitbucket_token
      usernames.bitbucket = userData.bitbucket_username
    }

    // Buscar estatísticas de todas as plataformas
    const multiPlatformService = new MultiPlatformService(tokens, usernames)
    const contributions = await multiPlatformService.getUnifiedContributions()

    // Calcular score baseado em contribuições unificadas
    const score = (
      contributions.total_commits * 4 +
      contributions.total_prs * 2.5 +
      contributions.total_issues * 1.5 +
      contributions.total_repositories * 0.5
    )

    // Atualizar documento do usuário
    const updateData = {
      commits: contributions.total_commits,
      pull_requests: contributions.total_prs,
      issues: contributions.total_issues,
      projects: contributions.total_repositories,
      score: Math.round(score),
      platforms: contributions.platforms,
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
