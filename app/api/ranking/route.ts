import { NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/firestore-user"

// TODO: Migrar esta rota para buscar ranking do Firestore.
// Veja lib/firestore-user.ts para funções auxiliares.

export async function GET() {
  try {
    // Busca o ranking no Firestore
    const leaderboard = await getLeaderboard()
    // Para lastUpdated, você pode buscar de uma collection ou usar a data atual
    const lastUpdated = new Date().toISOString()
    return NextResponse.json({
      users: leaderboard || [],
      lastUpdated,
    })
  } catch (error) {
    console.error("Error fetching ranking:", error)
    return NextResponse.json({ error: "Failed to fetch ranking data" }, { status: 500 })
  }
}
