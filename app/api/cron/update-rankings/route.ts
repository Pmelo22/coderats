import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Data de início para contabilizar contribuições
const CONTRIBUTION_START_DATE = new Date("2025-04-01T00:00:00Z")

// This endpoint should be called by a cron job every day
export async function GET(request: Request) {
  // Check for a secret key to prevent unauthorized access
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()

    // Get all users
    const { data: users, error } = await supabase.from("users").select("id, username, github_id")

    if (error) {
      throw error
    }

    // Update each user's contributions
    for (const user of users || []) {
      try {
        // In a real app, you would use the GitHub API to fetch contribution data
        // For this example, we'll simulate it with random data
        const commitCount = Math.floor(Math.random() * 1000) + 100
        const prCount = Math.floor(Math.random() * 100) + 10
        const issueCount = Math.floor(Math.random() * 200) + 20
        const codeReviewCount = Math.floor(Math.random() * 50) + 5
        const projectsCount = Math.floor(Math.random() * 20) + 1
        const activeDaysCount = Math.floor(Math.random() * 90) + 1
        const streak = Math.floor(Math.random() * 30) + 1

        const totalCount = commitCount + prCount + issueCount + codeReviewCount

        // Update contribution counts
        await supabase
          .from("contributions")
          .update({
            total_count: totalCount,
            commits_count: commitCount,
            pull_requests_count: prCount,
            issues_count: issueCount,
            code_reviews_count: codeReviewCount,
            projects_count: projectsCount,
            active_days_count: activeDaysCount,
            current_streak: streak,
            last_contribution_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        // Add a contribution history entry for today
        const today = new Date().toISOString().split("T")[0]

        // Verificar se a data de hoje é posterior a 1º de abril de 2025
        const todayDate = new Date(today)
        if (todayDate >= CONTRIBUTION_START_DATE) {
          const { data: existingEntry } = await supabase
            .from("contribution_history")
            .select("id")
            .eq("user_id", user.id)
            .eq("date", today)
            .single()

          if (existingEntry) {
            await supabase
              .from("contribution_history")
              .update({
                count: Math.floor(Math.random() * 20),
              })
              .eq("id", existingEntry.id)
          } else {
            await supabase.from("contribution_history").insert({
              user_id: user.id,
              date: today,
              count: Math.floor(Math.random() * 20),
            })
          }
        }
      } catch (userError) {
        console.error(`Error updating user ${user.username}:`, userError)
        // Continue with other users
      }
    }

    // Update rankings
    const { data: allContributions } = await supabase
      .from("contributions")
      .select(
        "id, user_id, total_count, commits_count, pull_requests_count, issues_count, code_reviews_count, projects_count, active_days_count, current_streak",
      )

    if (allContributions) {
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
    }

    return NextResponse.json({
      success: true,
      message: "Rankings updated successfully",
      timestamp: new Date().toISOString(),
      contributionStartDate: CONTRIBUTION_START_DATE.toISOString(),
    })
  } catch (error) {
    console.error("Error updating rankings:", error)
    return NextResponse.json({ error: "Failed to update rankings" }, { status: 500 })
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
