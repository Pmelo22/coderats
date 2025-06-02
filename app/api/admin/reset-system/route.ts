import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const RESET_DATE = new Date('2025-06-01T03:00:00.000Z') // Meia-noite de Brasília (UTC-3)

export async function POST(request: NextRequest) {
  try {
    const now = new Date()
    
    // Verifica se já passou da data de reset
    if (now < RESET_DATE) {
      return NextResponse.json({
        success: false,
        message: 'Reset só pode ser executado após 1º de junho de 2025',
        timeUntilReset: Math.ceil((RESET_DATE.getTime() - now.getTime()) / 1000)
      }, { status: 400 })
    }
    
    console.log('🔄 Executando reset do sistema para 1º de Junho de 2025...')
    
    // Reset dos dados de usuários
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    
    const batch = writeBatch(db)
    let resetCount = 0
    
    usersSnapshot.docs.forEach((userDoc) => {
      const userData = userDoc.data()
        // Só reseta se ainda não foi resetado para 2025
      if (!userData.resetFor2025June) {
        const userRef = doc(db, 'users', userDoc.id)
        batch.update(userRef, {
          // Zera as estatísticas (campos novos)
          commits: 0,
          pull_requests: 0,
          issues: 0,
          code_reviews: 0,
          projects: 0,
          active_days: 0,
          score: 0,
          
          // Zera as estatísticas (campos antigos - compatibilidade)
          totalCommits: 0,
          totalPRs: 0,
          totalIssues: 0,
          totalReviews: 0,
          publicRepos: 0,
          followers: 0,
          following: 0,
          
          // Mantém dados pessoais (name, email, login, image, etc.)
          
          // Marca dados de reset - HOJE como nova data base
          lastResetDate: now.toISOString(),
          resetFor2025June: true,
          
          // Força nova sincronização que considerará a data de reset
          lastUpdated: new Date(0).toISOString(),
          updated_at: new Date(0).toISOString(),
          shouldUpdate: true
        })
        resetCount++
      }
    })
    
    if (resetCount > 0) {
      await batch.commit()
      console.log(`✅ Reset executado com sucesso! ${resetCount} usuários resetados.`)
    }
    
    return NextResponse.json({
      success: true,
      message: `Reset executado com sucesso! ${resetCount} usuários resetados.`,
      resetCount,
      resetDate: RESET_DATE.toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro ao executar reset do sistema:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  const now = new Date()
  const timeUntilReset = RESET_DATE.getTime() - now.getTime()
  
  return NextResponse.json({
    resetDate: RESET_DATE.toISOString(),
    currentTime: now.toISOString(),
    isAfterReset: now >= RESET_DATE,
    timeUntilReset: timeUntilReset > 0 ? Math.ceil(timeUntilReset / 1000) : 0,
    message: now >= RESET_DATE ? 'Sistema pode ser resetado' : 'Aguardando data de reset'
  })
}
