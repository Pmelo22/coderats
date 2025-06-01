'use client'

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Github, GitlabIcon as GitLab, Code2 } from "lucide-react"

interface PlatformContribution {
  commits: number
  pull_requests: number
  issues: number
  repositories: number
}

interface PlatformContributionBadgesProps {
  platforms?: {
    [key: string]: PlatformContribution
  }
  showDetails?: boolean
  compact?: boolean
}

export default function PlatformContributionBadges({ 
  platforms = {}, 
  showDetails = false, 
  compact = false 
}: PlatformContributionBadgesProps) {  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="h-3 w-3" />
      case 'gitlab':
        return <GitLab className="h-3 w-3" />
      case 'bitbucket':
        return <Code2 className="h-3 w-3" />
      default:
        return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'bg-gray-700 hover:bg-gray-600 border-gray-500'
      case 'gitlab':
        return 'bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/50 text-orange-300'
      case 'bitbucket':
        return 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50 text-blue-300'
      default:
        return 'bg-gray-600/20 hover:bg-gray-600/30 border-gray-500/50'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'GitHub'
      case 'gitlab':
        return 'GitLab'
      case 'bitbucket':
        return 'Bitbucket'
      default:
        return platform
    }
  }

  const connectedPlatforms = Object.keys(platforms).filter(
    platform => platforms[platform] && Object.values(platforms[platform]).some(value => value > 0)
  )

  if (connectedPlatforms.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className="flex gap-1">
        {connectedPlatforms.map(platform => (
          <TooltipProvider key={platform}>
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className={`px-1.5 py-0.5 text-xs ${getPlatformColor(platform)}`}
                >
                  {getPlatformIcon(platform)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-medium">{getPlatformName(platform)}</div>
                  <div className="text-gray-300">
                    {platforms[platform].commits} commits • {platforms[platform].pull_requests} PRs
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {connectedPlatforms.map(platform => {
        const contribution = platforms[platform]
        const totalContributions = contribution.commits + contribution.pull_requests + contribution.issues
        
        return (
          <TooltipProvider key={platform}>
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs ${getPlatformColor(platform)}`}
                >
                  {getPlatformIcon(platform)}
                  <span>{getPlatformName(platform)}</span>
                  {showDetails && (
                    <span className="ml-1 text-xs opacity-75">
                      {totalContributions}
                    </span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <div className="font-medium">{getPlatformName(platform)}</div>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>Commits: {contribution.commits}</div>
                    <div>PRs: {contribution.pull_requests}</div>
                    <div>Issues: {contribution.issues}</div>
                    <div>Repos: {contribution.repositories}</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}
