import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore"

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
    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Update each user's contributions (mocked for now)
    for (const user of users) {
      try {
        // Simular dados de contribuição
        const commitCount = Math.floor(Math.random() * 1000) + 100
        const prCount = Math.floor(Math.random() * 100) + 10
        const issueCount = Math.floor(Math.random() * 200) + 20
        const codeReviewCount = Math.floor(Math.random() * 50) + 5
        const projectsCount = Math.floor(Math.random() * 20) + 1
        const activeDaysCount = Math.floor(Math.random() * 90) + 1
        const streak = Math.floor(Math.random() * 30) + 1
        const totalCount = commitCount + prCount + issueCount + codeReviewCount

        // Atualiza/insere contribuições
        await setDoc(doc(db, "contributions", user.id), {
          user_id: user.id,
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
        }, { merge: true })

        // Histórico de contribuição (mock)
        const today = new Date().toISOString().split("T")[0]
        const todayDate = new Date(today)
        if (todayDate >= CONTRIBUTION_START_DATE) {
          await setDoc(doc(db, "contribution_history", `${user.id}_${today}`), {
            user_id: user.id,
            date: today,
            count: Math.floor(Math.random() * 20),
          }, { merge: true })
        }
      } catch (userError) {
        console.error(`Error updating user ${user.id}:`, userError)
      }
    }

    // Atualizar ranking de todos os usuários
    const contribSnapshot = await getDocs(collection(db, "contributions"))
    const allContributions = contribSnapshot.docs.map(doc => doc.data())

    // Calcular score e rank
    const scores = allContributions.map((contribution: any) => ({
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
    scores.sort((a, b) => b.score - a.score)
    const ranks = scores.map((item, index) => ({
      user_id: item.user_id,
      rank: index + 1,
      score: item.score,
    }))

    // Atualiza/insere ranking
    for (const rank of ranks) {
      await setDoc(doc(db, "rankings", rank.user_id), {
        user_id: rank.user_id,
        rank: rank.rank,
        score: rank.score,
        period: "all_time",
        updated_at: new Date().toISOString(),
      }, { merge: true })
    }

    return NextResponse.json({
      success: true,
      message: "Rankings updated successfully (Firestore)",
      timestamp: new Date().toISOString(),
      contributionStartDate: CONTRIBUTION_START_DATE.toISOString(),
    })
  } catch (error) {
    console.error("Error updating rankings:", error)
    return NextResponse.json({ error: "Failed to update rankings" }, { status: 500 })
  }
}

function calculateScore(data: {
  commits: number
  pullRequests: number
  issues: number
  codeReviews: number
  projects: number
  activeDays: number
  streak: number
}) {
  const weights = {
    commits: 0.4,
    pullRequests: 0.25,
    issues: 0.15,
    codeReviews: 0.1,
    projects: 0.05,
    activeDays: 0.03,
    streak: 0.02,
  }
  const normalized = {
    commits: Math.min(data.commits / 1000, 1),
    pullRequests: Math.min(data.pullRequests / 100, 1),
    issues: Math.min(data.issues / 200, 1),
    codeReviews: Math.min(data.codeReviews / 50, 1),
    projects: Math.min(data.projects / 20, 1),
    activeDays: Math.min(data.activeDays / 90, 1),
    streak: Math.min(data.streak / 30, 1),
  }
  const score =
    normalized.commits * weights.commits +
    normalized.pullRequests * weights.pullRequests +
    normalized.issues * weights.issues +
    normalized.codeReviews * weights.codeReviews +
    normalized.projects * weights.projects +
    normalized.activeDays * weights.activeDays +
    normalized.streak * weights.streak
  return Math.round(score * 1000)
}
