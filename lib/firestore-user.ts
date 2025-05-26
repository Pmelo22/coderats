import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url?: string;
  score: number;
  rank: number;
  commits: number;
  pull_requests: number;
  issues: number;
  code_reviews: number;
  projects: number;
  active_days: number;
  updated_at?: string;
}

function calculateScore(data: {
  commits: number;
  pull_requests: number;
  issues: number;
  code_reviews: number;
  projects: number;
  active_days: number;
}): number {
  // Exemplo de cálculo de score (ajuste conforme sua regra)
  return (
    data.commits * 4 +
    data.pull_requests * 2.5 +
    data.issues * 1.5 +
    data.code_reviews * 1 +
    data.projects * 0.5 +
    data.active_days * 0.3
  )
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const usersSnapshot = await getDocs(collection(db, "users"))
  const users: LeaderboardUser[] = []
  usersSnapshot.forEach((docSnap) => {
    const d = docSnap.data()
    const contrib = d.contributions?.[0] || {}
    const user: LeaderboardUser = {
      id: d.id,
      username: d.username || d.name || "-",
      avatar_url: d.avatar_url,
      commits: contrib.commits_count || 0,
      pull_requests: contrib.pull_requests_count || 0,
      issues: contrib.issues_count || 0,
      code_reviews: contrib.code_reviews_count || 0,
      projects: contrib.projects_count || 0,
      active_days: contrib.active_days_count || 0,
      score: 0, // será calculado abaixo
      rank: 0, // será atribuído depois
      updated_at: d.lastSyncedAt || d.created_at,
    }
    user.score = Math.round(calculateScore(user))
    users.push(user)
  })
  // Ordena por score desc e atribui rank
  users.sort((a, b) => b.score - a.score)
  users.forEach((u, i) => (u.rank = i + 1))
  return users
}
