"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  Trash2,
  Settings,
  FileText,
  BarChart3,
  PieChart,
  AlertTriangle,
  Clock,
  Download,
  Cpu,
  HardDrive,
  Zap,
  Globe,
  Server,
  Wifi,
  Upload,
  Bell,
  UserCog,
  Key,
  AlertCircle
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import NotificationsPanel from "@/components/admin/NotificationsPanel"
import RoleManagement from "@/components/admin/RoleManagement"
import SecurityMonitoring from "@/components/admin/SecurityMonitoring"
import { NotificationSystem, NotificationTemplates } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

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

interface AnalyticsData {
  summary: {
    totalUsers: number
    activeUsers: number
    bannedUsers: number
    usersLast30Days: number
    usersLast7Days: number
    activeUsersGrowth: number
  }
  contributions: {
    totalCommits: number
    totalPRs: number
    totalIssues: number
    totalCodeReviews: number
    avgCommitsPerUser: number
  }
  topUsers: Array<{
    username: string
    score: number
    commits: number
    pull_requests: number
    issues: number
  }>
  mostActiveUsers: Array<{
    username: string
    commits: number
    avatar_url: string
  }>
  scoreDistribution: {
    "0-100": number
    "101-500": number
    "501-1000": number
    "1001-2000": number
    "2000+": number
  }
}

interface Notice {
  id: string
  title: string
  message: string
  type: string
  location: string
  isActive: boolean
  created_at: string
}

interface AuditLog {
  id: string
  action: string
  adminId: string
  targetId?: string
  targetType?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

interface SystemHealth {
  systemMetrics: {
    cpu: { usage: number; cores: number }
    memory: { used: number; total: number; percentage: number }
    disk: { used: number; total: number; percentage: number }
  }
  apiMetrics: {
    responseTime: number
    errorRate: number
    requestsPerMinute: number
  }
  database: {
    responseTime: number
    activeConnections: number
    status: 'healthy' | 'warning' | 'error'
  }
  github: {
    rateLimit: { remaining: number; total: number; resetTime: string }
    apiStatus: 'healthy' | 'warning' | 'error'
  }
  uptime: {
    seconds: number
    formatted: string
  }
  overallStatus: 'healthy' | 'warning' | 'error'
  lastUpdated: string
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" })
  
