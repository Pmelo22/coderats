// lib/github/getUserStats.ts
export interface UserStats {
    commits: number
    pullRequests: number
    issues: number
    codeReviews: number
    diversity: number
    activeDays: number
}

export async function getGitHubUserStats(username: string, token: string): Promise<UserStats> {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    }

    const cloakHeaders = {
        ...headers,
        Accept: 'application/vnd.github.cloak-preview',
    }

    const [commitsRes, prRes, issuesRes, reviewsRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/search/commits?q=author:${username}`, { headers: cloakHeaders }),
        fetch(`https://api.github.com/search/issues?q=type:pr+author:${username}`, { headers }),
        fetch(`https://api.github.com/search/issues?q=type:issue+author:${username}`, { headers }),
        fetch(`https://api.github.com/search/issues?q=reviewed-by:${username}`, { headers }),
        fetch(`https://api.github.com/users/${username}/events`, { headers }),
    ])

    const [commitsData, prData, issuesData, reviewsData, eventsData] = await Promise.all([
        commitsRes.json(),
        prRes.json(),
        issuesRes.json(),
        reviewsRes.json(),
        eventsRes.json(),
    ])
    console.log("Commits total:", commitsData.total_count);
    console.log("Pull Requests total:", prData.total_count);
    console.log("Issues total:", issuesData.total_count);
    console.log("Code Reviews total:", reviewsData.total_count);
    console.log("Events total:", eventsData.length);
    
    const activeDays = new Set(eventsData.map((event: any) => event.created_at.slice(0, 10)))
    const diversity = new Set(eventsData.map((event: any) => event.repo.name))

    return {
        commits: commitsData.total_count || 0,
        pullRequests: prData.total_count || 0,
        issues: issuesData.total_count || 0,
        codeReviews: reviewsData.total_count || 0,
        diversity: diversity.size,
        activeDays: activeDays.size,
    }
}
