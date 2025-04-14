import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Simplificando a configuração para usar as opções definidas em lib/auth-options.ts
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
