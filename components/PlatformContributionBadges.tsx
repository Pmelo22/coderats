'use client'

import { Badge } from "@/components/ui/badge"
import { Github } from "lucide-react"

interface PlatformContribution {
  commits: number
  pull_requests: number
  issues: number
  repositories: number
}

interface PlatformContributionBadgesProps {
  platforms?: { [key: string]: PlatformContribution }
  showDetails?: boolean
  compact?: boolean
}

export default function PlatformContributionBadges({ 
  platforms = {}, 
  showDetails = false, 
  compact = false 
}: PlatformContributionBadgesProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="h-3 w-3" />
      default:
        return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'bg-gray-700 hover:bg-gray-600 border-gray-500'
      default:
        return 'bg-gray-600/20 hover:bg-gray-600/30 border-gray-500/50'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'GitHub'
      default:
        return platform
    }
  }

  const connectedPlatforms = Object.keys(platforms).filter(
    platform => platform === 'github' && platforms[platform] && Object.values(platforms[platform]).some(value => value > 0)
  )

  if (connectedPlatforms.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2">
      {connectedPlatforms.map(platform => (
        <Badge key={platform} className={getPlatformColor(platform)}>
          {getPlatformIcon(platform)}
          <span className="ml-1">{getPlatformName(platform)}</span>
        </Badge>
      ))}
    </div>
  )
}
