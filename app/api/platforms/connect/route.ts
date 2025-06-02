import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { platform, token, username } = await request.json()

    if (!platform || !token || !username) {
      return NextResponse.json({ 
        error: "Plataforma, token e username são obrigatórios" 
      }, { status: 400 })
    }

    // Validar plataforma
    if (platform !== 'github') {
      return NextResponse.json({ 
        error: "Plataforma não suportada" 
      }, { status: 400 })
    }

    // Verificar se o usuário está autenticado com GitHub
    const userRef = doc(db, "users", session.user.email)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return NextResponse.json({ 
        error: "Usuário não encontrado. Faça login com o GitHub primeiro." 
      }, { status: 404 })
    }

    const userData = userDoc.data()

    // Verificar se o token é válido
    let isValidToken = false
    let userInfo: any = null

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json'
        }
      })
      const userData = await response.json()
      isValidToken = response.ok && userData.login === username
    } catch (error) {
      console.error(`Erro ao validar token do github:`, error)
      isValidToken = false
    }

    if (!isValidToken) {
      return NextResponse.json({ 
        error: "Token inválido ou username não corresponde" 
      }, { status: 400 })
    }

    // Atualizar dados do usuário
    const connectedPlatforms = userData.connectedPlatforms || []
    const platforms = userData.platforms || {}

    // Adicionar plataforma se não estiver conectada
    if (!connectedPlatforms.includes(platform)) {
      connectedPlatforms.push(platform)
    }

    // Atualizar tokens e usernames específicos da plataforma
    const updateData: any = {
      connectedPlatforms,
      platforms,
      [`${platform}_token`]: token,
      [`${platform}_username`]: username
    }

    // Se for GitHub, atualizar dados principais
    updateData.github_username = username
    updateData.username = username // Manter compatibilidade
    updateData.name = userInfo?.name || userData.name
    updateData.avatar_url = userInfo?.avatar_url || userData.avatar_url

    await updateDoc(userRef, updateData)

    return NextResponse.json({ 
      success: true,
      message: `Plataforma ${platform} conectada com sucesso`
    })

  } catch (error) {
    console.error('Erro ao conectar plataforma:', error)
    return NextResponse.json({ 
      error: "Erro ao conectar plataforma" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.login && !session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }    const userId = session.user.email
    if (!userId) {
      return NextResponse.json({ error: "Email do usuário não encontrado" }, { status: 400 })
    }
    
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        connectedPlatforms: [],
        platforms: {}
      })
    }    const userData = userDoc.data()
    
    return NextResponse.json({
      connectedPlatforms: userData.connectedPlatforms || [],
      platforms: userData.platforms || {},
      // Incluir dados globais do usuário para fallback
      commits: userData.commits || 0,
      pull_requests: userData.pull_requests || 0,
      issues: userData.issues || 0,
      projects: userData.projects || 0,
      score: userData.score || 0
    })

  } catch (error) {
    console.error("Erro ao buscar plataformas conectadas:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 })
  }
}
