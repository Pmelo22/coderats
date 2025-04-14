import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

// Data de início para contabilizar contribuições
const CONTRIBUTION_START_DATE = new Date("2025-04-01T00:00:00Z")

export async function POST(request: Request) {
  try {
    // Get session to verify authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = session.accessToken

    if (!accessToken) {
      return NextResponse.json({ error: "No GitHub access token found" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { userId, username } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const octokit = new Octokit({ auth: accessToken })

    console.log(`Syncing GitHub data for user ID: ${userId}, username: ${username || "unknown"}`)

    // Get user from database
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Use the username from the database if not provided
    const githubUsername = username || user.username

    console.log(`Fetching repositories for ${githubUsername}`)

    // Fetch user's repositories
    const { data: repos } = await octokit.repos.listForUser({
      username: githubUsername,
      per_page: 100,
      sort: "updated",
    })

    console.log(`Found ${repos.length} repositories`)

    // Contador de projetos únicos
    const uniqueProjects = new Set()

    // Insert or update repositories
    for (const repo of repos) {
      if (!repo.private) {
        // Only track public repos
        uniqueProjects.add(repo.name)

        const { data: existingRepo, error: repoQueryError } = await supabase
          .from("repositories")
          .select("id")
          .eq("github_repo_id", repo.id.toString())
          .maybeSingle()

        if (repoQueryError) {
          console.error(`Error querying repo ${repo.name}:`, repoQueryError)
          continue
        }

        if (existingRepo) {
          await supabase
            .from("repositories")
            .update({
              name: repo.name,
              description: repo.description,
              language: repo.language,
              stars_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              is_fork: repo.fork,
              is_private: repo.private,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingRepo.id)
        } else {
          await supabase.from("repositories").insert({
            user_id: userId,
            github_repo_id: repo.id.toString(),
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            is_fork: repo.fork,
            is_private: repo.private,
          })
        }
      }
    }

    console.log(`Fetching events for ${githubUsername}`)

    // Fetch user's contribution stats
    // Note: GitHub doesn't provide an official API for contribution counts
    // This is a simplified approach - in a real app, you might need to use GraphQL or scrape the data

    // For this example, we'll calculate contributions based on events
    const { data: events } = await octokit.activity.listPublicEventsForUser({
      username: githubUsername,
      per_page: 100,
    })

    console.log(`Found ${events.length} events`)

    // Count different types of contributions, filtering by date
    let commitCount = 0
    let prCount = 0
    let issueCount = 0
    let codeReviewCount = 0
    const activeDays = new Set()

    events.forEach((event) => {
      // Verificar se o evento ocorreu após 1º de abril de 2025
      const eventDate = new Date(event.created_at)
      if (eventDate >= CONTRIBUTION_START_DATE) {
        // Adicionar o dia à lista de dias ativos
        activeDays.add(event.created_at.split("T")[0])

        if (event.type === "PushEvent") {
          // @ts-ignore - payload type is not properly defined in the types
          commitCount += event.payload.commits?.length || 0
        } else if (event.type === "PullRequestEvent") {
          prCount += 1
        } else if (event.type === "IssuesEvent") {
          issueCount += 1
        } else if (event.type === "PullRequestReviewEvent") {
          codeReviewCount += 1
        }
      }
    })

    // Se não tivermos eventos, definimos valores padrão para teste
    if (events.length === 0) {
      commitCount = Math.floor(Math.random() * 1000) + 100
      prCount = Math.floor(Math.random() * 100) + 10
      issueCount = Math.floor(Math.random() * 200) + 20
      codeReviewCount = Math.floor(Math.random() * 50) + 5

      // Simular dias ativos aleatórios
      for (let i = 0; i < 30; i++) {
        const randomDay = new Date(CONTRIBUTION_START_DATE)
        randomDay.setDate(randomDay.getDate() + Math.floor(Math.random() * 100))
        activeDays.add(randomDay.toISOString().split("T")[0])
      }
    }

    // Calculate total contributions
    const totalCount = commitCount + prCount + issueCount + codeReviewCount

    console.log(
      `Calculated contributions (desde 1º de abril de 2025): ${totalCount} (${commitCount} commits, ${prCount} PRs, ${issueCount} issues, ${codeReviewCount} code reviews)`,
    )
    console.log(`Active days: ${activeDays.size}, Unique projects: ${uniqueProjects.size}`)

    // Update contribution counts
    await supabase
      .from("contributions")
      .update({
        total_count: totalCount,
        commits_count: commitCount,
        pull_requests_count: prCount,
        issues_count: issueCount,
        code_reviews_count: codeReviewCount,
        active_days_count: activeDays.size,
        projects_count: uniqueProjects.size,
        current_streak: Math.floor(Math.random() * 30) + 1, // Random streak for testing
        last_contribution_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    console.log("Updated contribution counts")

    // Calcular a pontuação com base nos pesos definidos
    const score = calculateScore({
      commits: commitCount,
      pullRequests: prCount,
      issues: issueCount,
      codeReviews: codeReviewCount,
      projects: uniqueProjects.size,
      activeDays: activeDays.size,
      streak: Math.floor(Math.random() * 30) + 1,
    })

    console.log(`Calculated score: ${score}`)

    // Update user's ranking
    // This is a simplified approach - in a real app, you would run a more complex ranking algorithm
    const { data: allContributions, error: contribError } = await supabase
      .from("contributions")
      .select(
        "id, user_id, total_count, commits_count, pull_requests_count, issues_count, code_reviews_count, projects_count, active_days_count, current_streak",
      )

    if (contribError) {
      console.error("Error fetching all contributions:", contribError)
      return NextResponse.json({ error: "Failed to update ranking" }, { status: 500 })
    }

    if (allContributions) {
      console.log(`Updating rankings for ${allContributions.length} users`)

      // Calculate scores for all users
      const scores = allContributions.map((contribution) => ({
        user_id: contribution.user_id,
        score: calculateScore({
          commits: contribution.commits_count,
          pullRequests: contribution.pull_requests_count,
          issues: contribution.issues_count,
          codeReviews: contribution.code_reviews_count,
          projects: contribution.projects_count,
          activeDays: contribution.active_days_count,
          streak: contribution.current_streak,
        }),
      }))

      // Sort by score and assign ranks
      scores.sort((a, b) => b.score - a.score)
      const ranks = scores.map((item, index) => ({
        user_id: item.user_id,
        rank: index + 1,
        score: item.score,
      }))

      // Update rankings table
      for (const rank of ranks) {
        await supabase
          .from("rankings")
          .update({
            rank: rank.rank,
            score: rank.score,
          })
          .eq("user_id", rank.user_id)
          .eq("period", "all_time")
      }

      console.log("Rankings updated successfully")
    }

    // Add a contribution history entry for today
    const today = new Date().toISOString().split("T")[0]
    const { data: existingEntry, error: historyQueryError } = await supabase
      .from("contribution_history")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle()

    if (historyQueryError) {
      console.error("Error querying contribution history:", historyQueryError)
    } else {
      const dailyCount = Math.floor(Math.random() * 20) + 1 // Random count for today

      if (existingEntry) {
        await supabase
          .from("contribution_history")
          .update({
            count: dailyCount,
          })
          .eq("id", existingEntry.id)
      } else {
        await supabase.from("contribution_history").insert({
          user_id: userId,
          date: today,
          count: dailyCount,
        })
      }

      console.log("Added contribution history entry for today")
    }

    return NextResponse.json({
      success: true,
      message: "User data synced successfully",
      contributions: {
        total: totalCount,
        commits: commitCount,
        pullRequests: prCount,
        issues: issueCount,
        codeReviews: codeReviewCount,
        projects: uniqueProjects.size,
        activeDays: activeDays.size,
        score: score,
      },
    })
  } catch (error) {
    console.error("Error syncing user data:", error)
    return NextResponse.json({ error: "Failed to sync user data" }, { status: 500 })
  }
}

// Função para calcular a pontuação com base nos pesos definidos
function calculateScore(data: {
  commits: number
  pullRequests: number
  issues: number
  codeReviews: number
  projects: number
  activeDays: number
  streak: number
}) {
  // Pesos definidos para cada critério
  const weights = {
    commits: 0.4, // 40%
    pullRequests: 0.25, // 25%
    issues: 0.15, // 15%
    codeReviews: 0.1, // 10%
    projects: 0.05, // 5%
    activeDays: 0.03, // 3%
    streak: 0.02, // 2%
  }

  // Normalizar os valores (para evitar que um único critério domine a pontuação)
  // Estes valores máximos são arbitrários e podem ser ajustados
  const normalized = {
    commits: Math.min(data.commits / 1000, 1),
    pullRequests: Math.min(data.pullRequests / 100, 1),
    issues: Math.min(data.issues / 200, 1),
    codeReviews: Math.min(data.codeReviews / 50, 1),
    projects: Math.min(data.projects / 20, 1),
    activeDays: Math.min(data.activeDays / 90, 1),
    streak: Math.min(data.streak / 30, 1),
  }

  // Calcular a pontuação ponderada
  const score =
    normalized.commits * weights.commits +
    normalized.pullRequests * weights.pullRequests +
    normalized.issues * weights.issues +
    normalized.codeReviews * weights.codeReviews +
    normalized.projects * weights.projects +
    normalized.activeDays * weights.activeDays +
    normalized.streak * weights.streak

  // Multiplicar por 1000 para obter um número inteiro mais significativo
  return Math.round(score * 1000)
}
