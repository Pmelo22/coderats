import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    provider?: string
    user: {
      id: string
      login?: string
      username?: string
      web_url?: string
      connectedPlatforms?: string[]
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    login?: string
    username?: string
    web_url?: string
    account_id?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    provider?: string
    login?: string
    username?: string
    web_url?: string
    email?: string
  }
}
