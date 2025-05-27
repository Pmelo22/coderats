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
        params: { scope: "read:user user:email repo read:org" },
      },
    }),
  ],
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
      if (profile) token.login = (profile as any).login
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
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST, authOptions }
