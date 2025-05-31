// app/api/admin/migrate-emails/route.ts
import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

export async function POST(request: Request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'JWT_SECRET não configurado' }, { status: 500 })
    }

    verify(token, secret)

    // Get admin GitHub token for API calls
    const adminGitHubToken = process.env.GITHUB_ADMIN_TOKEN
    if (!adminGitHubToken) {
      return NextResponse.json({ 
        error: 'GITHUB_ADMIN_TOKEN não configurado. Adicione um token do GitHub com scope user:email no .env.local' 
      }, { status: 500 })
    }

    console.log('🔄 Iniciando migração de emails...')    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users: Array<{id: string, username: string, email?: string}> = []
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      users.push({
        id: doc.id,
        username: userData.username,
        email: userData.email,
        ...userData
      })
    })

    let updated = 0
    let errors = 0
    let skipped = 0

    // Process users in batches to respect rate limits
    const batchSize = 5
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (user) => {
        try {
          // Skip if user already has email
          if (user.email) {
            console.log(`⏭️ Usuário ${user.username} já tem email: ${user.email}`)
            skipped++
            return
          }

          // Fetch user email from GitHub API
          const response = await fetch(`https://api.github.com/users/${user.username}`, {
            headers: {
              'Authorization': `Bearer ${adminGitHubToken}`,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })

          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
          }

          const githubUser = await response.json()
          
          if (githubUser.email) {
            // Update user in Firestore with email
            const userRef = doc(db, 'users', user.id)
            await updateDoc(userRef, {
              email: githubUser.email
            })
            
            console.log(`✅ Atualizado ${user.username} com email: ${githubUser.email}`)
            updated++
          } else {
            console.log(`⚠️ Email não disponível para ${user.username} (perfil privado)`)
            skipped++
          }
        } catch (error) {
          console.error(`❌ Erro ao processar ${user.username}:`, error)
          errors++
        }
      }))

      // Add delay between batches to respect GitHub rate limits
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`✅ Migração concluída: ${updated} atualizados, ${skipped} ignorados, ${errors} erros`)

    return NextResponse.json({
      success: true,
      message: 'Migração de emails concluída',
      stats: {
        total: users.length,
        updated,
        skipped,
        errors
      }
    })

  } catch (error) {
    console.error('❌ Erro na migração de emails:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
