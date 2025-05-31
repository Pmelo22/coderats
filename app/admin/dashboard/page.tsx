"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Mail, 
  RefreshCw, 
  Shield, 
  Ban, 
  CheckCircle, 
  XCircle,
  Search,
  LogOut,
  Activity,
  TrendingUp,
  Database,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Settings
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  totalContributions: number
}

interface AdminUser {
  id: string
  username: string
  avatar_url: string
  score: number
  rank: number
  isBanned?: boolean
  updated_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  // Estados para gerenciamento de avisos
  const [notices, setNotices] = useState([])
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    message: "",
    type: "info",
    location: "home"
  })
  const [editingNotice, setEditingNotice] = useState<string | null>(null)
  
  // Estados para sistema de reset
  const [resetInfo, setResetInfo] = useState<any>(null)
  
  const router = useRouter()
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    loadDashboardData()
    loadNotices()
    loadResetInfo()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error("Acesso negado")
      }

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()

      setStats(statsData)
      setUsers(usersData)
    } catch (err) {
      localStorage.removeItem("adminToken")
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  const handleBanUser = async (userId: string, ban: boolean) => {
    setActionLoading(userId)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, ban })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isBanned: ban } : user
        ))
        setMessage({ 
          type: "success", 
          text: `Usuário ${ban ? "banido" : "desbanido"} com sucesso` 
        })
      } else {
        throw new Error("Erro ao atualizar usuário")
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao atualizar usuário" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      setMessage({ type: "error", text: "Preencha todos os campos do email" })
      return
    }

    setActionLoading("email")
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(emailForm)
      })

      if (response.ok) {
        setEmailForm({ subject: "", message: "" })
        setMessage({ type: "success", text: "Emails enviados com sucesso!" })
      } else {
        throw new Error("Erro ao enviar emails")
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao enviar emails" })
    } finally {
      setActionLoading(null)
    }
  }
  const handleRefreshAllData = async () => {
    setActionLoading("refresh")
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/refresh-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        await loadDashboardData()
        setMessage({ type: "success", text: "Dados atualizados com sucesso!" })
      } else {
        throw new Error("Erro ao atualizar dados")
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao atualizar dados" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMigrateEmails = async () => {
    setActionLoading("migrate")
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/migrate-emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      const result = await response.json()
      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: `Migração de emails concluída! Total: ${result.stats.total}, Atualizados: ${result.stats.updated}, Ignorados: ${result.stats.skipped}, Erros: ${result.stats.errors}` 
        })
        await loadDashboardData() // Reload data
      } else {
        setMessage({ type: "error", text: `Erro: ${result.error}` })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao migrar emails" })
    } finally {
      setActionLoading(null)
    }  }

  // Funções para gerenciamento de avisos
  const loadNotices = async () => {
    try {
      const response = await fetch('/api/admin/notices')
      const data = await response.json()
      if (data.success) {
        setNotices(data.notices)
      }
    } catch (error) {
      console.error('Erro ao carregar avisos:', error)
    }
  }

  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.message) {
      setMessage({ type: "error", text: "Título e mensagem são obrigatórios" })
      return
    }

    setActionLoading("createNotice")
    try {
      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...noticeForm,
          isActive: true
        })
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Aviso criado com sucesso!" })
        setNoticeForm({ title: "", message: "", type: "info", location: "home" })
        await loadNotices()
      } else {
        throw new Error("Erro ao criar aviso")
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao criar aviso" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleNotice = async (id: string, isActive: boolean) => {
    setActionLoading(id)
    try {
      const response = await fetch('/api/admin/notices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, isActive: !isActive })
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Aviso atualizado com sucesso!" })
        await loadNotices()
      } else {
        throw new Error("Erro ao atualizar aviso")
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao atualizar aviso" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return

    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/notices?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Aviso excluído com sucesso!" })
        await loadNotices()
      } else {
        throw new Error("Erro ao excluir aviso")
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao excluir aviso" })
    } finally {
      setActionLoading(null)
    }
  }

  // Funções para sistema de reset
  const loadResetInfo = async () => {
    try {
      const response = await fetch('/api/admin/reset-system')
      const data = await response.json()
      setResetInfo(data)
    } catch (error) {
      console.error('Erro ao carregar informações de reset:', error)
    }
  }

  const handleExecuteReset = async () => {
    if (!confirm("ATENÇÃO: Isso irá zerar todas as estatísticas dos usuários. Esta ação é irreversível. Tem certeza?")) return

    setActionLoading("reset")
    try {
      const response = await fetch('/api/admin/reset-system', {
        method: 'POST'
      })

      const result = await response.json()
      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: `Reset executado com sucesso! ${result.resetCount} usuários foram resetados.` 
        })
        await loadResetInfo()
        await loadDashboardData()
      } else {
        setMessage({ type: "error", text: result.message || "Erro ao executar reset" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao executar reset do sistema" })
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-white border-gray-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={`mb-6 ${message.type === "success" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}>
            <AlertDescription className={message.type === "success" ? "text-green-400" : "text-red-400"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Usuários</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Usuários Banidos</p>
                    <p className="text-2xl font-bold text-white">{stats.bannedUsers}</p>
                  </div>
                  <Ban className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Contribuições</p>
                    <p className="text-2xl font-bold text-white">{stats.totalContributions}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
              Gerenciar Usuários
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-blue-600">
              Enviar Emails
            </TabsTrigger>
            <TabsTrigger value="notices" className="data-[state=active]:bg-blue-600">
              Avisos
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-blue-600">
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Gerenciamento de Usuários</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img 
                          src={user.avatar_url} 
                          alt={user.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="text-white font-medium">{user.username}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Rank #{user.rank}</span>
                            <span>•</span>
                            <span>Score: {user.score}</span>
                            <span>•</span>
                            <span>Atualizado: {new Date(user.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.isBanned ? (
                          <Badge variant="destructive">Banido</Badge>
                        ) : (
                          <Badge variant="secondary">Ativo</Badge>
                        )}
                        <Button
                          size="sm"
                          variant={user.isBanned ? "default" : "destructive"}
                          onClick={() => handleBanUser(user.id, !user.isBanned)}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : user.isBanned ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {user.isBanned ? "Desbanir" : "Banir"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Enviar Email para Todos os Usuários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white">Assunto</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Assunto do email..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={emailForm.message}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                    placeholder="Mensagem do email..."
                  />
                </div>
                <Button 
                  onClick={handleSendEmail}
                  disabled={actionLoading === "email"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {actionLoading === "email" ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar para Todos
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices">
            <div className="space-y-6">
              {/* Create Notice Form */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Criar Novo Aviso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="noticeTitle" className="text-white">Título</Label>
                      <Input
                        id="noticeTitle"
                        value={noticeForm.title}
                        onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Título do aviso..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noticeType" className="text-white">Tipo</Label>
                      <Select
                        value={noticeForm.type}
                        onValueChange={(value) => setNoticeForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="info" className="text-white">Informação</SelectItem>
                          <SelectItem value="warning" className="text-white">Aviso</SelectItem>
                          <SelectItem value="success" className="text-white">Sucesso</SelectItem>
                          <SelectItem value="error" className="text-white">Erro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noticeLocation" className="text-white">Localização</Label>
                    <Select
                      value={noticeForm.location}
                      onValueChange={(value) => setNoticeForm(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Selecione onde exibir" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="home" className="text-white">Página Inicial</SelectItem>
                        <SelectItem value="ranking" className="text-white">Ranking</SelectItem>
                        <SelectItem value="both" className="text-white">Ambas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noticeMessage" className="text-white">Mensagem</Label>
                    <Textarea
                      id="noticeMessage"
                      value={noticeForm.message}
                      onChange={(e) => setNoticeForm(prev => ({ ...prev, message: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                      placeholder="Mensagem do aviso..."
                    />
                  </div>
                  <Button 
                    onClick={handleCreateNotice}
                    disabled={actionLoading === "createNotice"}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {actionLoading === "createNotice" ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Aviso
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Notices List */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Avisos Existentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notices.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">Nenhum aviso encontrado</p>
                    ) : (
                      notices.map((notice: any) => (
                        <div key={notice.id} className="p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-white font-medium">{notice.title}</h3>
                                <Badge 
                                  variant={notice.type === 'error' ? 'destructive' : 
                                          notice.type === 'warning' ? 'secondary' :
                                          notice.type === 'success' ? 'default' : 'outline'}
                                >
                                  {notice.type}
                                </Badge>
                                <Badge variant="outline">
                                  {notice.location === 'both' ? 'Home & Ranking' : 
                                   notice.location === 'home' ? 'Página Inicial' : 'Ranking'}
                                </Badge>
                                <Badge variant={notice.isActive ? 'default' : 'secondary'}>
                                  {notice.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                              <p className="text-gray-300 text-sm">{notice.message}</p>
                              <p className="text-gray-500 text-xs mt-2">
                                Criado em: {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={notice.isActive ? "secondary" : "default"}
                                onClick={() => handleToggleNotice(notice.id, notice.isActive)}
                                disabled={actionLoading === notice.id}
                              >
                                {actionLoading === notice.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : notice.isActive ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Ativar
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteNotice(notice.id)}
                                disabled={actionLoading === notice.id}
                              >
                                {actionLoading === notice.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>          {/* System Tab */}
          <TabsContent value="system">
            <div className="space-y-6">
              {/* Reset System */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Sistema de Reset - Junho 2025
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resetInfo && (
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Data do Reset</p>
                          <p className="text-white font-medium">1 de Junho de 2025, 00:00 (Brasil)</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <Badge variant={resetInfo.shouldReset ? "destructive" : "default"}>
                            {resetInfo.shouldReset ? "Reset Pendente" : "Aguardando Data"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Dias Restantes</p>
                          <p className="text-white font-medium">
                            {resetInfo.daysUntilReset > 0 ? `${resetInfo.daysUntilReset} dias` : "Reset disponível"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Usuários que serão resetados</p>
                          <p className="text-white font-medium">{resetInfo.usersToReset}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-600 pt-4">
                        <h4 className="text-white font-medium mb-2">O que será resetado:</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Total de commits</li>
                          <li>• Total de Pull Requests</li>
                          <li>• Total de Issues</li>
                          <li>• Pontuação geral</li>
                          <li>• Ranking</li>
                        </ul>
                        
                        <h4 className="text-white font-medium mb-2 mt-4">O que será preservado:</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Nome e dados pessoais</li>
                          <li>• Email</li>
                          <li>• Login do GitHub</li>
                          <li>• Foto de perfil</li>
                        </ul>
                      </div>
                      
                      {resetInfo.shouldReset && (
                        <div className="border-t border-gray-600 pt-4">
                          <Alert className="border-red-500/50 bg-red-500/10 mb-4">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-400">
                              <strong>ATENÇÃO:</strong> O reset está programado para ser executado automaticamente. 
                              Você pode executá-lo manualmente agora se necessário.
                            </AlertDescription>
                          </Alert>
                          
                          <Button 
                            onClick={handleExecuteReset}
                            disabled={actionLoading === "reset"}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {actionLoading === "reset" ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Executando Reset...
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Executar Reset Manualmente
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Operations */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Operações do Sistema
                  </CardTitle>
                </CardHeader>                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Atualizar Dados de Todos os Usuários</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Esta operação irá atualizar as contribuições e estatísticas de todos os usuários ativos.
                    </p>
                    <Button 
                      onClick={handleRefreshAllData}
                      disabled={actionLoading === "refresh"}
                      variant="secondary"
                    >
                      {actionLoading === "refresh" ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Atualizar Todos os Dados
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Migrar Emails dos Usuários</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Esta operação irá buscar e atualizar os emails dos usuários existentes via GitHub API. 
                      Necessário para o sistema de email funcionar corretamente.
                    </p>
                    <Button 
                      onClick={handleMigrateEmails}
                      disabled={actionLoading === "migrate"}
                      variant="secondary"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {actionLoading === "migrate" ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Migrando...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Migrar Emails                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
