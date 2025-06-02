import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET(request: NextRequest) {
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
    const platforms = userData.platforms || {}

    // Garantir que o GitHub esteja sempre presente
    if (!connectedPlatforms.includes('github')) {
      connectedPlatforms.push('github')
    }

    // Garantir que os dados do GitHub estejam presentes
    if (!platforms.github) {
      platforms.github = {
        username: userData.github_username || userData.username || session.user.login,
        commits: 0,
        pull_requests: 0,
        issues: 0,
        repositories: 0
      }
    }

    return NextResponse.json({
      connectedPlatforms,
      platforms
    })

  } catch (error) {
    console.error('Erro ao buscar plataformas:', error)
    return NextResponse.json({ 
      error: "Erro ao buscar plataformas" 
    }, { status: 500 })
  }
} 