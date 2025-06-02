import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"

import type { NextAuthOptions, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Account, Profile } from "next-auth"

const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { 
          scope: "read:user user:email repo read:org"
          // Removido prompt: "consent" para evitar autorização constante
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        }
      },
    }),
    
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // 24 horas
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 dias
      }
    }
  },
  pages: {
    error: '/auth/error', // Página de erro personalizada
  },  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT
      account?: Account | null
      profile?: Profile
    }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      if (profile) {
        token.login = (profile as any).login || (profile as any).username
        token.email = (profile as any).email
        token.username = (profile as any).username || (profile as any).login
        token.web_url = (profile as any).web_url
      }
      return token
    },
    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }) {
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      session.user.login = token.login as string
      session.user.username = token.username as string
      session.user.email = token.email as string
      session.user.web_url = token.web_url as string
      return session
    },    async signIn({ user, account, profile }) {
      if (!account) {
        console.error("❌ Account não fornecido durante o login")
        return false
      }      const { db } = await import('@/lib/firebase')
      const { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, where, or } = await import('firebase/firestore')

      const userId = user.email
      if (!userId) {
        console.error("❌ Email do usuário não encontrado")
        return false
      }

      // Função para verificar se existe usuário similar
      async function findExistingUser(email: string, username: string): Promise<{ id: string, data: any } | null> {
        try {
          // Primeira verificação: buscar por email exato
          const userRef = doc(db, "users", email)
          const userDoc = await getDoc(userRef)
          
          if (userDoc.exists()) {
            console.log(`✅ Usuário encontrado por email: ${email}`)
            return { id: email, data: userDoc.data() }
          }

          // Segunda verificação: buscar por username nas plataformas conectadas
          const usersSnapshot = await getDocs(collection(db, "users"))
          
          for (const docSnap of usersSnapshot.docs) {
            const userData = docSnap.data()
            
            // Verificar username principal
            if (userData.username === username || userData.login === username) {
              console.log(`✅ Usuário encontrado por username principal: ${username}`)
              return { id: docSnap.id, data: userData }
            }
            
            // Verificar usernames das plataformas conectadas
            if (userData.platforms) {
              for (const [platformName, platformData] of Object.entries(userData.platforms)) {
                if ((platformData as any).username === username) {
                  console.log(`✅ Usuário encontrado por username da plataforma ${platformName}: ${username}`)
                  return { id: docSnap.id, data: userData }
                }
              }
            }
              // Verificar usernames específicos por plataforma
            const platformUsernames = [
              userData.github_username
            ]
            
            if (platformUsernames.includes(username)) {
              console.log(`✅ Usuário encontrado por username específico da plataforma: ${username}`)
              return { id: docSnap.id, data: userData }
            }
          }
          
          return null
        } catch (error) {
          console.error("❌ Erro ao buscar usuário existente:", error)
          return null
        }
      }

      try {
        const currentUsername = (profile as any)?.username || (profile as any)?.login || user.name
        
        // Verificar se existe usuário similar
        const existingUser = await findExistingUser(userId, currentUsername)
        
        let userRef: any
        let userData: any
        
        if (existingUser) {
          // Usuário existente encontrado - usar sua conta
          userRef = doc(db, "users", existingUser.id)
          userData = existingUser.data
          console.log(`🔄 Usando conta existente encontrada: ${existingUser.id}`)
        } else {
          // Verificar se o documento com email atual existe
          userRef = doc(db, "users", userId)
          const userDoc = await getDoc(userRef)
          userData = userDoc.exists() ? userDoc.data() : null
        }        const platformData = {
          username: (profile as any)?.username || (profile as any)?.login || user.name,
          commits: 0,
          pull_requests: 0,
          issues: 0,
          repositories: 0,
          last_updated: new Date().toISOString(),
        }

        if (userData) {
          // Usuário existente - atualizar plataformas
          const connectedPlatforms = userData.connectedPlatforms || []
          const platforms = userData.platforms || {}

          // Verificar se a plataforma já está conectada
          const isAlreadyConnected = connectedPlatforms.includes(account.provider)
          
          if (!isAlreadyConnected) {
            connectedPlatforms.push(account.provider)
            platforms[account.provider] = platformData
            
            console.log(`✅ Nova plataforma ${account.provider} adicionada ao usuário existente`)
          } else {
            // Atualizar apenas timestamp se já conectado
            if (platforms[account.provider]) {
              platforms[account.provider].last_updated = new Date().toISOString()
            }
            console.log(`✅ Login realizado com plataforma já conectada: ${account.provider}`)
          }

          // Aggregate contributions
          const totalContributions = Object.values(platforms).reduce(
            (acc: { commits: number; pull_requests: number; issues: number; repositories: number }, platform: any) => {
              acc.commits += platform.commits || 0;
              acc.pull_requests += platform.pull_requests || 0;
              acc.issues += platform.issues || 0;
              acc.repositories += platform.repositories || 0;
              return acc;
            },
            { commits: 0, pull_requests: 0, issues: 0, repositories: 0 }
          )

          await updateDoc(userRef, {
            connectedPlatforms,
            platforms,
            totalContributions,
            // Atualizar informações básicas do usuário se necessário
            name: user.name || userData.name,
            email: user.email || userData.email, // Garantir que o email seja atualizado
            avatar_url: user.image || userData.avatar_url,
            login: currentUsername || userData.login,
            username: currentUsername || userData.username,
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          })
        } else {
          // Novo usuário
          const newUserData = {
            name: user.name,
            email: user.email,
            login: (profile as any)?.login || (profile as any)?.username,
            username: (profile as any)?.username || (profile as any)?.login,
            avatar_url: user.image,
            provider: account.provider,
            connectedPlatforms: [account.provider],
            platforms: {
              [account.provider]: platformData,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          }

          await setDoc(userRef, newUserData)
          console.log(`✅ Novo usuário criado com plataforma ${account.provider}`)
        }

        return true
      } catch (error) {
        console.error("❌ Erro durante o processo de login:", error)
        return false
      }
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST, authOptions }