  // Estados para gerenciamento de avisos
  const [notices, setNotices] = useState<Notice[]>([])
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    message: "",
    type: "info",
    location: "home"
  })
  const [editingNotice, setEditingNotice] = useState<string | null>(null)
    // Estados para auditoria
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  // Estados para monitoramento do sistema
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [systemMetricsHistory, setSystemMetricsHistory] = useState<{
    timestamps: string[]
    cpu: number[]
    memory: number[]
    disk: number[]
    apiResponseTime: number[]
  }>({
    timestamps: [],
    cpu: [],
    memory: [],
    disk: [],
    apiResponseTime: []
  })
  
  // Estados para importação/restauração
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
    // Novos estados para filtragem de auditoria
  const [auditFilters, setAuditFilters] = useState({
    action: '',
    dateFrom: '',
    dateTo: '',
    adminId: '',
    targetType: ''
  })
  const [filteredAuditLogs, setFilteredAuditLogs] = useState<AuditLog[]>([])
  
  // Estados para paginação e funcionalidades avançadas de auditoria
  const [auditCurrentPage, setAuditCurrentPage] = useState(1)
  const [auditPageSize, setAuditPageSize] = useState(10)
  const [auditSortBy, setAuditSortBy] = useState<'timestamp' | 'action' | 'adminId'>('timestamp')
  const [auditSortOrder, setAuditSortOrder] = useState<'asc' | 'desc'>('desc')
  const [auditSearchTerm, setAuditSearchTerm] = useState('')
  const [selectedAuditLogs, setSelectedAuditLogs] = useState<string[]>([])
  const [auditExportLoading, setAuditExportLoading] = useState(false)
  
  const router = useRouter()
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    
    // Create session ID for tracking
    if (!sessionStorage.getItem("adminSessionId")) {
      const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("adminSessionId", sessionId)
    }
    
    // Log admin session start
    logAdminAction("admin_session_start", undefined, "session", {      sessionId: sessionStorage.getItem("adminSessionId"),
      loginTime: new Date().toISOString()
    })
    
    loadDashboardData()
    loadNotices()
    loadAnalytics()
    loadAuditLogs()
    loadSystemHealth()
    
    // Initialize notification system for real-time monitoring
    const notificationSystem = NotificationSystem.getInstance()
    
    // Auto-refresh system health every 30 seconds
    const healthInterval = setInterval(() => {
      loadSystemHealth()
      // Check system health and trigger notifications if needed
      if (systemHealth) {
        notificationSystem.checkSystemHealth(systemHealth)
      }
    }, 30000)
      // Cleanup function to log session end
    return () => {
      clearInterval(healthInterval)
      logAdminAction("admin_session_end", undefined, "session", {
        sessionId: sessionStorage.getItem("adminSessionId"),
        endTime: new Date().toISOString()
      })
    }
  }, [])

  // Real-time updates using Server-Sent Events
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) return

    let eventSource: EventSource | null = null

    const connectToRealTimeUpdates = () => {
      try {
        // Note: EventSource doesn't support custom headers directly
        // We'll implement a polling fallback for now
        const pollInterval = setInterval(async () => {
          try {
            // Get real-time system health updates
            const healthResponse = await fetch("/api/admin/system-health", {
              headers: { Authorization: `Bearer ${adminToken}` }
            })
            
            if (healthResponse.ok) {
              const healthData = await healthResponse.json()
              setSystemHealth(healthData)
              
              // Update metrics history
              const currentTime = new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
              
              setSystemMetricsHistory(prev => ({
                timestamps: [...prev.timestamps, currentTime].slice(-20),
                cpu: [...prev.cpu, healthData.systemMetrics.cpu.usage].slice(-20),
                memory: [...prev.memory, healthData.systemMetrics.memory.percentage].slice(-20),
                disk: [...prev.disk, healthData.systemMetrics.disk.percentage].slice(-20),
                apiResponseTime: [...prev.apiResponseTime, healthData.apiMetrics.responseTime].slice(-20)
              }))
            }

            // Get recent notifications
            const notificationResponse = await fetch("/api/admin/notifications", {
              headers: { Authorization: `Bearer ${adminToken}` }
            })
            
            if (notificationResponse.ok) {
              const notifications = await notificationResponse.json()
              // You can add notification state management here if needed
              
              // Check for critical notifications and show alerts
              const criticalNotifications = notifications.filter((n: any) => 
                !n.isRead && 
                n.priority === 'critical' && 
                new Date(n.createdAt) > new Date(Date.now() - 5 * 60 * 1000)
              )
              
              if (criticalNotifications.length > 0) {
                // Trigger browser notification if permission granted
                if (Notification.permission === 'granted') {
                  new Notification('CodeRats Admin Alert', {
                    body: `${criticalNotifications.length} critical notification(s) require attention`,
                    icon: '/icon.png'
                  })
                }
              }
            }

          } catch (error) {
            console.error('Real-time update error:', error)
          }
        }, 15000) // Poll every 15 seconds

        return () => {
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Failed to connect to real-time updates:', error)
      }
    }

    const cleanup = connectToRealTimeUpdates()

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return cleanup
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

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.error("Erro ao carregar analytics:", err)
    }
  }
  const loadNotices = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/notices", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setNotices(data.notices || [])
      }
    } catch (err) {
      console.error("Erro ao carregar avisos:", err)
    }
  }
  const loadAuditLogs = async () => {
    setAuditLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/audit", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
      }
    } catch (err) {
      console.error("Erro ao carregar logs de auditoria:", err)
    } finally {
      setAuditLoading(false)
    }
  }
  const loadSystemHealth = async () => {
    setHealthLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/system-health", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
        
        // Update metrics history for charts
        const currentTime = new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        
        setSystemMetricsHistory(prev => {
          const newHistory = {
            timestamps: [...prev.timestamps, currentTime].slice(-20), // Keep last 20 data points
            cpu: [...prev.cpu, data.systemMetrics.cpu.usage].slice(-20),
            memory: [...prev.memory, data.systemMetrics.memory.percentage].slice(-20),
            disk: [...prev.disk, data.systemMetrics.disk.percentage].slice(-20),
            apiResponseTime: [...prev.apiResponseTime, data.apiMetrics.responseTime].slice(-20)
          }
          return newHistory
        })
      }
    } catch (err) {
      console.error("Erro ao carregar saúde do sistema:", err)
    } finally {
      setHealthLoading(false)
    }
  }
  const logAdminAction = async (action: string, targetId?: string, targetType?: string, details?: any) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          targetId,
          targetType,
          details: {
            ...details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            sessionId: sessionStorage.getItem("adminSessionId") || "unknown",
            systemHealth: systemHealth ? {
              cpu: systemHealth.systemMetrics.cpu.usage,
              memory: systemHealth.systemMetrics.memory.percentage,
              overallStatus: systemHealth.overallStatus
            } : null
          }
        })
      })
        if (response.ok) {
        // Trigger notification for critical administrative actions
        const notificationSystem = NotificationSystem.getInstance()
        await notificationSystem.checkAuditEvent(action, sessionStorage.getItem("adminSessionId") || "unknown", details)
        
        // Reload audit logs to show the new entry
        await loadAuditLogs()
      }
    } catch (err) {
      console.error("Erro ao registrar ação de auditoria:", err)
    }
  }

  const handleLogout = () => {
    logAdminAction("admin_logout")
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  const handleBanUser = async (userId: string, ban: boolean) => {
    setActionLoading(userId)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, ban })
      })
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: ban ? "Usuário banido com sucesso!" : "Ban removido com sucesso!",
          variant: "default"
        })
        await loadDashboardData()
        await logAdminAction(ban ? "user_banned" : "user_unbanned", userId, "user", { ban })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao processar ação",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao processar ação",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }
  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      toast({
        title: "Erro",
        description: "Assunto e mensagem são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setActionLoading("sendEmail")
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
        toast({
          title: "Sucesso",
          description: "Email enviado com sucesso!",
          variant: "default"
        })
        setEmailForm({ subject: "", message: "" })
        await logAdminAction("bulk_email_sent", undefined, "email", emailForm)
      } else {
        toast({
          title: "Erro",
          description: "Erro ao enviar email",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefreshAll = async () => {
    setActionLoading("refreshAll")
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/refresh-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Dados atualizados com sucesso!",
          variant: "default"
        })
        await loadDashboardData()
        await loadAnalytics()
        await logAdminAction("system_refresh_all")
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar dados",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefreshRanking = async () => {
    setActionLoading("refreshRanking")
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/refresh-ranking", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Ranking atualizado com sucesso!",
          variant: "default"
        })
        await loadDashboardData()
        await loadAnalytics()
        await logAdminAction("system_refresh_ranking")
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar ranking",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar ranking",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }
  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.message) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setActionLoading("createNotice")
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...noticeForm,
          isActive: true
        })
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Aviso criado com sucesso!",
          variant: "default"
        })
        setNoticeForm({ title: "", message: "", type: "info", location: "home" })
        await loadNotices()
        await logAdminAction("notice_created", undefined, "notice", noticeForm)
      } else {
        toast({
          title: "Erro",
          description: "Erro ao criar aviso",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao criar aviso",
        variant: "destructive"
      })    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteNotice = async (id: string) => {
    setActionLoading(id)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/notices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Aviso excluído com sucesso!",
          variant: "default"
        })
        await loadNotices()
        await logAdminAction("notice_deleted", id, "notice")
      } else {
        toast({
          title: "Erro",
          description: "Erro ao excluir aviso",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao excluir aviso",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }
  const handleImportData = async () => {
    if (!importFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para importar",
        variant: "destructive"
      })
      return
    }

    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel']
    if (!allowedTypes.includes(importFile.type)) {
      toast({
        title: "Erro",
        description: "Formato de arquivo não suportado. Use JSON ou CSV.",
        variant: "destructive"
      })
      return
    }

    setImportLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Sucesso",
          description: `Dados importados com sucesso! ${result.imported || 0} registros processados.`,
          variant: "default"
        })
        setImportFile(null)
        await loadDashboardData()
        await loadAnalytics()
        await logAdminAction("data_import_completed", undefined, "import", { 
          filename: importFile.name,
          fileSize: importFile.size,
          imported: result.imported 
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.message || "Erro ao importar dados",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo de importação",
        variant: "destructive"
      })    } finally {
      setImportLoading(false)
    }
  }

  const handleBackupData = async (format: 'json' | 'csv') => {
    setActionLoading(`backup-${format}`)
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/admin/backup?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = `coderats-backup-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(downloadLink)
        
        toast({
          title: "Sucesso",
          description: `Backup ${format.toUpperCase()} baixado com sucesso!`,
          variant: "default"
        })
        await logAdminAction("data_backup_downloaded", undefined, "backup", { format })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao gerar backup",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao gerar backup",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Função para backup de métricas do sistema
  const handleBackupSystemHealth = async () => {
    setActionLoading("backup-health")
    try {
      const healthData = {
        systemHealth,
        systemMetricsHistory,
        timestamp: new Date().toISOString(),
        exportedBy: "admin"
      }

      const jsonData = JSON.stringify(healthData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const downloadAnchor = document.createElement('a')
      downloadAnchor.href = url
      downloadAnchor.download = `system-health-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      document.body.removeChild(downloadAnchor)
      URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Métricas do sistema exportadas com sucesso!",
        variant: "default"
      })
      
      await logAdminAction("system_health_exported", undefined, "export", { 
        metricsCount: systemMetricsHistory.timestamps.length 
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar métricas do sistema",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter((user: AdminUser) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )
  // Função para filtrar logs de auditoria com funcionalidades avançadas
  const filterAuditLogs = () => {
    let filtered = auditLogs

    // Filtro de busca global
    if (auditSearchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        log.adminId?.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        log.targetType?.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        log.targetId?.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(auditSearchTerm.toLowerCase())
      )
    }

    // Filtros específicos
    if (auditFilters.action) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(auditFilters.action.toLowerCase())
      )
    }

    if (auditFilters.adminId) {
      filtered = filtered.filter(log => 
        log.adminId?.toLowerCase().includes(auditFilters.adminId.toLowerCase())
      )
    }

    if (auditFilters.targetType) {
      filtered = filtered.filter(log => 
        log.targetType?.toLowerCase().includes(auditFilters.targetType.toLowerCase())
      )
    }

    if (auditFilters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(auditFilters.dateFrom)
      )
    }

    if (auditFilters.dateTo) {
      const endDate = new Date(auditFilters.dateTo)
      endDate.setHours(23, 59, 59, 999) // Include the entire end date
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= endDate
      )
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aVal, bVal
      switch (auditSortBy) {
        case 'timestamp':
          aVal = new Date(a.timestamp).getTime()
          bVal = new Date(b.timestamp).getTime()
          break
        case 'action':
          aVal = a.action.toLowerCase()
          bVal = b.action.toLowerCase()
          break
        case 'adminId':
          aVal = (a.adminId || '').toLowerCase()
          bVal = (b.adminId || '').toLowerCase()
          break
        default:
          return 0
      }
      
      if (auditSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredAuditLogs(filtered)
  }

  // Função para exportar logs de auditoria
  const handleExportAuditLogs = async (format: 'json' | 'csv') => {
    setAuditExportLoading(true)
    try {
      const logsToExport = selectedAuditLogs.length > 0 
        ? filteredAuditLogs.filter(log => selectedAuditLogs.includes(log.id))
        : filteredAuditLogs

      if (format === 'json') {
        const jsonData = JSON.stringify(logsToExport, null, 2)
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const jsonDownload = document.createElement('a')
        jsonDownload.href = url
        jsonDownload.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(jsonDownload)
        jsonDownload.click()
        document.body.removeChild(jsonDownload)
        URL.revokeObjectURL(url)
      } else {
        // CSV export
        const headers = ['Timestamp', 'Action', 'Admin ID', 'Target ID', 'Target Type', 'IP Address', 'Details']
        const csvData = [
          headers.join(','),
          ...logsToExport.map(log => [
            new Date(log.timestamp).toLocaleString(),
            log.action,
            log.adminId || '',
            log.targetId || '',
            log.targetType || '',
            log.ipAddress || '',
            JSON.stringify(log.details || {}).replace(/"/g, '""')
          ].map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        const blob = new Blob([csvData], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const csvDownload = document.createElement('a')
        csvDownload.href = url
        csvDownload.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(csvDownload)
        csvDownload.click()
        document.body.removeChild(csvDownload)
        URL.revokeObjectURL(url)
      }

      toast({
        title: "Sucesso",
        description: `${logsToExport.length} logs de auditoria exportados como ${format.toUpperCase()}!`,
        variant: "default"
      })
      
      await logAdminAction("audit_logs_exported", undefined, "export", { 
        format, 
        count: logsToExport.length,
        selectedOnly: selectedAuditLogs.length > 0 
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar logs de auditoria",
        variant: "destructive"
      })
    } finally {
      setAuditExportLoading(false)
    }
  }

  // Funções de paginação para auditoria
  const getPaginatedAuditLogs = () => {
    const startIndex = (auditCurrentPage - 1) * auditPageSize
    const endIndex = startIndex + auditPageSize
    return filteredAuditLogs.slice(startIndex, endIndex)
  }

  const getTotalAuditPages = () => {
    return Math.ceil(filteredAuditLogs.length / auditPageSize)
  }
  // Efeito para filtrar logs quando os filtros mudam
  useEffect(() => {
    filterAuditLogs()
    setAuditCurrentPage(1) // Reset to first page when filters change
  }, [auditLogs, auditFilters, auditSearchTerm, auditSortBy, auditSortOrder])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">Real-time Active</span>
          </div>
          {systemHealth && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              systemHealth.overallStatus === 'healthy' ? 'bg-green-50 border-green-200' :
              systemHealth.overallStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                systemHealth.overallStatus === 'healthy' ? 'bg-green-500' :
                systemHealth.overallStatus === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                systemHealth.overallStatus === 'healthy' ? 'text-green-700' :
                systemHealth.overallStatus === 'warning' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                System {systemHealth.overallStatus}
              </span>
            </div>
          )}
        </div>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Banidos</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contribuições</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContributions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-4">        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="roles">Permissões</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="email">Enviar Email</TabsTrigger>
          <TabsTrigger value="notices">Avisos</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={user.avatar_url || "/default-avatar.png"} 
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">
                          Score: {user.score} | Rank: #{user.rank}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isBanned ? (
                        <Badge variant="destructive">Banido</Badge>
                      ) : (
                        <Badge variant="secondary">Ativo</Badge>
                      )}
                      <Button
                        size="sm"
                        variant={user.isBanned ? "outline" : "destructive"}
                        onClick={() => handleBanUser(user.id, !user.isBanned)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : user.isBanned ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Desbanir
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Banir
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-8">
                  {/* User Growth Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{analytics.summary.usersLast30Days}</div>
                        <p className="text-sm text-muted-foreground">Novos usuários (30 dias)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{analytics.summary.usersLast7Days}</div>
                        <p className="text-sm text-muted-foreground">Novos usuários (7 dias)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          +{analytics.summary.activeUsersGrowth.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Crescimento de usuários ativos</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Interactive Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contribution Distribution Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-4 h-4" />
                          Distribuição de Contribuições
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <Doughnut
                            data={{
                              labels: ['Commits', 'Pull Requests', 'Issues', 'Code Reviews'],
                              datasets: [
                                {
                                  data: [
                                    analytics.contributions.totalCommits,
                                    analytics.contributions.totalPRs,
                                    analytics.contributions.totalIssues,
                                    analytics.contributions.totalCodeReviews
                                  ],
                                  backgroundColor: [
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(168, 85, 247, 0.8)',
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(245, 158, 11, 0.8)'
                                  ],
                                  borderColor: [
                                    'rgb(34, 197, 94)',
                                    'rgb(168, 85, 247)',
                                    'rgb(59, 130, 246)',
                                    'rgb(245, 158, 11)'
                                  ],
                                  borderWidth: 2
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    color: 'rgb(156, 163, 175)',
                                    padding: 20
                                  }
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: 'white',
                                  bodyColor: 'white'
                                }
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Score Distribution Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Distribuição de Scores
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <Bar
                            data={{
                              labels: Object.keys(analytics.scoreDistribution),
                              datasets: [
                                {
                                  label: 'Número de Usuários',
                                  data: Object.values(analytics.scoreDistribution),
                                  backgroundColor: 'rgba(34, 197, 94, 0.6)',
                                  borderColor: 'rgb(34, 197, 94)',
                                  borderWidth: 2,
                                  borderRadius: 8
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: 'white',
                                  bodyColor: 'white'
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: {
                                    color: 'rgba(156, 163, 175, 0.2)'
                                  },
                                  ticks: {
                                    color: 'rgb(156, 163, 175)'
                                  }
                                },
                                x: {
                                  grid: {
                                    color: 'rgba(156, 163, 175, 0.2)'
                                  },
                                  ticks: {
                                    color: 'rgb(156, 163, 175)'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Users Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Performance dos Top 10 Usuários
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: analytics.topUsers.slice(0, 10).map(user => user.username),
                            datasets: [
                              {
                                label: 'Commits',
                                data: analytics.topUsers.slice(0, 10).map(user => user.commits),
                                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                                borderColor: 'rgb(34, 197, 94)',
                                borderWidth: 2,
                                borderRadius: 4
                              },
                              {
                                label: 'Pull Requests',
                                data: analytics.topUsers.slice(0, 10).map(user => user.pull_requests),
                                backgroundColor: 'rgba(168, 85, 247, 0.6)',
                                borderColor: 'rgb(168, 85, 247)',
                                borderWidth: 2,
                                borderRadius: 4
                              },
                              {
                                label: 'Issues',
                                data: analytics.topUsers.slice(0, 10).map(user => user.issues),
                                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                borderColor: 'rgb(59, 130, 246)',
                                borderWidth: 2,
                                borderRadius: 4
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: 'rgb(156, 163, 175)',
                                  padding: 20
                                }
                              },
                              tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'white',
                                bodyColor: 'white'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)'
                                }
                              },
                              x: {
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)',
                                  maxRotation: 45
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Activity Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Crescimento de Usuários (Últimos 30 dias)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <Line
                          data={{
                            labels: Array.from({ length: 30 }, (_, i) => {
                              const date = new Date()
                              date.setDate(date.getDate() - (29 - i))
                              return date.getDate() + '/' + (date.getMonth() + 1)
                            }),
                            datasets: [
                              {
                                label: 'Usuários Ativos',
                                data: Array.from({ length: 30 }, () => 
                                  Math.floor(Math.random() * 20) + analytics.summary.activeUsers * 0.8
                                ),
                                borderColor: 'rgb(34, 197, 94)',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                tension: 0.4,
                                fill: true
                              },
                              {
                                label: 'Novos Usuários',
                                data: Array.from({ length: 30 }, () => 
                                  Math.floor(Math.random() * 5) + 1
                                ),
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4,
                                fill: true
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: 'rgb(156, 163, 175)',
                                  padding: 20
                                }
                              },
                              tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'white',
                                bodyColor: 'white'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)'
                                }
                              },
                              x: {
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)'
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contribution Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Estatísticas de Contribuição</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xl font-bold">{analytics.contributions.totalCommits}</div>
                          <p className="text-sm text-muted-foreground">Commits</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xl font-bold">{analytics.contributions.totalPRs}</div>
                          <p className="text-sm text-muted-foreground">Pull Requests</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xl font-bold">{analytics.contributions.totalIssues}</div>
                          <p className="text-sm text-muted-foreground">Issues</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xl font-bold">{analytics.contributions.totalCodeReviews}</div>
                          <p className="text-sm text-muted-foreground">Code Reviews</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-xl font-bold">{analytics.contributions.avgCommitsPerUser.toFixed(1)}</div>
                          <p className="text-sm text-muted-foreground">Avg/Usuário</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Top Users */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Top 10 Usuários por Score</h3>
                    <div className="space-y-2">
                      {analytics.topUsers.slice(0, 10).map((user, index) => (
                        <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{user.score} pts</div>
                            <div className="text-sm text-muted-foreground">
                              {user.commits}c • {user.pull_requests}pr • {user.issues}i
                            </div>
                          </div>
                        </div>
                      ))}                    </div>
                  </div>

                  {/* Enhanced Analytics Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Advanced Analytics & Real-time Metrics
                    </h3>

                    {/* Real-time System Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            System Performance Trends
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <Line
                              data={{
                                labels: systemMetricsHistory.timestamps,
                                datasets: [
                                  {
                                    label: 'CPU Usage (%)',
                                    data: systemMetricsHistory.cpu,
                                    borderColor: 'rgb(239, 68, 68)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    tension: 0.4
                                  },
                                  {
                                    label: 'Memory Usage (%)',
                                    data: systemMetricsHistory.memory,
                                    borderColor: 'rgb(59, 130, 246)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4
                                  },
                                  {
                                    label: 'API Response Time (ms)',
                                    data: systemMetricsHistory.apiResponseTime,
                                    borderColor: 'rgb(34, 197, 94)',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    tension: 0.4,
                                    yAxisID: 'y1'
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                interaction: {
                                  mode: 'index' as const,
                                  intersect: false,
                                },
                                plugins: {
                                  legend: {
                                    position: 'top' as const,
                                    labels: {
                                      color: 'rgb(156, 163, 175)'
                                    }
                                  }
                                },
                                scales: {
                                  x: {
                                    display: true,
                                    grid: {
                                      color: 'rgba(156, 163, 175, 0.2)'
                                    },
                                    ticks: {
                                      color: 'rgb(156, 163, 175)'
                                    }
                                  },
                                  y: {
                                    type: 'linear' as const,
                                    display: true,
                                    position: 'left' as const,
                                    max: 100,
                                    grid: {
                                      color: 'rgba(156, 163, 175, 0.2)'
                                    },
                                    ticks: {
                                      color: 'rgb(156, 163, 175)'
                                    }
                                  },
                                  y1: {
                                    type: 'linear' as const,
                                    display: true,
                                    position: 'right' as const,
                                    grid: {
                                      drawOnChartArea: false,
                                    },
                                    ticks: {
                                      color: 'rgb(156, 163, 175)'
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* User Activity Heatmap */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            User Activity Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  {analytics.summary.activeUsers}
                                </div>
                                <p className="text-sm text-green-700">Active Users Today</p>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                  {analytics.summary.usersLast7Days}
                                </div>
                                <p className="text-sm text-blue-700">New This Week</p>
                              </div>
                            </div>
                            
                            {/* Activity Status Indicators */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">User Engagement</span>
                                <Badge variant={analytics.summary.activeUsersGrowth > 0 ? "default" : "secondary"}>
                                  {analytics.summary.activeUsersGrowth > 0 ? '↗' : '↘'} {Math.abs(analytics.summary.activeUsersGrowth).toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((analytics.summary.activeUsers / analytics.summary.totalUsers) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {((analytics.summary.activeUsers / analytics.summary.totalUsers) * 100).toFixed(1)}% of users are active
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Performance Metrics Dashboard */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Platform Performance Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-800">Total Contributions</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-900">
                              {analytics.contributions.totalCommits + analytics.contributions.totalPRs + analytics.contributions.totalIssues}
                            </div>
                            <div className="text-xs text-purple-600">
                              Avg: {analytics.contributions.avgCommitsPerUser.toFixed(1)} per user
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Code Reviews</span>
                            </div>
                            <div className="text-2xl font-bold text-green-900">
                              {analytics.contributions.totalCodeReviews}
                            </div>
                            <div className="text-xs text-green-600">
                              Quality assurance metric
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Issues Tracked</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-900">
                              {analytics.contributions.totalIssues}
                            </div>
                            <div className="text-xs text-orange-600">
                              Problem resolution
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Growth Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                              +{analytics.summary.activeUsersGrowth.toFixed(1)}%
                            </div>
                            <div className="text-xs text-blue-600">
                              30-day trend
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Carregando analytics...</p>
                </div>
              )}</CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsPanel />
        </TabsContent>        {/* Roles and Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <RoleManagement />
        </TabsContent>

        {/* Security Monitoring Tab */}
        <TabsContent value="security" className="space-y-4">
          <SecurityMonitoring />
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Logs de Auditoria
                <Badge variant="secondary" className="ml-auto">
                  {filteredAuditLogs.length} de {auditLogs.length}
                </Badge>
              </CardTitle>
            </CardHeader>            <CardContent>
              {auditLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Carregando logs de auditoria...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Security Analytics Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-red-50 to-red-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Security Events</span>
                        </div>
                        <div className="text-2xl font-bold text-red-900">
                          {auditLogs.filter(log => log.action.includes('security') || log.action.includes('ban')).length}
                        </div>
                        <div className="text-xs text-red-600">
                          Last 30 days
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCog className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Admin Actions</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {auditLogs.length}
                        </div>
                        <div className="text-xs text-blue-600">
                          Total recorded
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">System Health</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {systemHealth?.overallStatus === 'healthy' ? '✓' : systemHealth?.overallStatus === 'warning' ? '⚠' : '✗'}
                        </div>
                        <div className="text-xs text-green-600">
                          {systemHealth?.overallStatus || 'Unknown'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Active Sessions</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {auditLogs.filter(log => 
                            log.action === 'admin_session_start' && 
                            new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                          ).length}
                        </div>
                        <div className="text-xs text-purple-600">
                          Last 24 hours
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Critical Events */}
                  {auditLogs.filter(log => 
                    log.action.includes('ban') || 
                    log.action.includes('security') || 
                    log.action.includes('bulk') ||
                    log.action.includes('system')
                  ).length > 0 && (
                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800">
                          <AlertCircle className="w-4 h-4" />
                          Recent Critical Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {auditLogs
                            .filter(log => 
                              log.action.includes('ban') || 
                              log.action.includes('security') || 
                              log.action.includes('bulk') ||
                              log.action.includes('system')
                            )
                            .slice(0, 5)
                            .map((log) => (
                              <div key={log.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    log.action.includes('ban') ? 'bg-red-500' :
                                    log.action.includes('security') ? 'bg-orange-500' :
                                    log.action.includes('bulk') ? 'bg-purple-500' : 'bg-blue-500'
                                  }`} />
                                  <span className="text-sm font-medium">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {log.adminId}
                                  </Badge>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Search and Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 min-w-0">
                      <Input
                        placeholder="Buscar em todos os campos..."
                        value={auditSearchTerm}
                        onChange={(e) => setAuditSearchTerm(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={auditSortBy} onValueChange={(value: 'timestamp' | 'action' | 'adminId') => setAuditSortBy(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="timestamp">Data</SelectItem>
                          <SelectItem value="action">Ação</SelectItem>
                          <SelectItem value="adminId">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAuditSortOrder(auditSortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        {auditSortOrder === 'asc' ? '↑' : '↓'}
                      </Button>
                      <Select value={auditPageSize.toString()} onValueChange={(value) => setAuditPageSize(Number(value))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="actionFilter">Ação</Label>
                      <Input
                        id="actionFilter"
                        value={auditFilters.action}
                        onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                        placeholder="Filtrar por ação"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminIdFilter">Admin ID</Label>
                      <Input
                        id="adminIdFilter"
                        value={auditFilters.adminId}
                        onChange={(e) => setAuditFilters({ ...auditFilters, adminId: e.target.value })}
                        placeholder="Filtrar por Admin ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetTypeFilter">Tipo de Alvo</Label>
                      <Select value={auditFilters.targetType} onValueChange={(value) => setAuditFilters({ ...auditFilters, targetType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os tipos</SelectItem>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="notice">Aviso</SelectItem>
                          <SelectItem value="session">Sessão</SelectItem>
                          <SelectItem value="backup">Backup</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateFromFilter">Data (De)</Label>
                      <Input
                        id="dateFromFilter"
                        type="date"
                        value={auditFilters.dateFrom}
                        onChange={(e) => setAuditFilters({ ...auditFilters, dateFrom: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateToFilter">Data (Até)</Label>
                      <Input
                        id="dateToFilter"
                        type="date"
                        value={auditFilters.dateTo}
                        onChange={(e) => setAuditFilters({ ...auditFilters, dateTo: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setAuditFilters({
                            action: '',
                            dateFrom: '',
                            dateTo: '',
                            adminId: '',
                            targetType: ''
                          })
                          setAuditSearchTerm('')
                          setSelectedAuditLogs([])
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Limpar Filtros
                      </Button>
                      <Button 
                        onClick={loadAuditLogs}
                        variant="outline"
                        size="sm"
                        disabled={auditLoading}
                      >
                        {auditLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      {selectedAuditLogs.length > 0 && (
                        <Badge variant="secondary" className="px-2 py-1">
                          {selectedAuditLogs.length} selecionados
                        </Badge>
                      )}
                      <Button 
                        onClick={() => handleExportAuditLogs('json')}
                        disabled={auditExportLoading || filteredAuditLogs.length === 0}
                        variant="outline"
                        size="sm"
                      >
                        {auditExportLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        JSON
                      </Button>
                      <Button 
                        onClick={() => handleExportAuditLogs('csv')}
                        disabled={auditExportLoading || filteredAuditLogs.length === 0}
                        variant="outline"
                        size="sm"
                      >
                        {auditExportLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        CSV
                      </Button>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="space-y-4">
                    {getPaginatedAuditLogs().length > 0 ? (
                      <>
                        <div className="grid gap-3">
                          {getPaginatedAuditLogs().map((log) => (
                            <div key={log.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedAuditLogs.includes(log.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedAuditLogs([...selectedAuditLogs, log.id])
                                      } else {
                                        setSelectedAuditLogs(selectedAuditLogs.filter(id => id !== log.id))
                                      }
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <Badge variant={
                                        log.action.includes('error') || log.action.includes('failed') ? 'destructive' :
                                        log.action.includes('success') || log.action.includes('created') ? 'default' :
                                        'secondary'
                                      }>
                                        {log.action}
                                      </Badge>
                                      <span className="text-sm text-gray-500">
                                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                                      </span>
                                      {log.targetType && (
                                        <Badge variant="outline" className="text-xs">
                                          {log.targetType}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm space-y-1">
                                      <p><strong>Admin:</strong> {log.adminId}</p>
                                      {log.targetId && <p><strong>Target ID:</strong> {log.targetId}</p>}
                                      {log.ipAddress && <p><strong>IP:</strong> {log.ipAddress}</p>}
                                      {log.details && (
                                        <details className="mt-2">
                                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Ver detalhes</summary>
                                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                            {JSON.stringify(log.details, null, 2)}
                                          </pre>
                                        </details>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-400">
                                  <Clock className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {getTotalAuditPages() > 1 && (
                          <div className="flex items-center justify-between border-t pt-4">
                            <div className="text-sm text-gray-500">
                              Mostrando {((auditCurrentPage - 1) * auditPageSize) + 1} a {Math.min(auditCurrentPage * auditPageSize, filteredAuditLogs.length)} de {filteredAuditLogs.length} logs
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAuditCurrentPage(Math.max(1, auditCurrentPage - 1))}
                                disabled={auditCurrentPage === 1}
                              >
                                Anterior
                              </Button>
                              <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, getTotalAuditPages()) }, (_, i) => {
                                  const page = i + 1
                                  return (
                                    <Button
                                      key={page}
                                      variant={page === auditCurrentPage ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setAuditCurrentPage(page)}
                                    >
                                      {page}
                                    </Button>
                                  )
                                })}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAuditCurrentPage(Math.min(getTotalAuditPages(), auditCurrentPage + 1))}
                                disabled={auditCurrentPage === getTotalAuditPages()}
                              >
                                Próximo
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Nenhum log de auditoria encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros ou buscar por outros termos</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Email para Todos os Usuários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Assunto do email"
                />
              </div>
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder="Conteúdo do email"
                  rows={6}
                />
              </div>
              <Button 
                onClick={handleSendEmail}
                disabled={actionLoading === "sendEmail"}
                className="w-full"
              >
                {actionLoading === "sendEmail" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Avisos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="noticeTitle">Título</Label>
                  <Input
                    id="noticeTitle"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder="Título do aviso"
                  />
                </div>
                <div>
                  <Label htmlFor="noticeType">Tipo</Label>
                  <Select 
                    value={noticeForm.type} 
                    onValueChange={(value) => setNoticeForm({ ...noticeForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="noticeMessage">Mensagem</Label>
                <Textarea
                  id="noticeMessage"
                  value={noticeForm.message}
                  onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                  placeholder="Conteúdo do aviso"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="noticeLocation">Localização</Label>
                <Select 
                  value={noticeForm.location} 
                  onValueChange={(value) => setNoticeForm({ ...noticeForm, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Página Inicial</SelectItem>
                    <SelectItem value="leaderboard">Leaderboard</SelectItem>
                    <SelectItem value="all">Todas as Páginas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleCreateNotice}
                disabled={actionLoading === "createNotice"}
                className="w-full"
              >
                {actionLoading === "createNotice" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Aviso
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Notices */}
          <Card>
            <CardHeader>
              <CardTitle>Avisos Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{notice.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={notice.type === "error" ? "destructive" : "secondary"}>
                          {notice.type}
                        </Badge>
                        <Badge variant={notice.isActive ? "default" : "outline"}>
                          {notice.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notice.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {notice.location} • {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteNotice(notice.id)}
                        disabled={actionLoading === notice.id}
                      >
                        {actionLoading === notice.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>        {/* System Tab */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health Monitoring */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Saúde do Sistema</CardTitle>
                  <Button 
                    onClick={loadSystemHealth}
                    disabled={healthLoading}
                    variant="outline"
                    size="sm"
                  >
                    {healthLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {systemHealth ? (
                  <div className="space-y-4">
                    {/* Overall Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        {systemHealth.overallStatus === 'healthy' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : systemHealth.overallStatus === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">Status Geral</span>
                      </div>
                      <Badge 
                        variant={
                          systemHealth.overallStatus === 'healthy' ? 'default' :
                          systemHealth.overallStatus === 'warning' ? 'secondary' : 'destructive'
                        }
                      >
                        {systemHealth.overallStatus === 'healthy' ? 'Saudável' :
                         systemHealth.overallStatus === 'warning' ? 'Atenção' : 'Crítico'}
                      </Badge>
                    </div>

                    {/* System Metrics */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">CPU</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{systemHealth.systemMetrics.cpu.usage}%</div>
                          <div className="text-xs text-muted-foreground">{systemHealth.systemMetrics.cpu.cores} cores</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            systemHealth.systemMetrics.cpu.usage > 80 ? 'bg-red-500' :
                            systemHealth.systemMetrics.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${systemHealth.systemMetrics.cpu.usage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Memória</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{systemHealth.systemMetrics.memory.percentage}%</div>
                          <div className="text-xs text-muted-foreground">
                            {(systemHealth.systemMetrics.memory.used / 1024 / 1024 / 1024).toFixed(1)}GB / 
                            {(systemHealth.systemMetrics.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            systemHealth.systemMetrics.memory.percentage > 80 ? 'bg-red-500' :
                            systemHealth.systemMetrics.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${systemHealth.systemMetrics.memory.percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Disco</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{systemHealth.systemMetrics.disk.percentage}%</div>
                          <div className="text-xs text-muted-foreground">
                            {(systemHealth.systemMetrics.disk.used / 1024 / 1024 / 1024).toFixed(1)}GB / 
                            {(systemHealth.systemMetrics.disk.total / 1024 / 1024 / 1024).toFixed(1)}GB
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            systemHealth.systemMetrics.disk.percentage > 80 ? 'bg-red-500' :
                            systemHealth.systemMetrics.disk.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${systemHealth.systemMetrics.disk.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* API & Database Metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Zap className="w-4 h-4 text-orange-500 mr-1" />
                          <span className="text-sm">API</span>
                        </div>
                        <div className="text-lg font-bold">{systemHealth.apiMetrics.responseTime}ms</div>
                        <div className="text-xs text-muted-foreground">Tempo de resposta</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Database className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-sm">Database</span>
                        </div>
                        <div className="text-lg font-bold">{systemHealth.database.responseTime}ms</div>
                        <div className="text-xs text-muted-foreground">Tempo de resposta</div>
                      </div>
                    </div>

                    {/* GitHub Status */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm font-medium">GitHub API</span>
                        </div>
                        <Badge 
                          variant={
                            systemHealth.github.apiStatus === 'healthy' ? 'default' :
                            systemHealth.github.apiStatus === 'warning' ? 'secondary' : 'destructive'
                          }
                        >
                          {systemHealth.github.apiStatus === 'healthy' ? 'OK' :
                           systemHealth.github.apiStatus === 'warning' ? 'Atenção' : 'Erro'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rate Limit: {systemHealth.github.rateLimit.remaining}/{systemHealth.github.rateLimit.total}
                      </div>
                    </div>

                    {/* Uptime */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Uptime</span>
                      </div>
                      <span className="text-sm font-medium">{systemHealth.uptime.formatted}</span>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      Última atualização: {new Date(systemHealth.lastUpdated).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando informações do sistema...</p>
                  </div>
                )}              </CardContent>
            </Card>

            {/* Real-time System Metrics Charts */}
            {systemMetricsHistory.timestamps.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Métricas do Sistema em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CPU and Memory Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">CPU & Memória (%)</h4>
                      <div className="h-64">
                        <Line
                          data={{
                            labels: systemMetricsHistory.timestamps,
                            datasets: [
                              {
                                label: 'CPU',
                                data: systemMetricsHistory.cpu,
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4,
                                fill: false
                              },
                              {
                                label: 'Memória',
                                data: systemMetricsHistory.memory,
                                borderColor: 'rgb(168, 85, 247)',
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                tension: 0.4,
                                fill: false
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: 'rgb(156, 163, 175)',
                                  padding: 10
                                }
                              },
                              tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'white',
                                bodyColor: 'white'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)',
                                  callback: function(value) {
                                    return value + '%'
                                  }
                                }
                              },
                              x: {
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)',
                                  maxTicksLimit: 10
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Disk and API Response Time Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Disco (%) & API (ms)</h4>
                      <div className="h-64">
                        <Line
                          data={{
                            labels: systemMetricsHistory.timestamps,
                            datasets: [
                              {
                                label: 'Disco (%)',
                                data: systemMetricsHistory.disk,
                                borderColor: 'rgb(34, 197, 94)',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                tension: 0.4,
                                fill: false,
                                yAxisID: 'y'
                              },
                              {
                                label: 'API Response (ms)',
                                data: systemMetricsHistory.apiResponseTime,
                                borderColor: 'rgb(245, 158, 11)',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                tension: 0.4,
                                fill: false,
                                yAxisID: 'y1'
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: 'rgb(156, 163, 175)',
                                  padding: 10
                                }
                              },
                              tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'white',
                                bodyColor: 'white'
                              }
                            },
                            scales: {
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                beginAtZero: true,
                                max: 100,
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)',
                                  callback: function(value) {
                                    return value + '%'
                                  }
                                }
                              },
                              y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                beginAtZero: true,
                                grid: {
                                  drawOnChartArea: false,
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)',
                                  callback: function(value) {
                                    return value + 'ms'
                                  }
                                }
                              },
                              x: {
                                grid: {
                                  color: 'rgba(156, 163, 175, 0.2)'
                                },
                                ticks: {
                                  color: 'rgb(156, 163, 175)',
                                  maxTicksLimit: 10
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleRefreshAll}
                  disabled={actionLoading === "refreshAll"}
                  className="w-full"
                >
                  {actionLoading === "refreshAll" ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Atualizar Todos os Dados
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleRefreshRanking}
                  disabled={actionLoading === "refreshRanking"}
                  className="w-full"
                  variant="outline"
                >
                  {actionLoading === "refreshRanking" ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Atualizar Ranking
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Backup & Restauração Avançada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Export Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Dados
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quick Export */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <h5 className="text-sm font-medium">Exportação Rápida</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => handleBackupData('json')}
                          disabled={actionLoading === "backup-json"}
                          className="w-full"
                          variant="outline"
                          size="sm"
                        >
                          {actionLoading === "backup-json" ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3 mr-1" />
                          )}
                          JSON
                        </Button>
                        
                        <Button 
                          onClick={() => handleBackupData('csv')}
                          disabled={actionLoading === "backup-csv"}
                          className="w-full"
                          variant="outline"
                          size="sm"
                        >
                          {actionLoading === "backup-csv" ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3 mr-1" />
                          )}
                          CSV
                        </Button>
                      </div>
                    </div>

                    {/* Advanced Export */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <h5 className="text-sm font-medium">Exportação Personalizada</h5>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleExportAuditLogs('json')}
                          disabled={auditExportLoading}
                          className="w-full"
                          variant="outline"
                          size="sm"
                        >
                          {auditExportLoading ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Shield className="w-3 h-3 mr-1" />
                          )}
                          Logs de Auditoria
                        </Button>
                        <Button 
                          onClick={() => handleBackupSystemHealth()}
                          disabled={actionLoading === "backup-health"}
                          className="w-full"
                          variant="outline"
                          size="sm"
                        >
                          {actionLoading === "backup-health" ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Activity className="w-3 h-3 mr-1" />
                          )}
                          Métricas do Sistema
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import Section */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Importar Dados
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    {importFile && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>Arquivo:</strong> {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                        </div>
                        <Button
                          onClick={() => setImportFile(null)}
                          variant="ghost"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <Button 
                      onClick={handleImportData}
                      disabled={!importFile || importLoading}
                      className="w-full"
                      size="sm"
                    >
                      {importLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Importar Dados
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Scheduled Backups */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Backup Automático
                  </h4>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Backup Automático Ativado</p>
                        <p className="text-xs text-green-600">Próximo backup: Diário às 02:00</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Importante:</strong> A importação substituirá dados existentes. 
                      Sempre faça backup antes de importar dados. Os backups incluem dados de usuários, 
                      configurações do sistema e logs de auditoria.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links Úteis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/admin/updates">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerenciar Updates
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações do Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
