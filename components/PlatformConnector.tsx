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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<any>({})

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserPlatforms()
    }
  }, [session])

  const fetchUserPlatforms = async () => {
    try {
      const response = await fetch('/api/user/platforms')
      const data = await response.json()
      
      if (data.connectedPlatforms) {
        setConnectedPlatforms(data.connectedPlatforms)
      }
      if (data.platforms) {
        setPlatforms(data.platforms)
      }
    } catch (error) {
      console.error('Erro ao buscar plataformas:', error)
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await signIn('github')
    } catch (error) {
      setError('Erro ao conectar plataforma')
      console.error('Erro ao conectar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setError('Não é possível desconectar o GitHub, pois é a plataforma principal')
  }

  if (!session) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400 mb-4">Faça login com o GitHub para começar</p>
          <Button onClick={handleConnect} className="bg-gray-900 hover:bg-gray-800 border border-gray-600">
            <Github className="h-4 w-4 mr-2" />
            Login com GitHub
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/50 border-green-800">
          <AlertDescription className="text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      {/* Plataforma Principal (GitHub) */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Github className="h-5 w-5" />
            Plataforma Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              O GitHub é sua plataforma principal.
            </p>
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-gray-300" />
                <div>
                  <p className="text-white font-medium">GitHub</p>
                  <p className="text-gray-400 text-sm">{session.user?.name}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                Principal
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
