import axios from 'axios'

export interface BitbucketStats {
  commits: number
  pull_requests: number
  issues: number
  repositories: number
}

export class BitbucketService {
  private token: string
  private username: string

  constructor(token: string, username: string) {
    this.token = token
    this.username = username
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    }
  }

  async getUserStats(): Promise<BitbucketStats> {
    try {
      // Buscar repositórios do usuário
      const reposResponse = await axios.get(
        `https://api.bitbucket.org/2.0/repositories/${this.username}`,
        { headers: this.getHeaders() }
      )
      
      const repositories = reposResponse.data.values || []
      let totalCommits = 0
      let totalPullRequests = 0
      let totalIssues = 0

      // Para cada repositório, buscar estatísticas
      for (const repo of repositories.slice(0, 20)) { // Limitar para não sobrecarregar
        try {
          // Buscar commits
          const commitsResponse = await axios.get(
            `https://api.bitbucket.org/2.0/repositories/${repo.full_name}/commits`,
            { 
              headers: this.getHeaders(),
              params: {
                pagelen: 100
              }
            }
          )
          
          // Filtrar commits do usuário atual
          const userCommits = commitsResponse.data.values?.filter((commit: any) => 
            commit.author?.user?.username === this.username
          ) || []
          totalCommits += userCommits.length

          // Buscar pull requests
          const prsResponse = await axios.get(
            `https://api.bitbucket.org/2.0/repositories/${repo.full_name}/pullrequests`,
            { 
              headers: this.getHeaders(),
              params: {
                state: 'ALL',
                pagelen: 100
              }
            }
          )
          
          // Filtrar PRs do usuário atual
          const userPRs = prsResponse.data.values?.filter((pr: any) => 
            pr.author?.username === this.username
          ) || []
          totalPullRequests += userPRs.length

          // Buscar issues
          const issuesResponse = await axios.get(
            `https://api.bitbucket.org/2.0/repositories/${repo.full_name}/issues`,
            { 
              headers: this.getHeaders(),
              params: {
                pagelen: 100
              }
            }
          )
          
          // Filtrar issues do usuário atual
          const userIssues = issuesResponse.data.values?.filter((issue: any) => 
            issue.reporter?.username === this.username
          ) || []
          totalIssues += userIssues.length

        } catch (error) {
          console.warn(`Erro ao buscar dados do repositório ${repo.full_name}:`, error)
        }
      }

      return {
        commits: totalCommits,
        pull_requests: totalPullRequests,
        issues: totalIssues,
        repositories: repositories.length
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do Bitbucket:', error)
      throw error
    }
  }

  async getUserInfo() {
    try {
      const response = await axios.get(
        'https://api.bitbucket.org/2.0/user',
        { headers: this.getHeaders() }
      )
      
      return response.data
    } catch (error) {
      console.error('Erro ao buscar informações do usuário Bitbucket:', error)
      throw error
    }
  }

  async getUserEmail() {
    try {
      const response = await axios.get(
        'https://api.bitbucket.org/2.0/user/emails',
        { headers: this.getHeaders() }
      )
      
      const emails = response.data.values || []
      const primaryEmail = emails.find((email: any) => email.is_primary && email.is_confirmed)
      
      return primaryEmail?.email || null
    } catch (error) {
      console.error('Erro ao buscar email do usuário Bitbucket:', error)
      return null
    }
  }
}
