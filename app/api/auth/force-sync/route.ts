import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Octokit } from "@octokit/rest"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = session.accessToken

    if (!accessToken) {
      console.error("No access token found in session")
      return NextResponse.json({ error: "No GitHub access token found" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const octokit = new Octokit({ auth: accessToken })

    // Get GitHub user data
    const { data: githubUser } = await octokit.users.getAuthenticated()

    if (!githubUser) {
      return NextResponse.json({ error: "Failed to fetch GitHub user data" }, { status: 500 })
    }

    console.log("GitHub user data fetched:", githubUser.login)

    // Check if user exists in database
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("github_id", githubUser.id.toString())
      .single()

    if (queryError && queryError.code !== "PGRST116") {
      console.error("Error querying user:", queryError)
      return NextResponse.json({ error: "Database query error" }, { status: 500 })
    }

    let userId = existingUser?.id

    // If user doesn't exist, create a new user
    if (!existingUser) {
      console.log("Creating new user:", githubUser.login)

      // Insert user into database
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          github_id: githubUser.id.toString(),
          username: githubUser.login,
          name: githubUser.name || null,
          email: githubUser.email || null,
          avatar_url: githubUser.avatar_url,
          bio: githubUser.bio || null,
          company: githubUser.company || null,
          location: githubUser.location || null,
          website: githubUser.blog || null,
          joined_github_at: githubUser.created_at,
          followers: githubUser.followers,
          following: githubUser.following,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating user:", insertError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }

      console.log("User created successfully:", newUser.id)
      userId = newUser.id

      // Initialize contributions record
      const { error: contribError } = await supabase.from("contributions").insert({
        user_id: userId,
        total_count: 0,
        commits_count: 0,
        pull_requests_count: 0,
        issues_count: 0,
        code_reviews_count: 0,
        projects_count: 0,
        active_days_count: 0,
        current_streak: 0,
        longest_streak: 0,
      })

      if (contribError) {
        console.error("Error creating contributions record:", contribError)
      }

      // Initialize ranking record
      const { error: rankError } = await supabase.from("rankings").insert({
        user_id: userId,
        rank: 9999, // Placeholder rank until the next ranking update
        score: 0,
        period: "all_time",
      })

      if (rankError) {
        console.error("Error creating ranking record:", rankError)
      }
    } else {
      console.log("Updating existing user:", existingUser.username)

      // Update existing user data
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          name: githubUser.name || existingUser.name,
          email: githubUser.email || existingUser.email,
          avatar_url: githubUser.avatar_url,
          bio: githubUser.bio || existingUser.bio,
          company: githubUser.company || existingUser.company,
          location: githubUser.location || existingUser.location,
          website: githubUser.blog || existingUser.website,
          followers: githubUser.followers,
          following: githubUser.following,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating user:", updateError)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
      }
    }

    // Agora, vamos gerar alguns dados de contribuição de exemplo
    if (userId) {
      // Verificar se já existem contribuições
      const { data: existingContributions } = await supabase
        .from("contributions")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (existingContributions) {
        // Atualizar contribuições existentes com dados de exemplo
        await supabase
          .from("contributions")
          .update({
            total_count: Math.floor(Math.random() * 1000) + 100,
            commits_count: Math.floor(Math.random() * 800) + 50,
            pull_requests_count: Math.floor(Math.random() * 100) + 10,
            issues_count: Math.floor(Math.random() * 200) + 20,
            code_reviews_count: Math.floor(Math.random() * 50) + 5,
            projects_count: Math.floor(Math.random() * 20) + 1,
            active_days_count: Math.floor(Math.random() * 90) + 1,
            current_streak: Math.floor(Math.random() * 30) + 1,
            last_contribution_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }

      // Gerar histórico de contribuições para os últimos 365 dias
      const today = new Date()
      const contributionHistory = []

      for (let i = 365; i >= 0; i--) {
        const date = new Date()
        date.setDate(today.getDate() - i)
        const dateString = date.toISOString().split("T")[0]

        // Gerar um número aleatório de contribuições (mais provável ter dias sem contribuições)
        const count = Math.random() > 0.6 ? Math.floor(Math.random() * 10) + 1 : 0

        if (count > 0) {
          contributionHistory.push({
            user_id: userId,
            date: dateString,
            count: count,
          })
        }
      }

      // Limpar histórico de contribuições existente
      await supabase.from("contribution_history").delete().eq("user_id", userId)

      // Inserir novo histórico de contribuições
      if (contributionHistory.length > 0) {
        const { error: historyError } = await supabase.from("contribution_history").insert(contributionHistory)

        if (historyError) {
          console.error("Error inserting contribution history:", historyError)
        }
      }

      // Atualizar ranking
      const { error: rankError } = await supabase
        .from("rankings")
        .update({
          score: Math.floor(Math.random() * 1000),
          rank: Math.floor(Math.random() * 100) + 1,
        })
        .eq("user_id", userId)
        .eq("period", "all_time")

      if (rankError) {
        console.error("Error updating ranking:", rankError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "User data synchronized successfully",
      userId: userId,
    })
  } catch (error) {
    console.error("Error in force-sync:", error)
    return NextResponse.json({ error: "Failed to synchronize user data" }, { status: 500 })
  }
}
