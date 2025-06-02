import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-admin-key'

// Verificação de autorização admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded && (decoded as any).admin === true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
    }

    // Buscar configuração atual de reset
    const configRef = doc(db, 'admin', 'reset-config')
    const configDoc = await getDoc(configRef)
    
    const defaultConfig = {
      nextResetDate: new Date('2025-06-01T03:00:00.000Z').toISOString(),
      resetEnabled: true,
      autoReset: false,
      resetMessage: 'Sistema será resetado automaticamente',
      lastResetDate: null,
      resetHistory: []
    }

    const config = configDoc.exists() ? configDoc.data() : defaultConfig
    
    return NextResponse.json({
      success: true,
      config,
      currentTime: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao buscar configuração de reset:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
    }

    const body = await request.json()
    const { nextResetDate, resetEnabled, autoReset, resetMessage } = body

    if (!nextResetDate) {
      return NextResponse.json({
        success: false,
        error: 'Data de reset é obrigatória'
      }, { status: 400 })
    }

    // Validar se a data é no futuro
    const resetDate = new Date(nextResetDate)
    const now = new Date()
    
    if (resetDate <= now) {
      return NextResponse.json({
        success: false,
        error: 'A data de reset deve ser no futuro'
      }, { status: 400 })
    }

    // Salvar configuração
    const configRef = doc(db, 'admin', 'reset-config')
    const newConfig = {
      nextResetDate,
      resetEnabled: resetEnabled ?? true,
      autoReset: autoReset ?? false,
      resetMessage: resetMessage || 'Sistema será resetado automaticamente',
      updatedAt: now.toISOString(),
      updatedBy: 'admin'
    }

    await setDoc(configRef, newConfig, { merge: true })

    return NextResponse.json({
      success: true,
      message: 'Configuração de reset atualizada com sucesso',
      config: newConfig
    })

  } catch (error) {
    console.error('Erro ao salvar configuração de reset:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'execute-reset') {
      // Executar reset manual
      const configRef = doc(db, 'admin', 'reset-config')
      const configDoc = await getDoc(configRef)
      
      // Se não existe configuração, criar uma nova configuração de reset com a data de hoje
      if (!configDoc.exists()) {
        const now = new Date();
        const newConfig = {
          nextResetDate: now.toISOString(),
          resetEnabled: true,
          autoReset: false,
          resetMessage: 'Reset manual iniciado',
          lastResetDate: now.toISOString(),
          resetHistory: [],
          updatedAt: now.toISOString(),
          updatedBy: 'admin'
        };
        await setDoc(configRef, newConfig);
        return NextResponse.json({
          success: true,
          message: 'Configuração de reset criada e reset executado.',
          config: newConfig
        });
      }

      const config = configDoc.data()
      const now = new Date()

      // Executar reset
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      
      const batch = writeBatch(db)
      let resetCount = 0

      usersSnapshot.docs.forEach((userDoc) => {
        const userData = userDoc.data()
        const userRef = doc(db, 'users', userDoc.id)
          // Zerar todas as estatísticas mas manter dados pessoais
        batch.update(userRef, {
          // Estatísticas zeradas
          commits: 0,
          pull_requests: 0,
          issues: 0,
          code_reviews: 0,
          projects: 0,
          active_days: 0,
          score: 0,
          
          // Campos antigos também zerados (compatibilidade)
          totalCommits: 0,
          totalPRs: 0,
          totalIssues: 0,
          totalReviews: 0,
          publicRepos: 0,
          followers: 0,
          following: 0,
          
          // Dados de plataformas zerados mas estrutura mantida
          platforms: userData.platforms ? Object.keys(userData.platforms).reduce((acc, platform) => {
            acc[platform] = {
              ...userData.platforms[platform],
              commits: 0,
              pull_requests: 0,
              issues: 0,
              repositories: 0,
              last_updated: now.toISOString()
            }
            return acc
          }, {} as any) : {},
          
          // Marcar reset - DATA HOJE como nova base para contagem
          lastResetDate: now.toISOString(),
          lastResetId: `reset_${now.getTime()}`,
          resetFor2025June: true,
          
          // Forçar nova sincronização que usará a data de reset como filtro
          lastUpdated: new Date(0).toISOString(),
          updated_at: new Date(0).toISOString(),
          shouldUpdate: true
        })
        resetCount++
      })

      if (resetCount > 0) {
        await batch.commit()
      }

      // Atualizar configuração com histórico
      const resetHistory = config.resetHistory || []
      resetHistory.push({
        date: now.toISOString(),
        usersReset: resetCount,
        type: 'manual',
        executedBy: 'admin'
      })

      await setDoc(configRef, {
        ...config,
        lastResetDate: now.toISOString(),
        resetHistory,
        updatedAt: now.toISOString()
      }, { merge: true })

      return NextResponse.json({
        success: true,
        message: `Reset executado com sucesso! ${resetCount} usuários resetados.`,
        resetCount,
        resetDate: now.toISOString()
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Ação não reconhecida'
    }, { status: 400 })

  } catch (error) {
    console.error('Erro ao executar reset:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
