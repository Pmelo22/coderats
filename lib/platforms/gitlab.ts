import { Gitlab } from '@gitbeaker/rest'

export interface GitLabStats {
  commits: number
  merge_requests: number
  issues: number
  projects: number
}

export class GitLabService {
  private gitlab: any

  constructor(token: string) {
    this.gitlab = new Gitlab({
      token,
      host: 'https://gitlab.com'
    })
  }

  async getUserStats(username: string): Promise<GitLabStats> {
    try {
      const user = await this.gitlab.Users.show(username)
      
      // Buscar projetos do usuário
      const projects = await this.gitlab.Projects.all({
        membership: true,
        simple: true,
        perPage: 100
      })

      // Buscar estatísticas de commits, MRs e issues
      let totalCommits = 0
      let totalMergeRequests = 0
      let totalIssues = 0

      // Para cada projeto, buscar estatísticas
      for (const project of projects.slice(0, 20)) { // Limitar para não sobrecarregar
        try {
          // Buscar commits do usuário no projeto
          const commits = await this.gitlab.Commits.all(project.id, {
            author: username,
            since: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Último ano
            perPage: 100
          })
          totalCommits += commits.length

          // Buscar merge requests
          const mergeRequests = await this.gitlab.MergeRequests.all({
            projectId: project.id,
            authorUsername: username,
            state: 'all',
            perPage: 100
          })
          totalMergeRequests += mergeRequests.length

          // Buscar issues
          const issues = await this.gitlab.Issues.all({
            projectId: project.id,
            authorUsername: username,
            state: 'all',
            perPage: 100
          })
          totalIssues += issues.length

        } catch (error) {
          console.warn(`Erro ao buscar dados do projeto ${project.id}:`, error)
        }
      }

      return {
        commits: totalCommits,
        merge_requests: totalMergeRequests,
        issues: totalIssues,
        projects: projects.length
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do GitLab:', error)
      throw error
    }
  }

  async getUserInfo(userId?: string) {
    try {
      const user = userId 
        ? await this.gitlab.Users.show(userId)
        : await this.gitlab.Users.current()
      
      return user
    } catch (error) {
      console.error('Erro ao buscar informações do usuário GitLab:', error)
      throw error
    }
  }
}
