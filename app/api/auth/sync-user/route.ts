import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Octokit } from "@octokit/rest"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

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

      // Initialize contributions record
      const { error: contribError } = await supabase.from("contributions").insert({
        user_id: newUser.id,
        total_count: 0,
        commits_count: 0,
        pull_requests_count: 0,
        issues_count: 0,
        current_streak: 0,
        longest_streak: 0,
      })

      if (contribError) {
        console.error("Error creating contributions record:", contribError)
      }

      // Initialize ranking record
      const { error: rankError } = await supabase.from("rankings").insert({
        user_id: newUser.id,
        rank: 9999, // Placeholder rank until the next ranking update
        score: 0,
        period: "all_time",
      })

      if (rankError) {
        console.error("Error creating ranking record:", rankError)
      }

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: newUser,
      })
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

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      })
    }
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
  }
}
