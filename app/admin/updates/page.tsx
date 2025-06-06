'use client'

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Database,
  Users,
  GitCommit,
  Activity,
  Zap,
  Settings
} from "lucide-react"

interface SystemUpdate {
  id: string
  type: 'data_refresh' | 'system_update' | 'backup' | 'maintenance'
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startedAt?: string
  completedAt?: string
  duration?: number
  details?: any
}

interface UpdateStats {
  totalUsers: number
  activeUsers: number
  totalCommits: number
  lastDataRefresh: string
  systemUptime: number
  databaseSize: string
  lastBackup: string
}

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<SystemUpdate[]>([])
  const [stats, setStats] = useState<UpdateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeOperations, setActiveOperations] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    loadUpdatesData()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadUpdatesData, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const loadUpdatesData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      
      // Load system stats
      const statsResponse = await fetch("/api/admin/system/stats", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
      
      // Load recent updates/operations
      const updatesResponse = await fetch("/api/admin/system/updates", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json()
        setUpdates(updatesData.updates || [])
      }
      
    } catch (error) {
      console.error('Error loading updates data:', error)
      if (loading) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações de atualizações.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const executeSystemOperation = async (operationType: string, operationTitle: string) => {
    const operationId = `${operationType}_${Date.now()}`
    setActiveOperations(prev => new Set([...prev, operationType]))
    
    // Add pending operation to UI
    const newUpdate: SystemUpdate = {
      id: operationId,
      type: operationType as any,
      title: operationTitle,
      description: `Executando ${operationTitle.toLowerCase()}...`,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString()
    }
    
    setUpdates(prev => [newUpdate, ...prev])
    
    toast({
      title: `${operationTitle} iniciado`,
      description: "A operação foi iniciada. Acompanhe o progresso abaixo.",
    })

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/system/operation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          operation: operationType,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update operation status
        setUpdates(prev => prev.map(update => 
          update.id === operationId 
            ? {
                ...update,
                status: 'completed',
                progress: 100,
                completedAt: new Date().toISOString(),
                duration: Date.now() - new Date(update.startedAt!).getTime(),
                details: result
              }
            : update
        ))

        toast({
          variant: "success",
          title: `${operationTitle} concluído`,
          description: result.message || "Operação executada com sucesso.",
        })

        // Refresh data after operation
        await loadUpdatesData()
        
      } else {
        throw new Error(`Falha na operação: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error executing ${operationType}:`, error)
      
      // Update operation status to failed
      setUpdates(prev => prev.map(update => 
        update.id === operationId 
          ? {
              ...update,
              status: 'failed',
              completedAt: new Date().toISOString(),
              duration: Date.now() - new Date(update.startedAt!).getTime()
            }
          : update
      ))

      toast({
        variant: "destructive",
        title: `Erro em ${operationTitle}`,
        description: `Não foi possível executar a operação. Tente novamente.`,
      })
    } finally {
      setActiveOperations(prev => {
        const newSet = new Set(prev)
        newSet.delete(operationType)
        return newSet
      })
    }
  }

  const refreshAllData = () => executeSystemOperation('data_refresh', 'Atualização completa dos dados')
  const refreshRanking = () => executeSystemOperation('ranking_refresh', 'Atualização do ranking')
  const createBackup = () => executeSystemOperation('backup', 'Backup do sistema')
  const systemMaintenance = () => executeSystemOperation('maintenance', 'Manutenção do sistema')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Carregando dados de atualizações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Atualizações do Sistema</h1>
        <Button onClick={loadUpdatesData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total de Usuários</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
              <div className="text-xs text-blue-600">Ativos: {stats.activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitCommit className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total de Commits</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{stats.totalCommits.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Banco de Dados</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{stats.databaseSize}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">{formatDuration(stats.systemUptime)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="operations" className="w-full">
        <TabsList>
          <TabsTrigger value="operations">Operações do Sistema</TabsTrigger>
          <TabsTrigger value="history">Histórico de Atualizações</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Operações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Atualização de Dados</h3>
                  
                  <Button
                    onClick={refreshAllData}
                    disabled={activeOperations.has('data_refresh')}
                    className="w-full justify-start"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${activeOperations.has('data_refresh') ? 'animate-spin' : ''}`} />
                    {activeOperations.has('data_refresh') ? 'Atualizando todos os dados...' : 'Atualizar todos os dados'}
                  </Button>
                  
                  <Button
                    onClick={refreshRanking}
                    disabled={activeOperations.has('ranking_refresh')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Activity className={`h-4 w-4 mr-2 ${activeOperations.has('ranking_refresh') ? 'animate-spin' : ''}`} />
                    {activeOperations.has('ranking_refresh') ? 'Atualizando ranking...' : 'Atualizar apenas ranking'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Manutenção</h3>
                  
                  <Button
                    onClick={createBackup}
                    disabled={activeOperations.has('backup')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className={`h-4 w-4 mr-2 ${activeOperations.has('backup') ? 'animate-spin' : ''}`} />
                    {activeOperations.has('backup') ? 'Criando backup...' : 'Criar backup'}
                  </Button>
                  
                  <Button
                    onClick={systemMaintenance}
                    disabled={activeOperations.has('maintenance')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Settings className={`h-4 w-4 mr-2 ${activeOperations.has('maintenance') ? 'animate-spin' : ''}`} />
                    {activeOperations.has('maintenance') ? 'Executando manutenção...' : 'Manutenção do sistema'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Histórico de Operações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {updates.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma operação recente</p>
                ) : (
                  updates.map((update) => (
                    <div key={update.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(update.status)}
                        <div>
                          <div className="font-medium">{update.title}</div>
                          <div className="text-sm text-gray-500">{update.description}</div>
                          {update.status === 'running' && update.progress > 0 && (
                            <Progress value={update.progress} className="w-48 mt-2" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(update.status)}>
                          {update.status}
                        </Badge>
                        {update.duration && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDuration(update.duration)}
                          </div>
                        )}
                        {update.startedAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(update.startedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
