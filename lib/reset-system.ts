// Sistema de Reset Automático - 1º de Junho 2025
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { db } from './firebase'

const RESET_DATE = new Date('2025-06-01T03:00:00.000Z') // Meia-noite de Brasília (UTC-3)
const RESET_EXECUTED_KEY = 'system_reset_executed_2025_06_01'

export async function checkAndExecuteReset() {
  const now = new Date()
  
  // Verifica se já passou da data de reset
  if (now < RESET_DATE) {
    return false // Ainda não é hora do reset
  }
  
  // Verifica se o reset já foi executado
  if (typeof window !== 'undefined') {
    const resetExecuted = localStorage.getItem(RESET_EXECUTED_KEY)
    if (resetExecuted) {
      return false // Reset já foi executado
    }
  }
  
  try {
    console.log('🔄 Executando reset do sistema para 1º de Junho de 2025...')
    
    // Reset dos dados de usuários
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    
    const batch = writeBatch(db)
    
    usersSnapshot.docs.forEach((userDoc) => {
      const userRef = doc(db, 'users', userDoc.id)
      batch.update(userRef, {
        // Zera as estatísticas        // Zera as estatísticas (campos novos)
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
        
        // Mantém dados pessoais
        // name, email, login, image, etc. permanecem inalterados
        
        // Atualiza data de reset - HOJE como nova base para contagem
        lastResetDate: new Date().toISOString(),
        resetFor2025June: true,
        
        // Atualiza última sincronização para forçar nova busca com filtro de data
        lastUpdated: new Date(0).toISOString(), // Força update na próxima sincronização
        updated_at: new Date(0).toISOString(),
      })
    })
    
    await batch.commit()
    
    // Marca o reset como executado
    if (typeof window !== 'undefined') {
      localStorage.setItem(RESET_EXECUTED_KEY, 'true')
    }
    
    console.log('✅ Reset do sistema executado com sucesso!')
    return true
    
  } catch (error) {
    console.error('❌ Erro ao executar reset do sistema:', error)
    return false
  }
}

export function isAfterResetDate(): boolean {
  return new Date() >= RESET_DATE
}

export function getResetDate(): Date {
  return RESET_DATE
}

export function getTimeUntilReset(): string {
  const now = new Date()
  const diff = RESET_DATE.getTime() - now.getTime()
  
  if (diff <= 0) {
    return 'Sistema resetado!'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
