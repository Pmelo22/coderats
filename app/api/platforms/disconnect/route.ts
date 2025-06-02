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

    const { platform } = await request.json()

    if (!platform) {
      return NextResponse.json({ 
        error: "Plataforma é obrigatória" 
      }, { status: 400 })
    }

    // Não permitir desconectar o GitHub
    if (platform === 'github') {
      return NextResponse.json({ 
        error: "Não é possível desconectar o GitHub, pois é a plataforma principal" 
      }, { status: 400 })
    }    // Validar plataforma
    if (!['github'].includes(platform)) {
      return NextResponse.json({ 
        error: "Plataforma não suportada" 
      }, { status: 400 })
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

    // Remover plataforma
    if (connectedPlatforms.includes(platform)) {
      connectedPlatforms.splice(connectedPlatforms.indexOf(platform), 1)
    }

    // Remover dados da plataforma
    const updateData: any = {
      connectedPlatforms,
      [`${platform}_token`]: null,
      [`${platform}_username`]: null
    }

    // Remover dados da plataforma do objeto platforms
    if (platforms[platform]) {
      delete platforms[platform]
      updateData.platforms = platforms
    }

    await updateDoc(userRef, updateData)

    return NextResponse.json({ 
      success: true,
      message: `Plataforma ${platform} desconectada com sucesso`
    })

  } catch (error) {
    console.error('Erro ao desconectar plataforma:', error)
    return NextResponse.json({ 
      error: "Erro ao desconectar plataforma" 
    }, { status: 500 })
  }
} 