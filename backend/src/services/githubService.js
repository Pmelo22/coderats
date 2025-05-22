const axios = require('axios');

const GITHUB_API_URL = 'https://api.github.com';

async function fetchUserData(token) {
    const config = {
        headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'coderats-app',
        },
    };

    try {
        // Perfil do usuário
        const userResponse = await axios.get(`${GITHUB_API_URL}/user`, config);
        const user = userResponse.data;
        // Repositórios do usuário
        const reposResponse = await axios.get(`${GITHUB_API_URL}/user/repos?per_page=100&type=owner`, config);
        const repositories = reposResponse.data.map(repo => ({
            repoId: repo.id,
            name: repo.name,
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            createdAt: repo.created_at,
        }));

        // Buscar commits, PRs e issues do usuário em cada repositório
        let commits = [];
        let pullRequests = [];
        let issues = [];
        for (const repo of reposResponse.data) {
            // Commits do usuário
            const commitsRes = await axios.get(`${GITHUB_API_URL}/repos/${user.login}/${repo.name}/commits?author=${user.login}&per_page=100`, config);
            commits.push(...commitsRes.data.map(commit => ({
                commitId: commit.sha,
                message: commit.commit.message,
                date: commit.commit.author.date,
            })));
            // PRs do usuário
            const prsRes = await axios.get(`${GITHUB_API_URL}/repos/${user.login}/${repo.name}/pulls?state=all&per_page=100`, config);
            pullRequests.push(...prsRes.data.filter(pr => pr.user.login === user.login).map(pr => ({
                prId: pr.id,
                title: pr.title,
                url: pr.html_url,
                createdAt: pr.created_at,
                mergedAt: pr.merged_at,
            })));
            // Issues do usuário
            const issuesRes = await axios.get(`${GITHUB_API_URL}/repos/${user.login}/${repo.name}/issues?state=all&per_page=100&creator=${user.login}`, config);
            issues.push(...issuesRes.data.map(issue => ({
                issueId: issue.id,
                title: issue.title,
                url: issue.html_url,
                createdAt: issue.created_at,
                closedAt: issue.closed_at,
            })));
        }

        return {
            githubId: user.id,
            username: user.login,
            profileUrl: user.html_url,
            avatarUrl: user.avatar_url,
            repositories,
            commits,
            pullRequests,
            issues,
            lastUpdated: new Date(),
        };
    } catch (error) {
        throw new Error('Error fetching data from GitHub: ' + error.message);
    }
}

module.exports = {
    fetchUserData,
};