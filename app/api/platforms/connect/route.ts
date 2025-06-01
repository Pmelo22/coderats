import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { GitLabService } from "@/lib/platforms/gitlab"
import { BitbucketService } from "@/lib/platforms/bitbucket"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.login && !session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { platform, token, username } = await request.json()

    if (!platform || !token || !username) {
      return NextResponse.json({ 
        error: "Plataforma, token e username são obrigatórios" 
      }, { status: 400 })
    }

    // Validar plataforma
    if (!['github', 'gitlab', 'bitbucket'].includes(platform)) {
      return NextResponse.json({ 
        error: "Plataforma não suportada" 
      }, { status: 400 })
    }

    // Verificar se o token é válido
    let isValidToken = false
    let userInfo: any = null

    try {
      if (platform === 'gitlab') {
        const gitlabService = new GitLabService(token)
        userInfo = await gitlabService.getUserInfo()
        isValidToken = userInfo && userInfo.username === username
      } else if (platform === 'bitbucket') {
        const bitbucketService = new BitbucketService(token, username)
        userInfo = await bitbucketService.getUserInfo()
        isValidToken = userInfo && userInfo.username === username
      } else if (platform === 'github') {
        // Para GitHub, apenas verificar se o token é válido
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json'
          }
        })
        const userData = await response.json()
        isValidToken = response.ok && userData.login === username
      }
    } catch (error) {
      console.error(`Erro ao validar token do ${platform}:`, error)
      isValidToken = false
    }

    if (!isValidToken) {
      return NextResponse.json({ 
        error: "Token inválido ou username não corresponde" 
      }, { status: 400 })
    }    // Usar email como ID do documento (consistente entre plataformas)
    const userId = session.user.email
    if (!userId) {
      return NextResponse.json({ error: "Email do usuário não encontrado" }, { status: 400 })
    }
    
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ 
        error: "Usuário não encontrado" 
      }, { status: 404 })
    }

    const userData = userDoc.data()
    const connectedPlatforms = userData.connectedPlatforms || []
    const platforms = userData.platforms || {}

    // Adicionar plataforma se não estiver conectada
    if (!connectedPlatforms.includes(platform)) {
      connectedPlatforms.push(platform)
    }

    // Atualizar dados da plataforma
    platforms[platform] = {
      username,
      token, // Em produção, considere criptografar
      commits: 0,
      pull_requests: 0,
      issues: 0,
      repositories: 0,
      last_updated: new Date().toISOString()
    }

    // Atualizar campos específicos da plataforma
    const updateData: any = {
      connectedPlatforms,
      platforms,
      [`${platform}_token`]: token,
      [`${platform}_username`]: username,
      updated_at: new Date().toISOString()
    }

    await updateDoc(userRef, updateData)

    return NextResponse.json({ 
      success: true, 
      message: `${platform} conectado com sucesso!`,
      connectedPlatforms
    })

  } catch (error) {
    console.error("Erro ao conectar plataforma:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
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
    }

    const userData = userDoc.data()
    
    return NextResponse.json({
      connectedPlatforms: userData.connectedPlatforms || [],
      platforms: userData.platforms || {}
    })

  } catch (error) {
    console.error("Erro ao buscar plataformas conectadas:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 })
  }
}
