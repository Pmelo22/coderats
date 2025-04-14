import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  const session = await getServerSession(authOptions)

  // Se já estiver autenticado, redirecionar para a página de perfil
  if (session) {
    return NextResponse.redirect(new URL("/profile", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }

  // Construir a URL de autorização do GitHub manualmente
  const githubClientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback/github`
  const scope = "read:user,user:email,repo"

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=${scope}`

  return NextResponse.redirect(authUrl)
}
