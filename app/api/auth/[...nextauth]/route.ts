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
          scope: "read:user user:email repo read:org",
          // Força o usuário a autorizar acesso ao email
          prompt: "consent"
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email, // Captura email diretamente do perfil
          image: profile.avatar_url,
          login: profile.login,
        }
      },
    }),
  ],
  pages: {
    error: '/auth/error', // Página de erro personalizada
  },
  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT
      account?: Account | null
      profile?: Profile
    }) {
      if (account?.access_token) token.accessToken = account.access_token
      if (profile) {
        token.login = (profile as any).login
        token.email = (profile as any).email // Salva email no token
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
      session.user.login = token.login as string
      session.user.email = token.email as string // Garante email na sessão
      return session
    },
    async signIn({ user, account, profile }) {
      // Verifica se o email foi fornecido
      if (!user.email || !profile?.email) {
        console.error("❌ Email não fornecido durante o login do GitHub")
        return false // Bloqueia login se não houver email
      }
      console.log("✅ Login autorizado com email:", user.email)
      return true
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST, authOptions }
