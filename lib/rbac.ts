// Role-Based Access Control (RBAC) System for CodeRats Admin
import { collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface AdminRole {
  id: string
  name: string
  description: string
  permissions: string[]
  level: number // 1 = basic, 2 = advanced, 3 = super admin
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: string
  username: string
  email: string
  roleId: string
  role?: AdminRole
  permissions: string[]
  isActive: boolean
  lastLogin?: string
  loginAttempts: number
  lockedUntil?: string
  createdAt: string
  updatedAt: string
  metadata?: any
}

// Default permissions
export const PERMISSIONS = {
  // User Management
  'users.view': 'View user list and details',
  'users.ban': 'Ban/unban users',
  'users.edit': 'Edit user profiles',
  'users.delete': 'Delete user accounts',
  
  // System Management
  'system.view': 'View system health and metrics',
  'system.refresh': 'Refresh system data and rankings',
  'system.backup': 'Create and manage backups',
  'system.settings': 'Modify system settings',
  
  // Audit & Monitoring
  'audit.view': 'View audit logs',
  'audit.export': 'Export audit data',
  'audit.delete': 'Delete audit logs',
  
  // Communications
  'communications.send': 'Send bulk emails and notifications',
  'communications.notices': 'Manage admin notices',
  
  // Analytics
  'analytics.view': 'View analytics dashboard',
  'analytics.export': 'Export analytics data',
  
  // Admin Management
  'admin.view': 'View other admins',
  'admin.create': 'Create new admin accounts',
  'admin.edit': 'Edit admin accounts and roles',
  'admin.delete': 'Delete admin accounts',
  'admin.permissions': 'Manage roles and permissions',
  
  // Security
  'security.view': 'View security logs and settings',
  'security.settings': 'Modify security settings',
  'security.emergency': 'Emergency system controls'
}

// Default roles
export const DEFAULT_ROLES: Omit<AdminRole, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Viewer',
    description: 'Read-only access to basic information',
    level: 1,
    isActive: true,
    permissions: [
      'users.view',
      'system.view',
      'audit.view',
      'analytics.view'
    ]
  },
  {
    name: 'Moderator',
    description: 'Can manage users and view system information',
    level: 2,
    isActive: true,
    permissions: [
      'users.view',
      'users.ban',
      'users.edit',
      'system.view',
      'system.refresh',
      'audit.view',
      'audit.export',
      'communications.notices',
      'analytics.view',
      'analytics.export'
    ]
  },
  {
    name: 'Administrator',
    description: 'Full system access except admin management',
    level: 3,
    isActive: true,
    permissions: [
      'users.view',
      'users.ban',
      'users.edit',
      'users.delete',
      'system.view',
      'system.refresh',
      'system.backup',
      'system.settings',
      'audit.view',
      'audit.export',
      'audit.delete',
      'communications.send',
      'communications.notices',
      'analytics.view',
      'analytics.export',
      'admin.view',
      'security.view',
      'security.settings'
    ]
  },
  {
    name: 'Super Admin',
    description: 'Complete system access including admin management',
    level: 4,
    isActive: true,
    permissions: Object.keys(PERMISSIONS)
  }
]

