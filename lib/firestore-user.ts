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

// ------------------ UpdateUserData Principal ------------------

export async function updateUserData({
  username,
  token,
  avatar_url,
  name,
  force = false,
}: {
  username: string;
  token: string;
  avatar_url?: string;
  name?: string;
  force?: boolean;
}) {
  const userRef = doc(db, "users", username);
  const snapshot = await getDoc(userRef);
  const existing = snapshot.exists() ? snapshot.data() : {};

  const updatedAt = existing.updated_at || null;
  const logs: string[] = existing.refresh_logs || [];

  if (!force && updatedAt && !isOlderThan24Hours(updatedAt)) {
    console.log("⏱️ Atualização automática ignorada (< 24h)");
    return;
  }

  if (force && countRefreshesToday(logs) >= 3) {
    console.warn("🚫 Limite manual atingido para hoje");
    return;
  }

  const stats = await getGitHubUserStats(username, token);
  const score =
    stats.commits * 4 +
    stats.pullRequests * 2.5 +
    stats.issues * 1.5 +
    stats.codeReviews * 1 +
    stats.diversity * 0.5 +
    stats.activeDays * 0.3;

  const now = new Date().toISOString();

  const userData = {
    id: username,
    username,
    avatar_url,
    name,
    score,
    commits: stats.commits,
    pull_requests: stats.pullRequests,
    issues: stats.issues,
    code_reviews: stats.codeReviews,
    projects: stats.diversity,
    active_days: stats.activeDays,
    updated_at: now,
    refresh_logs: force ? [...logs, now] : logs,
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
    };

    user.score = Math.round(calculateScore(user));
    users.push(user);
  });

  users.sort((a, b) => b.score - a.score);
  users.forEach((u, i) => (u.rank = i + 1));

  return users;
}
