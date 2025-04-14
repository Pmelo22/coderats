import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get leaderboard data
    const { data: leaderboard, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("rank", { ascending: true })
      .limit(100)

    if (error) {
      throw error
    }

    // Get last update time
    const { data: lastUpdate } = await supabase
      .from("contributions")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      users: leaderboard || [],
      lastUpdated: lastUpdate?.updated_at || new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching ranking:", error)
    return NextResponse.json({ error: "Failed to fetch ranking data" }, { status: 500 })
  }
}
