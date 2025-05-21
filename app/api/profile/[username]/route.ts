import { NextResponse } from "next/server"


export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    // Não exigimos autenticação para visualizar perfis públicos
    const username = params.username

    // TODO: Substituir toda a lógica de busca de dados do usuário, contribuições, ranking, repositórios e histórico
    // por chamadas ao novo backend/fonte de dados (ex: Firestore, API interna, etc.)
    // Exemplo de resposta mockada:
    const responseData = {
      id: "mock-id",
      username,
      name: "Mock User",
      avatarUrl: "/placeholder-user.jpg",
      bio: "Bio de exemplo",
      company: "Empresa Exemplo",
      location: "Cidade Exemplo",
      website: "https://exemplo.com",
      joinedDate: `Joined ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      followers: 0,
      following: 0,
      contributions: 0,
      commits: 0,
      pullRequests: 0,
      issues: 0,
      codeReviews: 0,
      projects: 0,
      activeDays: 0,
      streak: 0,
      rank: 0,
      score: 0,
      repositories: [],
      contributionData: [],
    }
    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
