// Advanced Security Monitoring Component
"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Activity,
  Lock,
  Unlock
} from "lucide-react"

interface SecurityEvent {
  id: string
  type: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'rate_limit' | 'banned_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  ipAddress: string
  userAgent?: string
  userId?: string
  timestamp: string
  resolved: boolean
}

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  resolvedEvents: number
  activeThreats: number
  bannedIPs: string[]
  suspiciousIPs: string[]
  loginAttempts24h: number
  failedLogins24h: number
}

export default function SecurityMonitoring() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadSecurityData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadSecurityData = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      
      // Load security events from audit logs
      const auditResponse = await fetch("/api/admin/audit", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (auditResponse.ok) {
        const auditData = await auditResponse.json()
        
        // Filter security-related events
        const securityLogs = auditData.logs?.filter((log: any) => 
          log.action.includes('login') || 
          log.action.includes('auth') || 
          log.action.includes('ban') ||
          log.action.includes('security')
        ) || []
        
        // Transform to security events
        const events: SecurityEvent[] = securityLogs.map((log: any) => ({
          id: log.id,
          type: log.action.includes('ban') ? 'banned_access' :
                log.action.includes('failed') ? 'failed_auth' :
                log.action.includes('login') ? 'login_attempt' :
                'suspicious_activity',
          severity: log.action.includes('ban') ? 'high' :
                   log.action.includes('failed') ? 'medium' : 'low',
          description: log.action.replace(/_/g, ' ').toUpperCase(),
          ipAddress: log.ipAddress || 'Unknown',
          userAgent: log.userAgent,
          userId: log.adminId || log.targetId,
          timestamp: log.timestamp,
          resolved: false
        }))
        
        setSecurityEvents(events)
        
        // Calculate metrics
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        
        const recentEvents = events.filter(e => new Date(e.timestamp) > last24h)
        
        setMetrics({
          totalEvents: events.length,
          criticalEvents: events.filter(e => e.severity === 'critical' || e.severity === 'high').length,
          resolvedEvents: events.filter(e => e.resolved).length,
          activeThreats: events.filter(e => !e.resolved && (e.severity === 'high' || e.severity === 'critical')).length,
          bannedIPs: [...new Set(events.filter(e => e.type === 'banned_access').map(e => e.ipAddress))],
          suspiciousIPs: [...new Set(events.filter(e => e.severity === 'high').map(e => e.ipAddress))],
          loginAttempts24h: recentEvents.filter(e => e.type === 'login_attempt').length,
          failedLogins24h: recentEvents.filter(e => e.type === 'failed_auth').length
        })
      }    } catch (error) {
      console.error('Error loading security data:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados de segurança",
        description: "Não foi possível carregar as informações de monitoramento.",
      })
    } finally {
      setLoading(false)
    }
  }
  const resolveSecurityEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      
      // Update event status
      setSecurityEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, resolved: true } : event
        )
      )
      
      // Log resolution
      await fetch("/api/admin/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "security_event_resolved",
          targetId: eventId,
          targetType: "security_event",
          details: { resolvedAt: new Date().toISOString() }
        })
      })
      
      toast({
        variant: "success",
        title: "Evento de segurança resolvido",
        description: "O evento foi marcado como resolvido com sucesso.",
      })
      
    } catch (error) {
      console.error('Error resolving security event:', error)
      toast({
        variant: "destructive",
        title: "Erro ao resolver evento",
        description: "Não foi possível marcar o evento como resolvido.",
      })
      
      // Revert the change if there was an error
      setSecurityEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, resolved: false } : event
        )
      )    }
  }

  const blockSuspiciousIP = async (ipAddress: string) => {
    try {
      const token = localStorage.getItem("adminToken")
      
      // Call API to block IP (this would need to be implemented)
      const response = await fetch("/api/admin/security/block-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ipAddress })
      })

      if (response.ok) {
        // Update local state
        setMetrics(prev => prev ? {
          ...prev,
          bannedIPs: [...prev.bannedIPs, ipAddress],
          suspiciousIPs: prev.suspiciousIPs.filter(ip => ip !== ipAddress)
        } : prev)

        toast({
          variant: "success",
          title: "IP bloqueado",
          description: `O endereço IP ${ipAddress} foi bloqueado com sucesso.`,
        })

        // Log the action
        await fetch("/api/admin/audit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            action: "ip_blocked",
            targetId: ipAddress,
            targetType: "ip_address",
            details: { blockedAt: new Date().toISOString() }
          })
        })
      } else {
        throw new Error("Failed to block IP")
      }
    } catch (error) {
      console.error('Error blocking IP:', error)
      toast({
        variant: "destructive",
        title: "Erro ao bloquear IP",
        description: "Não foi possível bloquear o endereço IP. Tente novamente.",
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return <User className="w-4 h-4" />
      case 'failed_auth': return <XCircle className="w-4 h-4" />
      case 'banned_access': return <Ban className="w-4 h-4" />
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading security monitoring data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Events</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{metrics?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Active Threats</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{metrics?.activeThreats || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{metrics?.resolvedEvents || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Banned IPs</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{metrics?.bannedIPs.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Security Events
            <Badge variant="secondary" className="ml-auto">
              {securityEvents.filter(e => !e.resolved).length} unresolved
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {securityEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <div className="font-medium">{event.description}</div>
                    <div className="text-sm text-gray-500">
                      IP: {event.ipAddress} • {new Date(event.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                  {event.resolved ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveSecurityEvent(event.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suspicious IPs */}
      {metrics && metrics.suspiciousIPs.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Globe className="w-4 h-4" />
              Suspicious IP Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {metrics.suspiciousIPs.map((ip) => (
                <div key={ip} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="font-mono text-sm">{ip}</span>                  <Button size="sm" variant="outline" className="text-xs" onClick={() => blockSuspiciousIP(ip)}>
                    Block
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
