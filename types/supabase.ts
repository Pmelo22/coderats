export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          github_id: string
          username: string
          name: string | null
          email: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          location: string | null
          website: string | null
          joined_github_at: string | null
          followers: number
          following: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          github_id: string
          username: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          location?: string | null
          website?: string | null
          joined_github_at?: string | null
          followers?: number
          following?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          github_id?: string
          username?: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          location?: string | null
          website?: string | null
          joined_github_at?: string | null
          followers?: number
          following?: number
          created_at?: string
          updated_at?: string
        }
      }
      contributions: {
        Row: {
          id: number
          user_id: number
          total_count: number
          commits_count: number
          pull_requests_count: number
          issues_count: number
          current_streak: number
          longest_streak: number
          last_contribution_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          total_count?: number
          commits_count?: number
          pull_requests_count?: number
          issues_count?: number
          current_streak?: number
          longest_streak?: number
          last_contribution_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          total_count?: number
          commits_count?: number
          pull_requests_count?: number
          issues_count?: number
          current_streak?: number
          longest_streak?: number
          last_contribution_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      repositories: {
        Row: {
          id: number
          user_id: number
          github_repo_id: string
          name: string
          description: string | null
          language: string | null
          stars_count: number
          forks_count: number
          is_fork: boolean
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          github_repo_id: string
          name: string
          description?: string | null
          language?: string | null
          stars_count?: number
          forks_count?: number
          is_fork?: boolean
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          github_repo_id?: string
          name?: string
          description?: string | null
          language?: string | null
          stars_count?: number
          forks_count?: number
          is_fork?: boolean
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contribution_history: {
        Row: {
          id: number
          user_id: number
          date: string
          count: number
        }
        Insert: {
          id?: number
          user_id: number
          date: string
          count?: number
        }
        Update: {
          id?: number
          user_id?: number
          date?: string
          count?: number
        }
      }
      rankings: {
        Row: {
          id: number
          user_id: number
          rank: number
          score: number
          period: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          rank: number
          score?: number
          period: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          rank?: number
          score?: number
          period?: string
          created_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: number
          github_id: string
          username: string
          name: string | null
          avatar_url: string | null
          contributions: number
          commits: number
          pull_requests: number
          issues: number
          streak: number
          rank: number
        }
      }
    }
    Functions: {
      [_ in string]: never
    }
  }
}
