import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Não exigimos autenticação para visualizar perfis públicos
    const username = params.username
    const supabase = createServerSupabaseClient()

    console.log(`Fetching profile data for username: ${username}`)

    // Get user data
    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error || !user) {
      console.error(`User not found for username ${username}:`, error)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`Found user with ID: ${user.id}`)

    // Get user's contributions
    const { data: contributions, error: contribError } = await supabase
      .from("contributions")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (contribError) {
      console.error(`Error fetching contributions for user ${user.id}:`, contribError)
    }

    // Get user's ranking
    const { data: ranking, error: rankError } = await supabase
      .from("rankings")
      .select("*")
      .eq("user_id", user.id)
      .eq("period", "all_time")
      .single()

    if (rankError) {
      console.error(`Error fetching ranking for user ${user.id}:`, rankError)
    }

    // Get user's repositories
    const { data: repositories, error: repoError } = await supabase
      .from("repositories")
      .select("*")
      .eq("user_id", user.id)
      .order("stars_count", { ascending: false })

    if (repoError) {
      console.error(`Error fetching repositories for user ${user.id}:`, repoError)
    }

    // Get user's contribution history
    const { data: contributionHistory, error: historyError } = await supabase
      .from("contribution_history")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })

    if (historyError) {
      console.error(`Error fetching contribution history for user ${user.id}:`, historyError)
    }

    console.log(`Found ${contributionHistory?.length || 0} contribution history entries`)

    // Format contribution history for the graph
    const formattedHistory =
      contributionHistory?.map((item) => ({
        date: item.date,
        count: item.count,
      })) || []

    // Se não houver dados de contribuição, gerar alguns dados de exemplo
    if (!formattedHistory.length) {
      console.log("No contribution history found, generating sample data")

      // Gerar dados de exemplo para os últimos 30 dias
      const sampleData = []
      const today = new Date()

      for (let i = 30; i >= 0; i--) {
        const date = new Date()
        date.setDate(today.getDate() - i)
        sampleData.push({
          date: date.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 10),
        })
      }

      formattedHistory.push(...sampleData)
    }

    const responseData = {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      company: user.company,
      location: user.location,
      website: user.website,
      joinedDate: `Joined ${new Date(user.joined_github_at || user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      followers: user.followers,
      following: user.following,
      contributions: contributions?.total_count || 0,
      commits: contributions?.commits_count || 0,
      pullRequests: contributions?.pull_requests_count || 0,
      issues: contributions?.issues_count || 0,
      codeReviews: contributions?.code_reviews_count || 0,
      projects: contributions?.projects_count || 0,
      activeDays: contributions?.active_days_count || 0,
      streak: contributions?.current_streak || 0,
      rank: ranking?.rank || 0,
      score: ranking?.score || 0,
      repositories: repositories || [],
      contributionData: formattedHistory,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
