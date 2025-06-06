"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  Users, 
  Key, 
  Plus, 
  Edit, 
  Check, 
  X,
  Lock,
  Unlock,
  Settings,
  Info
} from "lucide-react"
import { AdminRole, AdminUser, PERMISSIONS } from "@/lib/rbac"
import { useToast } from "@/hooks/use-toast"

interface RoleManagementProps {
  onRoleChanged?: () => void
}

export default function RoleManagement({ onRoleChanged }: RoleManagementProps) {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const { toast } = useToast()
  
  // Create admin form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    roleId: ''
  })

  useEffect(() => {
    loadRoles()
    loadCurrentUser()
  }, [])
  const loadRoles = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/roles", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(data.roles || [])
      } else {
        throw new Error("Failed to load roles")
      }
    } catch (err) {
      console.error("Error loading roles:", err)
      setMessage({ type: "error", text: "Erro ao carregar funções" })
      toast({
        variant: "destructive",
        title: "Erro ao carregar funções",
        description: "Não foi possível carregar as funções administrativas."
      })
    }
  }
  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/roles?action=my-permissions", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
        
        // Convert permissions array to object for easier checking
        const permissionsObj: Record<string, boolean> = {}
        data.user.permissions.forEach((permission: string) => {
          permissionsObj[permission] = true
        })
        setUserPermissions(permissionsObj)
      }
    } catch (err) {
      console.error("Error loading current user:", err)
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuário",
        description: "Não foi possível carregar as informações do usuário atual."
      })
    } finally {
      setLoading(false)
    }
  }
  const initializeRBAC = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/roles", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Sistema RBAC inicializado com sucesso!" })
        toast({
          title: "Sistema RBAC inicializado",
          description: "O sistema de controle de acesso foi configurado com sucesso."
        })
        await loadRoles()
      } else {
        throw new Error("Failed to initialize RBAC")
      }
    } catch (err) {
      console.error("Error initializing RBAC:", err)
      setMessage({ type: "error", text: "Erro ao inicializar sistema RBAC" })
      toast({
        variant: "destructive",
        title: "Erro ao inicializar RBAC",
        description: "Não foi possível inicializar o sistema de controle de acesso."
      })
    }
  }
  const createAdmin = async () => {
    if (!createForm.username || !createForm.email || !createForm.roleId) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios" })
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar um administrador."
      })
      return
    }

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "create-admin",
          userData: createForm
        })
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Administrador criado com sucesso!" })
        toast({
          title: "Administrador criado",
          description: `O usuário ${createForm.username} foi criado com sucesso.`
        })
        setShowCreateForm(false)
        setCreateForm({ username: '', email: '', roleId: '' })
        onRoleChanged?.()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to create admin")
      }
    } catch (err) {
      console.error("Error creating admin:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar administrador"
      setMessage({ type: "error", text: errorMessage })
      toast({
        variant: "destructive",
        title: "Erro ao criar administrador",
        description: errorMessage
      })
    }
  }

  const getPermissionCategory = (permission: string) => {
    const parts = permission.split('.')
    return parts[0]
  }

  const groupPermissionsByCategory = () => {
    const categories: Record<string, string[]> = {}
    Object.keys(PERMISSIONS).forEach(permission => {
      const category = getPermissionCategory(permission)
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(permission)
    })
    return categories
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users':
        return <Users className="w-4 h-4" />
      case 'system':
        return <Settings className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'security':
        return <Lock className="w-4 h-4" />
      default:
        return <Key className="w-4 h-4" />
    }
  }

  const hasPermission = (permission: string) => {
    return userPermissions[permission] || false
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <Info className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permissions">Minhas Permissões</TabsTrigger>
          <TabsTrigger value="roles">Funções do Sistema</TabsTrigger>
          <TabsTrigger value="manage" disabled={!hasPermission('admin.create')}>
            Gerenciar Admins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Suas Permissões Atuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-medium">{currentUser.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        Função: {currentUser.role?.name || 'N/A'} (Nível {currentUser.role?.level || 'N/A'})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.role?.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(groupPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="flex items-center gap-2 text-sm font-medium capitalize">
                          {getCategoryIcon(category)}
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permissions.map(permission => (
                            <div
                              key={permission}
                              className={`flex items-center justify-between p-2 rounded border ${
                                hasPermission(permission) 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="text-sm">{permission}</span>
                              {hasPermission(permission) ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Carregando informações do usuário...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Funções do Sistema
                </CardTitle>
                {hasPermission('system.settings') && (
                  <Button onClick={initializeRBAC} variant="outline" size="sm">
                    Inicializar RBAC
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground mb-4">Nenhuma função encontrada</p>
                  {hasPermission('system.settings') && (
                    <Button onClick={initializeRBAC}>
                      Inicializar Sistema RBAC
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {roles.map(role => (
                    <div key={role.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {role.name}
                            <Badge variant="outline">Nível {role.level}</Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          Permissões ({role.permissions.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 10).map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 10} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Gerenciar Administradores
                </CardTitle>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                  {showCreateForm ? "Cancelar" : "Criar Admin"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCreateForm && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium">Criar Novo Administrador</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={createForm.username}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Digite o username"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Digite o email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Select
                      value={createForm.roleId}
                      onValueChange={(value) => setCreateForm(prev => ({ ...prev, roleId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name} (Nível {role.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={createAdmin}>Criar Administrador</Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Para gerenciar administradores existentes, implemente a listagem e edição de usuários admin.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
