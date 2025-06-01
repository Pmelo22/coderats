import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GitLabProvider from "@/lib/auth/gitlab-provider"
import BitbucketProvider from "@/lib/auth/bitbucket-provider"
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
          scope: "read:user user:email repo read:org",
          prompt: "consent"
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
    GitLabProvider({
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!,
    }),
    BitbucketProvider({
      clientId: process.env.BITBUCKET_CLIENT_ID!,
      clientSecret: process.env.BITBUCKET_CLIENT_SECRET!,
    }),
  ],
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
      // Verificar se account existe
      if (!account) {
        console.error("❌ Account não fornecido durante o login")
        return false
      }

      // Verifica se o email foi fornecido para qualquer plataforma
      if (account.provider === 'gitlab') {
        if (!user.email || !profile?.email) {
          console.error("❌ Email não fornecido durante o login do GitLab")
          return false
        }
        console.log("✅ Login GitLab autorizado com email:", user.email)
      }
      
      // Para GitHub, também verifica email
      if (account.provider === 'github') {
        if (!user.email || !profile?.email) {
          console.error("❌ Email não fornecido durante o login do GitHub")
          return false
        }
        console.log("✅ Login GitHub autorizado com email:", user.email)
      }
      
      // Para Bitbucket, email pode precisar ser buscado separadamente
      if (account.provider === 'bitbucket') {
        console.log("✅ Login Bitbucket autorizado")
      }

      // Salvar informações da plataforma no Firebase
      try {
        const { db } = await import('@/lib/firebase')
        const { doc, setDoc, getDoc, updateDoc } = await import('firebase/firestore')
        
        // Use email como ID primário, pois é consistente entre plataformas
        const userId = user.email
        if (!userId) {
          console.error("❌ Email do usuário não encontrado")
          return false
        }
        
        const userRef = doc(db, "users", userId)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          // Usuário existe - atualizar com nova plataforma
          const userData = userDoc.data()
          const connectedPlatforms = userData.connectedPlatforms || []
          const platforms = userData.platforms || {}
          
          // Adicionar nova plataforma se não existir
          if (!connectedPlatforms.includes(account.provider)) {
            connectedPlatforms.push(account.provider)
          }
          
          // Atualizar dados da plataforma
          platforms[account.provider] = {
            username: (profile as any)?.username || (profile as any)?.login || user.name,
            commits: 0,
            pull_requests: 0,
            issues: 0,
            repositories: 0,
            last_updated: new Date().toISOString()
          }
          
          await updateDoc(userRef, {
            connectedPlatforms,
            platforms,
            [`${account.provider}_username`]: (profile as any)?.username || (profile as any)?.login,
            updated_at: new Date().toISOString()
          })
          
          console.log(`✅ Plataforma ${account.provider} adicionada ao usuário existente`)
        } else {
          // Novo usuário - criar documento
          const userData = {
            name: user.name,
            email: user.email,
            login: (profile as any)?.login || (profile as any)?.username,
            username: (profile as any)?.username || (profile as any)?.login,
            avatar_url: user.image,
            provider: account.provider,
            connectedPlatforms: [account.provider],
            platforms: {
              [account.provider]: {
                username: (profile as any)?.username || (profile as any)?.login || user.name,
                commits: 0,
                pull_requests: 0,
                issues: 0,
                repositories: 0,
                last_updated: new Date().toISOString()
              }
            },
            [`${account.provider}_username`]: (profile as any)?.username || (profile as any)?.login,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          await setDoc(userRef, userData)
          console.log(`✅ Novo usuário criado com plataforma ${account.provider}`)
        }
      } catch (error) {
        console.error("❌ Erro ao salvar dados do usuário:", error)
        // Não falhar o login por erro de Firebase
      }
      
      return true
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST, authOptions }
