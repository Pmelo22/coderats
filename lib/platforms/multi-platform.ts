import { Octokit } from '@octokit/rest'

export interface UserContributions {
  total_commits: number
  total_prs: number
  total_issues: number
  total_repositories: number
  platforms: {
    [key: string]: {
      commits: number
      prs: number
      issues: number
      repositories: number
    }
  }
}

export interface PlatformTokens {
  github_token?: string
}

export class MultiPlatformService {
  private octokit: Octokit
  private usernames: { [key: string]: string }

  constructor(tokens: PlatformTokens, usernames: { [key: string]: string }) {
    this.usernames = usernames

    if (tokens.github_token) {
      this.octokit = new Octokit({ auth: tokens.github_token })
    } else {
      throw new Error('GitHub token é obrigatório')
    }
  }

  async getUserContributions(): Promise<UserContributions> {
    const contributions: UserContributions = {
      total_commits: 0,
      total_prs: 0,
      total_issues: 0,
      total_repositories: 0,
      platforms: {}
    }

    try {
      // Buscar dados do GitHub (sempre presente)
      const githubStats = await this.getGitHubStats()
      contributions.platforms.github = githubStats
      contributions.total_commits += githubStats.commits
      contributions.total_prs += githubStats.prs
      contributions.total_issues += githubStats.issues
      contributions.total_repositories += githubStats.repositories
      return contributions
    } catch (error) {
      console.error('Erro ao buscar contribuições:', error)
      throw error
    }
  }

  private async getGitHubStats() {
    const username = this.usernames.github
    if (!username) throw new Error('Username do GitHub não fornecido')

    try {
      // Buscar repositórios
      const { data: repos } = await this.octokit.repos.listForUser({
        username,
        per_page: 100
      })

      // Buscar commits
      const { data: commits } = await this.octokit.search.commits({
        q: `author:${username}`,
        per_page: 100
      })

      // Buscar pull requests
      const { data: prs } = await this.octokit.search.issuesAndPullRequests({
        q: `author:${username} is:pr`,
        per_page: 100
      })

      // Buscar issues
      const { data: issues } = await this.octokit.search.issuesAndPullRequests({
        q: `author:${username} is:issue`,
        per_page: 100
      })

      return {
        commits: commits.total_count,
        prs: prs.total_count,
        issues: issues.total_count,
        repositories: repos.length
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do GitHub:', error)
      throw error
    }
  }
}
