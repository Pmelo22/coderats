// Real-time Notifications System for CodeRats Admin
import { collection, addDoc, getDocs, query, where, orderBy, limit, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface AdminNotification {
  id?: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  category: 'system' | 'security' | 'user' | 'audit' | 'performance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  adminId?: string
  targetId?: string
  targetType?: string
  metadata?: any
  createdAt: string
  expiresAt?: string
}

export interface NotificationRule {
  id?: string
  eventType: string
  conditions: any
  targetRoles: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  cooldownMinutes?: number
  lastTriggered?: string
}

// Create a new notification
export async function createNotification(notification: Omit<AdminNotification, 'id' | 'createdAt' | 'isRead'>) {
  try {
    const notificationData = {
      ...notification,
      isRead: false,
      createdAt: new Date().toISOString(),
      // Auto-expire notifications after 7 days unless specified
      expiresAt: notification.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const docRef = await addDoc(collection(db, 'admin_notifications'), notificationData)
    
    // Trigger real-time update if available
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('adminNotificationCreated', { 
        detail: { id: docRef.id, ...notificationData }
      }))
    }

    return { id: docRef.id, ...notificationData }
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Get notifications for admin
export async function getNotifications(adminId?: string, maxResults?: number): Promise<AdminNotification[]> {
  try {
    let q = query(
      collection(db, 'admin_notifications'),
      orderBy('createdAt', 'desc')
    )

    if (adminId) {
      q = query(
        collection(db, 'admin_notifications'),
        where('adminId', 'in', [adminId, null]), // null means for all admins
        orderBy('createdAt', 'desc')
      )
    }

    if (maxResults) {
      q = query(q, limit(maxResults))
    }

    const snapshot = await getDocs(q)
    const notifications: AdminNotification[] = []

    snapshot.forEach(doc => {
      const data = doc.data()
      // Filter out expired notifications
      if (!data.expiresAt || new Date(data.expiresAt) > new Date()) {
        notifications.push({
          id: doc.id,
          ...data
        } as AdminNotification)
      }
    })

    return notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, 'admin_notifications', notificationId)
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// Predefined notification templates for common events
export const NotificationTemplates = {
  SYSTEM_HIGH_CPU: (cpuUsage: number) => ({
    type: 'warning' as const,
    title: 'High CPU Usage Detected',
    message: `System CPU usage has reached ${cpuUsage}%. Consider checking for performance issues.`,
    category: 'performance' as const,
    priority: 'high' as const,
    metadata: { cpuUsage }
  }),

  SYSTEM_HIGH_MEMORY: (memoryUsage: number) => ({
    type: 'warning' as const,
    title: 'High Memory Usage Detected',
    message: `System memory usage has reached ${memoryUsage}%. Monitor for memory leaks.`,
    category: 'performance' as const,
    priority: 'high' as const,
    metadata: { memoryUsage }
  }),

  API_ERROR_RATE_HIGH: (errorRate: number) => ({
    type: 'error' as const,
    title: 'High API Error Rate',
    message: `API error rate has increased to ${errorRate}%. Check system logs for issues.`,
    category: 'system' as const,
    priority: 'critical' as const,
    metadata: { errorRate }
  }),

  USER_BANNED: (username: string, adminId: string) => ({
    type: 'info' as const,
    title: 'User Banned',
    message: `User ${username} has been banned by admin ${adminId}.`,
    category: 'user' as const,
    priority: 'medium' as const,
    metadata: { username, adminId }
  }),

  FAILED_LOGIN_ATTEMPTS: (attempts: number, ip: string) => ({
    type: 'warning' as const,
    title: 'Multiple Failed Login Attempts',
    message: `${attempts} failed admin login attempts detected from IP ${ip}.`,
    category: 'security' as const,
    priority: 'high' as const,
    metadata: { attempts, ip }
  }),

  BULK_DATA_EXPORT: (adminId: string, recordCount: number) => ({
    type: 'info' as const,
    title: 'Bulk Data Export',
    message: `Admin ${adminId} exported ${recordCount} records.`,
    category: 'audit' as const,
    priority: 'medium' as const,
    metadata: { adminId, recordCount }
  }),

  SYSTEM_BACKUP_COMPLETED: (backupSize: string) => ({
    type: 'success' as const,
    title: 'System Backup Completed',
    message: `Automated system backup completed successfully. Backup size: ${backupSize}`,
    category: 'system' as const,
    priority: 'low' as const,
    metadata: { backupSize }
  }),

  GITHUB_RATE_LIMIT_WARNING: (remaining: number, resetTime: string) => ({
    type: 'warning' as const,
    title: 'GitHub Rate Limit Warning',
    message: `GitHub API rate limit is low: ${remaining} requests remaining. Resets at ${resetTime}.`,
    category: 'system' as const,
    priority: 'medium' as const,
    metadata: { remaining, resetTime }
  })
}

// Auto-trigger notifications based on system events
export class NotificationSystem {
  private static instance: NotificationSystem
  private rules: NotificationRule[] = []

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem()
    }
    return NotificationSystem.instance
  }

  // Check system metrics and trigger notifications if needed
  async checkSystemHealth(systemHealth: any) {
    const notifications: any[] = []

    // CPU usage check
    if (systemHealth.systemMetrics.cpu.usage > 80) {
      notifications.push(NotificationTemplates.SYSTEM_HIGH_CPU(systemHealth.systemMetrics.cpu.usage))
    }

    // Memory usage check
    if (systemHealth.systemMetrics.memory.percentage > 85) {
      notifications.push(NotificationTemplates.SYSTEM_HIGH_MEMORY(systemHealth.systemMetrics.memory.percentage))
    }

    // API error rate check
    if (systemHealth.apiMetrics.errorRate > 5) {
      notifications.push(NotificationTemplates.API_ERROR_RATE_HIGH(systemHealth.apiMetrics.errorRate))
    }

    // GitHub rate limit check
    if (systemHealth.github.rateLimit.remaining < 100) {
      notifications.push(NotificationTemplates.GITHUB_RATE_LIMIT_WARNING(
        systemHealth.github.rateLimit.remaining,
        systemHealth.github.rateLimit.resetTime
      ))
    }

    // Create notifications
    for (const notification of notifications) {
      try {
        await createNotification(notification)
      } catch (error) {
        console.error('Error creating system health notification:', error)
      }
    }
  }

  // Track audit events and create notifications for important actions
  async checkAuditEvent(action: string, adminId: string, details: any) {
    const highPriorityActions = [
      'user_banned',
      'bulk_email_sent',
      'system_refresh_all',
      'data_export_bulk',
      'admin_settings_changed'
    ]

    if (highPriorityActions.includes(action)) {
      const notification = {
        type: 'info' as const,
        title: `Administrative Action: ${action.replace(/_/g, ' ').toUpperCase()}`,
        message: `Admin ${adminId} performed action: ${action}`,
        category: 'audit' as const,
        priority: 'medium' as const,
        metadata: { action, adminId, details }
      }

      try {
        await createNotification(notification)
      } catch (error) {
        console.error('Error creating audit notification:', error)
      }
    }
  }
}

export default NotificationSystem
