// Utilidade para gerenciar sessões de usuário multi-plataforma
import { Session } from "next-auth"

export interface UserSessionData {
  email: string
  name: string
  image: string
  primaryProvider: string
  connectedPlatforms: string[]
  platforms: {
    [key: string]: {
      username: string
      commits: number
      pull_requests: number
      issues: number
      repositories: number
      last_updated: string
    }
  }
}

export function mergeUserSessions(
  existingSession: UserSessionData | null,
  newSession: Session,
  provider: string
): UserSessionData {
  const baseData: UserSessionData = {
    email: newSession.user.email!,
    name: newSession.user.name || "",
    image: newSession.user.image || "",
    primaryProvider: existingSession?.primaryProvider || provider,
    connectedPlatforms: existingSession?.connectedPlatforms || [],
    platforms: existingSession?.platforms || {}
  }

  // Adicionar nova plataforma se não existir
  if (!baseData.connectedPlatforms.includes(provider)) {
    baseData.connectedPlatforms.push(provider)
  }

  // Preservar dados existentes da plataforma ou criar novos
  if (!baseData.platforms[provider]) {
    baseData.platforms[provider] = {
      username: newSession.user.username || newSession.user.login || newSession.user.name || "",
      commits: 0,
      pull_requests: 0,
      issues: 0,
      repositories: 0,
      last_updated: new Date().toISOString()
    }
  }

  return baseData
}

export function getDisplayData(sessionData: UserSessionData, currentProvider: string) {
  // Se estiver logado com a plataforma primária, mostrar dados dela
  // Caso contrário, preservar dados da plataforma primária
  const primaryPlatform = sessionData.platforms[sessionData.primaryProvider]
  const currentPlatform = sessionData.platforms[currentProvider]

  return {
    name: primaryPlatform?.username || sessionData.name,
    image: sessionData.image,
    username: currentPlatform?.username || primaryPlatform?.username,
    connectedPlatforms: sessionData.connectedPlatforms,
    platforms: sessionData.platforms
  }
}
