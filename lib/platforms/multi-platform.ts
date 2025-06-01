import { Octokit } from '@octokit/rest'
import { GitLabService, GitLabStats } from './gitlab'
import { BitbucketService, BitbucketStats } from './bitbucket'

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
  gitlab_token?: string
  bitbucket_token?: string
}

export class MultiPlatformService {
  private tokens: PlatformTokens
  private username: { [key: string]: string }

  constructor(tokens: PlatformTokens, usernames: { [key: string]: string }) {
    this.tokens = tokens
    this.username = usernames
  }

  async getUnifiedContributions(): Promise<UserContributions> {
    const contributions: UserContributions = {
      total_commits: 0,
      total_prs: 0,
      total_issues: 0,
      total_repositories: 0,
      platforms: {}
    }

    // GitHub
    if (this.tokens.github_token && this.username.github) {
      try {
        const githubStats = await this.getGitHubStats()
        contributions.platforms.github = githubStats
        contributions.total_commits += githubStats.commits
        contributions.total_prs += githubStats.prs
        contributions.total_issues += githubStats.issues
        contributions.total_repositories += githubStats.repositories
      } catch (error) {
        console.error('Erro ao buscar dados do GitHub:', error)
      }
    }

    // GitLab
    if (this.tokens.gitlab_token && this.username.gitlab) {
      try {
        const gitlabStats = await this.getGitLabStats()
        contributions.platforms.gitlab = {
          commits: gitlabStats.commits,
          prs: gitlabStats.merge_requests,
          issues: gitlabStats.issues,
          repositories: gitlabStats.projects
        }
        contributions.total_commits += gitlabStats.commits
        contributions.total_prs += gitlabStats.merge_requests
        contributions.total_issues += gitlabStats.issues
        contributions.total_repositories += gitlabStats.projects
      } catch (error) {
        console.error('Erro ao buscar dados do GitLab:', error)
      }
    }

    // Bitbucket
    if (this.tokens.bitbucket_token && this.username.bitbucket) {
      try {
        const bitbucketStats = await this.getBitbucketStats()
        contributions.platforms.bitbucket = {
          commits: bitbucketStats.commits,
          prs: bitbucketStats.pull_requests,
          issues: bitbucketStats.issues,
          repositories: bitbucketStats.repositories
        }
        contributions.total_commits += bitbucketStats.commits
        contributions.total_prs += bitbucketStats.pull_requests
        contributions.total_issues += bitbucketStats.issues
        contributions.total_repositories += bitbucketStats.repositories
      } catch (error) {
        console.error('Erro ao buscar dados do Bitbucket:', error)
      }
    }

    return contributions
  }

  private async getGitHubStats() {
    const octokit = new Octokit({
      auth: this.tokens.github_token
    })

    // Buscar repositórios
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      type: 'all',
      per_page: 100
    })

    let totalCommits = 0
    let totalPRs = 0
    let totalIssues = 0

    // Para cada repositório, buscar estatísticas
    for (const repo of repos.slice(0, 20)) {
      try {
        // Commits
        const { data: commits } = await octokit.rest.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          author: this.username.github,
          since: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          per_page: 100
        })
        totalCommits += commits.length

        // Pull Requests
        const { data: prs } = await octokit.rest.pulls.list({
          owner: repo.owner.login,
          repo: repo.name,
          state: 'all',
          per_page: 100
        })
        totalPRs += prs.filter(pr => pr.user?.login === this.username.github).length

        // Issues
        const { data: issues } = await octokit.rest.issues.listForRepo({
          owner: repo.owner.login,
          repo: repo.name,
          state: 'all',
          creator: this.username.github,
          per_page: 100
        })
        totalIssues += issues.length

      } catch (error) {
        console.warn(`Erro ao buscar dados do repositório ${repo.name}:`, error)
      }
    }

    return {
      commits: totalCommits,
      prs: totalPRs,
      issues: totalIssues,
      repositories: repos.length
    }
  }

  private async getGitLabStats(): Promise<GitLabStats> {
    const gitlabService = new GitLabService(this.tokens.gitlab_token!)
    return await gitlabService.getUserStats(this.username.gitlab)
  }

  private async getBitbucketStats(): Promise<BitbucketStats> {
    const bitbucketService = new BitbucketService(this.tokens.bitbucket_token!, this.username.bitbucket)
    return await bitbucketService.getUserStats()
  }
}
