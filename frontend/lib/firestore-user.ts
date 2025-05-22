// Mock do getLeaderboard para resolver o erro de importação e tipagem
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

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  // Mock de dados
  return [
    {
      id: "1",
      username: "alice",
      avatar_url: "/placeholder.svg",
      score: 1000,
      rank: 1,
      commits: 120,
      pull_requests: 30,
      issues: 10,
      code_reviews: 15,
      projects: 3,
      active_days: 25,
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      username: "bob",
      avatar_url: "/placeholder.svg",
      score: 900,
      rank: 2,
      commits: 100,
      pull_requests: 25,
      issues: 8,
      code_reviews: 10,
      projects: 2,
      active_days: 20,
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      username: "carol",
      avatar_url: "/placeholder.svg",
      score: 800,
      rank: 3,
      commits: 80,
      pull_requests: 20,
      issues: 6,
      code_reviews: 8,
      projects: 2,
      active_days: 15,
      updated_at: new Date().toISOString(),
    },
  ];
}
