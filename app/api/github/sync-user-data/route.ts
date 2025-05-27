import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { getFirestore, doc, updateDoc, setDoc } from "firebase/firestore"
import { app } from "@/lib/firebase"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const { userId, username } = await req.json()

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Token de acesso não encontrado na sessão" }, { status: 401 })
  }

  const githubToken = session.accessToken as string
  const headers = {
    Authorization: `token ${githubToken}`,
    Accept: "application/vnd.github+json",
  }

  try {
    // 🔹 Buscar dados básicos do usuário
    const userRes = await fetch("https://api.github.com/user", { headers })
    const userData = await userRes.json()

    // 🔹 Buscar repositórios públicos do usuário
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers })
    const repos = await reposRes.json()

    const totalStars = repos.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0)
    const totalForks = repos.reduce((acc: number, repo: any) => acc + repo.forks_count, 0)

    // 🔹 Montar estrutura de dados para Firestore
    const contributions = {
      total_count: repos.length,
      commits_count: 0, // você pode somar via GitHub GraphQL se quiser detalhes
      pull_requests_count: 0,
      issues_count: 0,
      code_reviews_count: 0,
      projects_count: 0,
      active_days_count: 0,
      current_streak: 0,
    }

    const rankings = {
      score: totalStars + totalForks,
      rank: 0, // calculado depois em batch, possivelmente
    }

    const db = getFirestore(app)
    const userRef = doc(db, "users", userId)

    await setDoc(userRef, {
      id: userId,
      username: username,
      name: userData.name,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      contributions: [contributions],
      rankings: [rankings],
      repositories: repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        language: r.language,
        stars_count: r.stargazers_count,
        forks_count: r.forks_count,
        updated_at: r.updated_at,
      })),
      updatedAt: new Date().toISOString(),
    }, { merge: true })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[GitHub Sync Error]", err)
    return NextResponse.json({ error: err.message || "Erro desconhecido" }, { status: 500 })
  }
}
