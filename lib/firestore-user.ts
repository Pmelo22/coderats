import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { getGitHubUserStats } from "@/lib/github/getUserStats";

// ------------------ Interface ------------------

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url?: string;
  email?: string;
  score: number;
  rank: number;
  commits: number;
  pull_requests: number;
  issues: number;
  code_reviews: number;
  projects: number;
  active_days: number;
  updated_at?: string;
  lastRank?: number;
  rankDelta?: number;
  streak?: number;
  isTopCommitter?: boolean;
  isTopPR?: boolean;
  isTopIssue?: boolean;
  isBanned?: boolean;
  bannedAt?: string;
  bannedBy?: string;
  isTopReviewer?: boolean;
  scorePercentage?: number;
  lastSynced?: string;
  
  // Múltiplas plataformas
  connectedPlatforms?: string[];
  platforms?: {
    [key: string]: {
      username: string;
      token?: string;
      commits: number;
      pull_requests: number;
      issues: number;
      repositories: number;
      last_updated?: string;
    }
  };
  
  // Tokens para APIs
  github_token?: string;
  
  
  
  // Usernames por plataforma
  github_username?: string;
  
  
}

// ------------------ Score Cálculo ------------------

function calculateScore(data: LeaderboardUser): number {
  return (
    data.commits * 4 +
    data.pull_requests * 2.5 +
    data.issues * 1.5 +
    data.code_reviews * 1 +
    data.projects * 0.5 +
    data.active_days * 0.3
  );
}

// ------------------ Atualização Condicional ------------------

function isOlderThan24Hours(date: string | Date): boolean {
  const last = new Date(date);
  const now = new Date();
  return now.getTime() - last.getTime() > 24 * 60 * 60 * 1000;
}

function countRefreshesToday(timestamps: string[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return timestamps.filter((ts) => ts.startsWith(today)).length;
}

function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }
  return streak;
}

// ------------------ UpdateUserData Principal ------------------

export async function updateUserData({
  username,
  token,
  avatar_url,
  name,
  email,
  force = false,
}: {
  username: string;
  token: string;
  avatar_url?: string;
  name?: string;
  email?: string;
  force?: boolean;
}){
  const userRef = doc(db, "users", username);
  const snapshot = await getDoc(userRef);
  const existing = snapshot.exists() ? snapshot.data() : {};

  const updatedAt = existing.updated_at || null;
  const logs: string[] = existing.refresh_logs || [];
  const lastRank = existing.rank || existing.lastRank || null;
  const prevStreak = existing.streak || 0;

  if (!force && updatedAt && !isOlderThan24Hours(updatedAt)) {
    console.log("⏱️ Atualização automática ignorada (< 24h)");
    return;
  }

  if (force && countRefreshesToday(logs) >= 3) {
    console.warn("🚫 Limite manual atingido para hoje");
    return;
  }  // HARDCODED: Sempre usar 1° de junho de 2025 às 00:00 horário de Brasília
  const JUNE_FIRST_2025 = '2025-06-01T03:00:00.000Z'; // 03:00 UTC = 00:00 Brasília

  const stats = await getGitHubUserStats(username, token, JUNE_FIRST_2025);
  const score =
    stats.commits * 4 +
    stats.pullRequests * 2.5 +
    stats.issues * 1.5 +
    stats.codeReviews * 1 +
    stats.diversity * 0.5 +
    stats.activeDays * 0.3;

  // Calculate streak from events (if available)
  let streak = prevStreak;
  if (stats.contributionDates) {
    streak = calculateStreak(stats.contributionDates);
  }

  const now = new Date().toISOString();
  const userData = {
    id: username,
    username,
    avatar_url,
    name,
    email,
    score,
    commits: stats.commits,
    pull_requests: stats.pullRequests,
    issues: stats.issues,
    code_reviews: stats.codeReviews,
    projects: stats.diversity,
    active_days: stats.activeDays,
    updated_at: now,
    refresh_logs: force ? [...logs, now] : logs,
    lastRank: lastRank,
    streak,
  };

  console.log("📦 Salvando usuário no Firestore:", userData);
  await setDoc(userRef, userData, { merge: true });
}

// ------------------ Ranking ------------------

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const snapshot = await getDocs(collection(db, "users"));
  const users: LeaderboardUser[] = [];

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    const user: LeaderboardUser = {
      id: d.id,
      username: d.username || d.name || "-",
      avatar_url: d.avatar_url,
      commits: d.commits || 0,
      pull_requests: d.pull_requests || 0,
      issues: d.issues || 0,
      code_reviews: d.code_reviews || 0,
      projects: d.projects || d.diversity || 0,
      active_days: d.active_days || 0,
      score: 0,
      rank: 0,
      updated_at: d.updated_at || d.lastSyncedAt || d.created_at,
      lastRank: d.lastRank,
      streak: d.streak,
    };
    user.score = Math.round(calculateScore(user));
    users.push(user);
  });

  users.sort((a, b) => b.score - a.score);
  users.forEach((u, i) => (u.rank = i + 1));

  // Calculate rankDelta, scorePercentage, isTopX, lastSynced
  const topUser = users[0];
  let topCommit = 0, topPR = 0, topIssue = 0, topReview = 0;
  users.forEach(u => {
    if (u.commits > topCommit) topCommit = u.commits;
    if (u.pull_requests > topPR) topPR = u.pull_requests;
    if (u.issues > topIssue) topIssue = u.issues;
    if (u.code_reviews > topReview) topReview = u.code_reviews;
  });
  users.forEach(u => {
    u.rankDelta = u.lastRank ? u.lastRank - u.rank : 0;
    u.scorePercentage = topUser ? Math.round((u.score / topUser.score) * 100) : 100;
    u.isTopCommitter = u.commits === topCommit && topCommit > 0;
    u.isTopPR = u.pull_requests === topPR && topPR > 0;
    u.isTopIssue = u.issues === topIssue && topIssue > 0;
    u.isTopReviewer = u.code_reviews === topReview && topReview > 0;
    u.lastSynced = u.updated_at;
  });

  return users;
}