// RBAC Service Class
export class RBACService {
  static async initializeRoles() {
    try {
      const rolesSnapshot = await getDocs(collection(db, 'admin_roles'))
      
      // If no roles exist, create default roles
      if (rolesSnapshot.empty) {
        console.log('Creating default admin roles...')
        
        for (const roleData of DEFAULT_ROLES) {
          const roleRef = doc(collection(db, 'admin_roles'))
          await setDoc(roleRef, {
            ...roleData,
            id: roleRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        }
        
        console.log('Default admin roles created successfully')
      }
    } catch (error) {
      console.error('Error initializing roles:', error)
      throw error
    }
  }

  static async createAdminUser(userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt' | 'permissions' | 'loginAttempts'>): Promise<AdminUser> {
    try {
      // Get role permissions
      const role = await this.getRole(userData.roleId)
      if (!role) {
        throw new Error('Invalid role ID')
      }

      const userRef = doc(collection(db, 'admin_users'))
      const adminUser: AdminUser = {
        ...userData,
        id: userRef.id,
        permissions: role.permissions,
        loginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await setDoc(userRef, adminUser)
      return adminUser
    } catch (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
  }

  static async getRole(roleId: string): Promise<AdminRole | null> {
    try {
      const roleDoc = await getDoc(doc(db, 'admin_roles', roleId))
      return roleDoc.exists() ? roleDoc.data() as AdminRole : null
    } catch (error) {
      console.error('Error fetching role:', error)
      return null
    }
  }

  static async getRoles(): Promise<AdminRole[]> {
    try {
      const snapshot = await getDocs(collection(db, 'admin_roles'))
      return snapshot.docs.map(doc => doc.data() as AdminRole)
    } catch (error) {
      console.error('Error fetching roles:', error)
      return []
    }
  }

  static async getAdminUser(username: string): Promise<AdminUser | null> {
    try {
      const q = query(collection(db, 'admin_users'), where('username', '==', username))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data() as AdminUser
        // Get role information
        const role = await this.getRole(userData.roleId)
        userData.role = role === null ? undefined : role
        return userData
      }
      return null
    } catch (error) {
      console.error('Error fetching admin user:', error)
      return null
    }
  }

  static async checkPermission(username: string, permission: string): Promise<boolean> {
    try {
      const user = await this.getAdminUser(username)
      if (!user || !user.isActive) return false
      
      return user.permissions.includes(permission)
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  static async hasAnyPermission(username: string, permissions: string[]): Promise<boolean> {
    try {
      const user = await this.getAdminUser(username)
      if (!user || !user.isActive) return false
      
      return permissions.some(permission => user.permissions.includes(permission))
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
    }
  }

  static async updateUserRole(username: string, roleId: string): Promise<boolean> {
    try {
      const role = await this.getRole(roleId)
      if (!role) return false

      const q = query(collection(db, 'admin_users'), where('username', '==', username))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const userRef = snapshot.docs[0].ref
        await setDoc(userRef, {
          roleId,
          permissions: role.permissions,
          updatedAt: new Date().toISOString()
        }, { merge: true })
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating user role:', error)
      return false
    }
  }

  // Security helpers
  static async incrementLoginAttempts(username: string): Promise<void> {
    try {
      const q = query(collection(db, 'admin_users'), where('username', '==', username))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const userRef = snapshot.docs[0].ref
        const userData = snapshot.docs[0].data() as AdminUser
        const newAttempts = (userData.loginAttempts || 0) + 1
        
        const updateData: any = {
          loginAttempts: newAttempts,
          updatedAt: new Date().toISOString()
        }
        
        // Lock account after 5 failed attempts for 30 minutes
        if (newAttempts >= 5) {
          updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
        
        await setDoc(userRef, updateData, { merge: true })
      }
    } catch (error) {
      console.error('Error incrementing login attempts:', error)
    }
  }

  static async resetLoginAttempts(username: string): Promise<void> {
    try {
      const q = query(collection(db, 'admin_users'), where('username', '==', username))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const userRef = snapshot.docs[0].ref
        await setDoc(userRef, {
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true })
      }
    } catch (error) {
      console.error('Error resetting login attempts:', error)
    }
  }

  static async isAccountLocked(username: string): Promise<boolean> {
    try {
      const user = await this.getAdminUser(username)
      if (!user || !user.lockedUntil) return false
      
      return new Date(user.lockedUntil) > new Date()
    } catch (error) {
      console.error('Error checking account lock status:', error)
      return false
    }
  }
}

// Middleware function for permission checking
export function requirePermission(permission: string) {
  return async (username: string): Promise<boolean> => {
    return await RBACService.checkPermission(username, permission)
  }
}

// Decorator for admin route protection
export function withPermissions(permissions: string[]) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    descriptor.value = async function(...args: any[]) {
      const username = args[0]?.admin?.username
      if (!username) {
        throw new Error('Admin authentication required')
      }
      
      const hasPermission = await RBACService.hasAnyPermission(username, permissions)
      if (!hasPermission) {
        throw new Error('Insufficient permissions')
      }
      
      return method.apply(this, args)
    }
  }
}

export default RBACService
