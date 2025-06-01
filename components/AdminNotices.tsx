'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface AdminNotice {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  location: 'home' | 'ranking' | 'both'
  isActive: boolean
  createdAt: string
}

interface AdminNoticesProps {
  location: 'home' | 'ranking'
}

export default function AdminNotices({ location }: AdminNoticesProps) {
  const [notices, setNotices] = useState<AdminNotice[]>([])
  const [dismissedNotices, setDismissedNotices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotices()
    
    // Recuperar avisos dispensados do localStorage
    const dismissed = localStorage.getItem('dismissed_admin_notices')
    if (dismissed) {
      setDismissedNotices(JSON.parse(dismissed))
    }
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/admin/notices')
      const data = await response.json()
      
      if (data.success) {
        // Filtrar avisos para a localização atual
        const filteredNotices = data.notices.filter((notice: AdminNotice) => 
          notice.isActive && (notice.location === location || notice.location === 'both')
        )
        setNotices(filteredNotices)
      }
    } catch (error) {
      console.error('Erro ao buscar avisos:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismissNotice = (noticeId: string) => {
    const newDismissed = [...dismissedNotices, noticeId]
    setDismissedNotices(newDismissed)
    localStorage.setItem('dismissed_admin_notices', JSON.stringify(newDismissed))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'info':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-300'
      case 'warning':
        return 'border-orange-500/50 bg-orange-500/10 text-orange-300'
      case 'success':
        return 'border-green-500/50 bg-green-500/10 text-green-300'
      case 'error':
        return 'border-red-500/50 bg-red-500/10 text-red-300'
      default:
        return 'border-blue-500/50 bg-blue-500/10 text-blue-300'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'text-blue-400'
      case 'warning':
        return 'text-orange-400'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  if (loading) return null

  const visibleNotices = notices.filter(notice => !dismissedNotices.includes(notice.id))

  if (visibleNotices.length === 0) return null

  return (
    <div className="space-y-4 mb-6">
      {visibleNotices.map((notice) => (
        <Alert key={notice.id} className={`shadow-lg ${getAlertStyle(notice.type)}`}>
          <div className={getIconColor(notice.type)}>
            {getIcon(notice.type)}
          </div>
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium mb-1">{notice.title}</h4>
                <p className="text-sm">{notice.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-300 p-1 h-auto ml-4"
                onClick={() => dismissNotice(notice.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
