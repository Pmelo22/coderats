import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      name?: string
      email?: string
      image?: string
      login?: string // aqui
    }
  }

  interface JWT {
    accessToken?: string
    login?: string
    email?: string // Adicionado email no JWT
  }
}
