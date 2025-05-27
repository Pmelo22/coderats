// lib/github/getUserStats.ts
export interface UserStats {
  commits: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
  diversity: number;
  activeDays: number;
}

export async function getUserStats(username: string, accessToken: string): Promise<UserStats> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    const [commitsRes, prRes, issuesRes, reviewsRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/search/commits?q=author:${username}`, {
        headers: { ...headers, Accept: 'application/vnd.github.cloak-preview' },
      }),
      fetch(`https://api.github.com/search/issues?q=type:pr+author:${username}`, { headers }),
      fetch(`https://api.github.com/search/issues?q=type:issue+author:${username}`, { headers }),
      fetch(`https://api.github.com/search/issues?q=reviewed-by:${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/events`, { headers }),
    ]);

    const [commitsData, prData, issuesData, reviewsData, eventsData] = await Promise.all([
      commitsRes.json(),
      prRes.json(),
      issuesRes.json(),
      reviewsRes.json(),
      eventsRes.json(),
    ]);

    const activeDays = new Set(
      eventsData
        .filter((event: any) => event.created_at)
        .map((event: any) => event.created_at.slice(0, 10))
    );

    const diversity = new Set(
      eventsData
        .filter((event: any) => event.repo?.name)
        .map((event: any) => event.repo.name)
    );

    return {
      commits: commitsData.total_count || 0,
      pullRequests: prData.total_count || 0,
      issues: issuesData.total_count || 0,
      codeReviews: reviewsData.total_count || 0,
      diversity: diversity.size,
      activeDays: activeDays.size,
    };
  } catch (err) {
    console.error('Erro ao buscar dados do GitHub:', err);
    return {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      codeReviews: 0,
      diversity: 0,
      activeDays: 0,
    };
  }
}
