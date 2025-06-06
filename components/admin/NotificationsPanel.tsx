"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Clock,
  Shield,
  Activity,
  Users,
  Settings,
  TrendingUp
} from "lucide-react"
import { AdminNotification } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

interface NotificationsPanelProps {
  onNotificationRead?: () => void
}

const getNotificationIcon = (category: string, type: string) => {
  switch (category) {
    case 'system':
      return <Activity className="w-4 h-4" />
    case 'security':
      return <Shield className="w-4 h-4" />
    case 'user':
      return <Users className="w-4 h-4" />
    case 'audit':
      return <Settings className="w-4 h-4" />
    case 'performance':
      return <TrendingUp className="w-4 h-4" />
    default:
      switch (type) {
        case 'error':
          return <XCircle className="w-4 h-4" />
        case 'warning':
          return <AlertTriangle className="w-4 h-4" />
        case 'success':
          return <CheckCircle className="w-4 h-4" />
        default:
          return <Info className="w-4 h-4" />
      }
  }
}

const getNotificationColor = (type: string, priority: string) => {
  if (priority === 'critical') return 'destructive'
  switch (type) {
    case 'error':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'success':
      return 'default'
    default:
      return 'outline'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

export default function NotificationsPanel({ onNotificationRead }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadNotifications()
    
    // Set up real-time notification listener
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('adminNotificationCreated', handleNewNotification as EventListener)
    }

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000)

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('adminNotificationCreated', handleNewNotification as EventListener)
      }
      clearInterval(interval)
    }
  }, [])
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        setError(null)
      } else {
        throw new Error("Failed to load notifications")
      }
    } catch (err) {
      console.error("Error loading notifications:", err)
      setError("Failed to load notifications")
      toast({
        variant: "destructive",
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações. Tente novamente."
      })
    } finally {
      setLoading(false)
    }
  }
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "markAsRead",
          notificationId
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        onNotificationRead?.()
        toast({
          title: "Notificação marcada como lida",
          description: "A notificação foi marcada como lida com sucesso."
        })
      } else {
        throw new Error("Failed to mark notification as read")
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
      toast({
        variant: "destructive",
        title: "Erro ao marcar notificação",
        description: "Não foi possível marcar a notificação como lida."
      })
    }
  }
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      if (unreadNotifications.length === 0) {
        toast({
          title: "Nenhuma notificação não lida",
          description: "Todas as notificações já foram lidas."
        })
        return
      }

      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          notificationIds: unreadNotifications.map(n => n.id)
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        )
        setUnreadCount(0)
        onNotificationRead?.()
        toast({
          title: "Todas as notificações marcadas como lidas",
          description: `${unreadNotifications.length} notificações foram marcadas como lidas.`
        })
      } else {
        throw new Error("Failed to mark all notifications as read")
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
      toast({
        variant: "destructive",
        title: "Erro ao marcar notificações",
        description: "Não foi possível marcar todas as notificações como lidas."
      })
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return date.toLocaleDateString()
  }

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 10)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellRing className="w-5 h-5 text-orange-500" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={loadNotifications}
            >
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? 'bg-muted/30 border-muted' 
                    : 'bg-background border-border shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${
                    notification.type === 'error' ? 'text-red-500' :
                    notification.type === 'warning' ? 'text-orange-500' :
                    notification.type === 'success' ? 'text-green-500' :
                    'text-blue-500'
                  }`}>
                    {getNotificationIcon(notification.category, notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium text-sm ${
                        notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                      <Badge variant={getNotificationColor(notification.type, notification.priority)} className="text-xs">
                        {notification.priority}
                      </Badge>
                    </div>
                    
                    <p className={`text-sm ${
                      notification.isRead ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(notification.createdAt)}
                        </span>
                      </div>
                      
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id!)}
                          className="text-xs h-6 px-2"
                        >
                          Marcar como lida
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 10 && !showAll && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowAll(true)}
              >
                Ver todas as notificações ({notifications.length})
              </Button>
            )}
            
            {showAll && notifications.length > 10 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowAll(false)}
              >
                Mostrar menos
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
