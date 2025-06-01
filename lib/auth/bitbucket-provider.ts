import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

export interface BitbucketProfile {
  uuid: string
  username: string
  display_name: string
  account_id: string
  type: string
  links: {
    avatar: {
      href: string
    }
    html: {
      href: string
    }
  }
  created_on: string
  website: string | null
  location: string | null
}

export interface BitbucketEmail {
  email: string
  is_primary: boolean
  is_confirmed: boolean
  type: string
}

export default function BitbucketProvider(
  options: OAuthUserConfig<BitbucketProfile>
): OAuthConfig<BitbucketProfile> {
  return {
    id: "bitbucket",
    name: "Bitbucket",
    type: "oauth",
    authorization: {
      url: "https://bitbucket.org/site/oauth2/authorize",
      params: {
        scope: "account repositories",
        response_type: "code",
      },
    },
    token: "https://bitbucket.org/site/oauth2/access_token",
    userinfo: "https://api.bitbucket.org/2.0/user",
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },    profile(profile: BitbucketProfile) {
      return {
        id: profile.uuid,
        name: profile.display_name,
        email: null, // Email needs to be fetched separately
        image: profile.links.avatar.href,
        username: profile.username,
        account_id: profile.account_id,
      }
    },
    ...options,
  }
}
