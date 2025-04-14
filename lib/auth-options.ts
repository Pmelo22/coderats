import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

// Obter a URL base da aplicação
const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          // Request access to read user profile and public repositories
          scope: "read:user user:email repo",
          // Definir explicitamente a URL de redirecionamento
          redirect_uri: `${appUrl}/api/auth/callback/github`,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the GitHub access token to the token
      if (account) {
        token.accessToken = account.access_token
        token.githubId = profile?.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      if (token.githubId) {
        session.user.id = token.githubId as string
      }
      return session
    },
  },
  // Configuração explícita de URLs
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/auth/error",
  },
  // Configuração explícita do URL de callback
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
