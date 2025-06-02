// lib/github/getUserStats.ts
export interface UserStats {
    streak: number
    commits: number
    pullRequests: number
    issues: number
    codeReviews: number
    diversity: number
    activeDays: number
    contributionDates?: string[]
}

export async function getGitHubUserStats(username: string, token: string, resetDate?: string): Promise<UserStats> {
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
    }

    const cloakHeaders = {
        ...headers,
        Accept: 'application/vnd.github.cloak-preview',
    }

    // Se existe uma data de reset, usar ela como filtro para commits e issues/PRs
    const resetDateTime = resetDate ? new Date(resetDate) : null
    const dateFilter = resetDateTime ? resetDateTime.toISOString().split('T')[0] : null
    
    const commitsQuery = dateFilter 
        ? `author:${username}+committer-date:>=${dateFilter}`
        : `author:${username}`
    
    const prQuery = dateFilter
        ? `type:pr+author:${username}+created:>=${dateFilter}`
        : `type:pr+author:${username}`
    
    const issuesQuery = dateFilter
        ? `type:issue+author:${username}+created:>=${dateFilter}`
        : `type:issue+author:${username}`
    
    const reviewsQuery = dateFilter
        ? `reviewed-by:${username}+created:>=${dateFilter}`
        : `reviewed-by:${username}`

    const [commitsRes, prRes, issuesRes, reviewsRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/search/commits?q=${encodeURIComponent(commitsQuery)}`, { headers: cloakHeaders }),
        fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(prQuery)}`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(issuesQuery)}`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(reviewsQuery)}`, { headers }),
        fetch(`https://api.github.com/users/${username}/events`, { headers }),
    ])

    const [commitsData, prData, issuesData, reviewsData, eventsData] = await Promise.all([
        commitsRes.json(),
        prRes.json(),
        issuesRes.json(),
        reviewsRes.json(),
        eventsRes.json(),
    ])
    
    // Filtrar eventos por data de reset se especificada
    const filteredEvents = resetDateTime 
        ? eventsData.filter((event: any) => new Date(event.created_at) >= resetDateTime)
        : eventsData
    
    console.log("Commits total:", commitsData.total_count);
    console.log("Pull Requests total:", prData.total_count);
    console.log("Issues total:", issuesData.total_count);
    console.log("Code Reviews total:", reviewsData.total_count);
    console.log("Events total (filtered):", filteredEvents.length);
    if (resetDate) {
        console.log("Data de reset aplicada:", resetDate);
    }
    
    const activeDays = new Set(filteredEvents.map((event: any) => event.created_at.slice(0, 10)))
    const diversity = new Set(filteredEvents.map((event: any) => event.repo?.name).filter(Boolean))
    const contributionDates = Array.from(activeDays).map(String);

    return {
        streak: 0, // TODO: Calculate actual streak if needed
        commits: commitsData.total_count || 0,
        pullRequests: prData.total_count || 0,
        issues: issuesData.total_count || 0,
        codeReviews: reviewsData.total_count || 0,
        diversity: diversity.size,
        activeDays: activeDays.size,
        contributionDates,
    }
}
