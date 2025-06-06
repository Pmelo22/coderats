import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { RBACService, PERMISSIONS } from "@/lib/rbac"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set")
}
const JWT_SECRET = process.env.JWT_SECRET

function verifyAdminToken(authorization: string | null) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Token não fornecido")
  }

  const token = authorization.split(" ")[1]
  const decoded = jwt.verify(token, JWT_SECRET) as any
  
  if (!decoded.admin) {
    throw new Error("Token inválido")
  }

  return decoded
}

// GET - Get roles and permissions
export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    const admin = verifyAdminToken(authorization)
    
    const url = new URL(req.url)
    const action = url.searchParams.get("action")
    
    if (action === "permissions") {
      // Check if admin can view permissions
      const canView = await RBACService.checkPermission(admin.username, 'admin.permissions')
      if (!canView) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        permissions: PERMISSIONS
      })
    }
    
    if (action === "my-permissions") {
      // Get current admin's permissions
      const user = await RBACService.getAdminUser(admin.username)
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Admin user not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        user: {
          username: user.username,
          role: user.role,
          permissions: user.permissions
        }
      })
    }
    
    // Default: get all roles
    const canViewRoles = await RBACService.checkPermission(admin.username, 'admin.view')
    if (!canViewRoles) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }
    
    const roles = await RBACService.getRoles()
    return NextResponse.json({ 
      success: true, 
      roles: roles.filter(role => role.isActive)
    })
    
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: error instanceof Error && error.message.includes("Token") ? 401 : 500 }
    )
  }
}

// POST - Create new admin user or update role
export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    const admin = verifyAdminToken(authorization)
    
    const body = await req.json()
    const { action, userData, username, roleId } = body
    
    if (action === "create-admin") {
      // Check permission to create admins
      const canCreate = await RBACService.checkPermission(admin.username, 'admin.create')
      if (!canCreate) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions to create admin users" },
          { status: 403 }
        )
      }
      
      if (!userData || !userData.username || !userData.email || !userData.roleId) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        )
      }
      
      const newAdmin = await RBACService.createAdminUser({
        ...userData,
        isActive: true
      })
      
      return NextResponse.json({ 
        success: true, 
        message: "Admin user created successfully",
        admin: newAdmin
      })
    }
    
    if (action === "update-role") {
      // Check permission to edit admins
      const canEdit = await RBACService.checkPermission(admin.username, 'admin.edit')
      if (!canEdit) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions to edit admin users" },
          { status: 403 }
        )
      }
      
      if (!username || !roleId) {
        return NextResponse.json(
          { success: false, error: "Username and role ID are required" },
          { status: 400 }
        )
      }
      
      const success = await RBACService.updateUserRole(username, roleId)
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Failed to update user role" },
          { status: 400 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "User role updated successfully"
      })
    }
    
    if (action === "check-permissions") {
      // Check multiple permissions for current admin
      const { permissions } = body
      if (!permissions || !Array.isArray(permissions)) {
        return NextResponse.json(
          { success: false, error: "Permissions array is required" },
          { status: 400 }
        )
      }
      
      const user = await RBACService.getAdminUser(admin.username)
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Admin user not found" },
          { status: 404 }
        )
      }
      
      const permissionResults: Record<string, boolean> = {}
      for (const permission of permissions) {
        permissionResults[permission] = user.permissions.includes(permission)
      }
      
      return NextResponse.json({ 
        success: true, 
        permissions: permissionResults
      })
    }
    
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )
    
  } catch (error) {
    console.error("Error processing role request:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: error instanceof Error && error.message.includes("Token") ? 401 : 500 }
    )
  }
}

// PUT - Initialize RBAC system
export async function PUT(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    const admin = verifyAdminToken(authorization)
    
    // Check if admin has permission to manage system
    const canManageSystem = await RBACService.checkPermission(admin.username, 'system.settings')
    if (!canManageSystem) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }
    
    await RBACService.initializeRoles()
    
    return NextResponse.json({ 
      success: true, 
      message: "RBAC system initialized successfully"
    })
    
  } catch (error) {
    console.error("Error initializing RBAC:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: 500 }
    )
  }
}
