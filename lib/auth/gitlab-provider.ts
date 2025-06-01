import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

export interface GitLabProfile {
  id: number
  username: string
  name: string
  email: string
  avatar_url: string
  state: string
  web_url: string
  created_at: string
  bio: string | null
  public_email: string | null
  location: string | null
  skype: string
  linkedin: string
  twitter: string
  website_url: string
  organization: string | null
}

export default function GitLabProvider(
  options: OAuthUserConfig<GitLabProfile>
): OAuthConfig<GitLabProfile> {
  return {
    id: "gitlab",
    name: "GitLab",
    type: "oauth",
    authorization: {
      url: "https://gitlab.com/oauth/authorize",
      params: {
        scope: "read_user read_api read_repository",
        response_type: "code",
      },
    },
    token: "https://gitlab.com/oauth/token",
    userinfo: "https://gitlab.com/api/v4/user",    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    profile(profile: GitLabProfile) {
      return {
        id: profile.id.toString(),
        name: profile.name,
        email: profile.email,
        image: profile.avatar_url,
        username: profile.username,
        web_url: profile.web_url,
      }
    },
    ...options,
  }
}
