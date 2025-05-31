'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Plus,
  Github,
  GitlabIcon as GitLab,
  Code2,
  Info,
  RotateCcw
} from "lucide-react"

interface PlatformConnection {
  platform: string
  username: string
  token: string
}

interface ConnectedPlatform {
  username: string
  commits: number
  pull_requests: number
  issues: number
  repositories: number
  last_updated?: string
}

export default function PlatformConnector() {
  const { data: session } = useSession()
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<{ [key: string]: ConnectedPlatform }>({})
  const [loading, setLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (session) {
      loadConnectedPlatforms()
    }
  }, [session])
  const loadConnectedPlatforms = async () => {
    try {
      const response = await fetch('/api/platforms/connect')
      const data = await response.json()
      
      let platforms = data.platforms || {}
      let connectedPlatforms = data.connectedPlatforms || []
      
      // Se o usuário está logado via qualquer OAuth, considerá-lo como conectado
      if (session?.provider && session?.user) {
        const currentProvider = session.provider
        
        if (!connectedPlatforms.includes(currentProvider)) {
          connectedPlatforms.push(currentProvider)
        }
        
        // Adicionar dados básicos da plataforma atual se não existirem
        if (!platforms[currentProvider]) {
          platforms[currentProvider] = {
            username: session.user.username || session.user.login || session.user.name || 'Usuário',
            commits: 0,
            pull_requests: 0,
            issues: 0,
            repositories: 0,
            last_updated: new Date().toISOString()
          }
        }
      }
      
      setConnectedPlatforms(connectedPlatforms)
      setPlatforms(platforms)
    } catch (error) {
      console.error('Erro ao carregar plataformas conectadas:', error)
    }
  }

  const handleSyncData = async () => {
    setSyncLoading(true)
    try {
      const response = await fetch('/api/platforms/sync', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        await loadConnectedPlatforms()
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao sincronizar dados" })
    } finally {
      setSyncLoading(false)
    }
  }
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="h-5 w-5" />
      case 'gitlab':
        return <GitLab className="h-5 w-5" />
      case 'bitbucket':
        return <Code2 className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'bg-gray-800 hover:bg-gray-700'
      case 'gitlab':
        return 'bg-orange-600 hover:bg-orange-700'
      case 'bitbucket':
        return 'bg-blue-600 hover:bg-blue-700'
      default:
        return 'bg-gray-600 hover:bg-gray-700'
    }
  }
  if (!session) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400 mb-4">Faça login para conectar múltiplas plataformas</p>
          <Button onClick={() => signIn('github')} className="bg-gray-900 hover:bg-gray-800 border border-gray-600">
            <Github className="h-4 w-4 mr-2" />
            Login com GitHub
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <Alert className={`${message.type === "success" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}>
          <AlertDescription className={message.type === "success" ? "text-green-400" : "text-red-400"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Plataformas Conectadas */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Plataformas Conectadas</CardTitle>
            {connectedPlatforms.length > 0 && (
              <Button
                onClick={handleSyncData}
                disabled={syncLoading}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-200 hover:bg-gray-700"
              >                {syncLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Sincronizar Dados
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>          {connectedPlatforms.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Nenhuma plataforma adicional conectada. Conecte GitLab e Bitbucket para enriquecer seu perfil.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedPlatforms.map((platform) => {
                const platformData = platforms[platform]
                return (
                  <div key={platform} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getPlatformIcon(platform)}
                      <h3 className="text-white font-medium">{getPlatformName(platform)}</h3>
                      <Badge variant="default" className="ml-auto">
                        Conectado
                      </Badge>
                    </div>
                    {platformData && (
                      <div className="space-y-1 text-sm text-gray-300">
                        <p>@{platformData.username}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-center p-2 bg-gray-600 rounded">
                            <div className="font-medium text-white">{platformData.commits}</div>
                            <div className="text-xs">Commits</div>
                          </div>
                          <div className="text-center p-2 bg-gray-600 rounded">
                            <div className="font-medium text-white">{platformData.pull_requests}</div>
                            <div className="text-xs">PRs</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>      {/* Conectar GitLab */}
      {!connectedPlatforms.includes('gitlab') && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GitLab className="h-5 w-5" />
              Conectar GitLab
            </CardTitle>
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Conecte sua conta do GitLab para incluir suas contribuições no ranking.
              </p>
              <Button 
                onClick={() => signIn('gitlab')}
                className="bg-orange-600 hover:bg-orange-700 border border-orange-500 w-full"
              >
                <GitLab className="h-4 w-4 mr-2" />
                Conectar via OAuth
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conectar GitHub */}
      {!connectedPlatforms.includes('github') && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Github className="h-5 w-5" />
              Conectar GitHub
            </CardTitle>
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Conecte sua conta do GitHub para incluir suas contribuições no ranking.
              </p>
              <Button 
                onClick={() => signIn('github')}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 w-full"
              >
                <Github className="h-4 w-4 mr-2" />
                Conectar via OAuth
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conectar Bitbucket */}
      {!connectedPlatforms.includes('bitbucket') && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>            <CardTitle className="text-white flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Conectar Bitbucket
            </CardTitle>
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Conecte sua conta do Bitbucket para incluir suas contribuições no ranking.
              </p>
              <Button 
                onClick={() => signIn('bitbucket')}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Code2 className="h-4 w-4 mr-2" />
                Conectar via OAuth
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
