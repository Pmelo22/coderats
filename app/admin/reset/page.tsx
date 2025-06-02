"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Clock,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  History,
  ArrowLeft,
  Play,
  Pause
} from "lucide-react"

interface ResetConfig {
  nextResetDate: string
  resetEnabled: boolean
  autoReset: boolean
  resetMessage: string
  lastResetDate?: string
  resetHistory?: Array<{
    date: string
    usersReset: number
    type: string
    executedBy: string
  }>
}

interface ResetFormData {
  resetDate: string
  resetTime: string
  resetEnabled: boolean
  autoReset: boolean
  resetMessage: string
}

export default function AdminResetPage() {
  const [config, setConfig] = useState<ResetConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const [formData, setFormData] = useState<ResetFormData>({
    resetDate: "",
    resetTime: "",
    resetEnabled: true,
    autoReset: false,
    resetMessage: "Sistema será resetado automaticamente"
  })

  const router = useRouter()

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    
    loadConfig()
    
    // Atualizar hora atual a cada segundo
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        console.error("Token de admin ausente. Faça login novamente.")
        setMessage({ type: "error", text: "Token de admin ausente. Faça login novamente." })
        setLoading(false)
        return
      }
      
      const response = await fetch("/api/admin/reset-config", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar configuração")
      }

      const data = await response.json()
      setConfig(data.config)
      
      // Preencher formulário com dados atuais
      if (data.config.nextResetDate) {
        const resetDate = new Date(data.config.nextResetDate)
        setFormData({
          resetDate: resetDate.toISOString().split('T')[0],
          resetTime: resetDate.toTimeString().slice(0, 5),
          resetEnabled: data.config.resetEnabled,
          autoReset: data.config.autoReset,
          resetMessage: data.config.resetMessage
        })
      }
      
    } catch (error) {
      console.error("Erro ao carregar configuração:", error)
      setMessage({ type: "error", text: "Erro ao carregar configuração" })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Combinar data e hora
      const resetDateTime = new Date(`${formData.resetDate}T${formData.resetTime}:00.000Z`)
      
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/reset-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nextResetDate: resetDateTime.toISOString(),
          resetEnabled: formData.resetEnabled,
          autoReset: formData.autoReset,
          resetMessage: formData.resetMessage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar configuração")
      }

      setConfig(data.config)
      setMessage({ type: "success", text: "Configuração salva com sucesso!" })
      
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Erro ao salvar configuração" 
      })
    } finally {
      setSaving(false)
    }
  }

  const executeReset = async () => {
    if (!confirm("⚠️ ATENÇÃO: Esta ação irá resetar todas as contribuições e scores dos usuários. Esta ação é IRREVERSÍVEL. Deseja continuar?")) {
      return
    }
    
    if (!confirm("Você tem CERTEZA ABSOLUTA? Todos os dados de contribuições serão perdidos permanentemente.")) {
      return
    }

    setExecuting(true)
    setMessage(null)

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/reset-config?action=execute-reset", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao executar reset")
      }

      setMessage({ 
        type: "success", 
        text: `Reset executado com sucesso! ${data.resetCount} usuários resetados.` 
      })
      
      loadConfig() // Recarregar configuração
      
    } catch (error) {
      console.error("Erro ao executar reset:", error)
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Erro ao executar reset" 
      })
    } finally {
      setExecuting(false)
    }
  }

  const getTimeUntilReset = () => {
    if (!config?.nextResetDate) return null
    
    const resetDate = new Date(config.nextResetDate)
    const diff = resetDate.getTime() - currentTime.getTime()
    
    if (diff <= 0) {
      return "Reset disponível!"
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando configurações...</span>
          </div>
        </div>
      </div>
    )
  }

  const timeUntilReset = getTimeUntilReset()
  const canExecuteReset = config?.nextResetDate && new Date(config.nextResetDate) <= currentTime

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-orange-500" />
              Sistema de Reset
            </h1>
            <p className="text-muted-foreground">
              Configure quando os dados de contribuições serão resetados
            </p>
          </div>
        </div>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === "success" ? "border-green-500" : "border-red-500"}`}>
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Próximo Reset</Label>
                <p className="text-lg font-mono">
                  {config?.nextResetDate ? formatDate(config.nextResetDate) : "Não definido"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tempo Restante</Label>
                <p className="text-lg font-mono">
                  {timeUntilReset || "Não definido"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant={config?.resetEnabled ? "default" : "secondary"}>
                    {config?.resetEnabled ? "Ativo" : "Inativo"}
                  </Badge>
                  {config?.autoReset && (
                    <Badge variant="outline">Auto Reset</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Último Reset</Label>
                <p className="text-sm">
                  {config?.lastResetDate ? formatDate(config.lastResetDate) : "Nunca"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurar Reset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resetDate">Data do Reset</Label>
                <Input
                  id="resetDate"
                  type="date"
                  value={formData.resetDate}
                  onChange={(e) => setFormData({ ...formData, resetDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="resetTime">Horário do Reset (Brasília)</Label>
                <Input
                  id="resetTime"
                  type="time"
                  value={formData.resetTime}
                  onChange={(e) => setFormData({ ...formData, resetTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resetMessage">Mensagem do Reset</Label>
              <Textarea
                id="resetMessage"
                value={formData.resetMessage}
                onChange={(e) => setFormData({ ...formData, resetMessage: e.target.value })}
                placeholder="Mensagem que será exibida sobre o reset"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.resetEnabled}
                  onChange={(e) => setFormData({ ...formData, resetEnabled: e.target.checked })}
                  className="rounded"
                />
                <span>Reset Habilitado</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.autoReset}
                  onChange={(e) => setFormData({ ...formData, autoReset: e.target.checked })}
                  className="rounded"
                />
                <span>Reset Automático</span>
              </label>
            </div>

            <Button onClick={saveConfig} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h3 className="font-semibold text-red-800 mb-2">Reset Manual Imediato</h3>
              <p className="text-sm text-red-700 mb-4">
                Esta ação irá resetar imediatamente todos os dados de contribuições e scores dos usuários. 
                <strong> Esta ação é irreversível!</strong>
              </p>
              
              <Button 
                onClick={executeReset} 
                disabled={executing}
                variant="destructive"
                className="w-full"
              >
                {executing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executando Reset...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Executar Reset Agora
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        {config?.resetHistory && config.resetHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Histórico de Resets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config.resetHistory
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((reset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatDate(reset.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {reset.usersReset} usuários resetados • {reset.type} • por {reset.executedBy}
                        </p>
                      </div>
                      <Badge variant="outline">{reset.type}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}