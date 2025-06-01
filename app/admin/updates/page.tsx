"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Save, X } from "lucide-react"
import { motion } from "framer-motion"

interface UpdateNote {
  id: string
  title: string
  content: string
  version: string
  date: string
  author: string
  type: "feature" | "bugfix" | "improvement" | "breaking"
}

interface FormData {
  title: string
  content: string
  version: string
  type: string
  author: string
}

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<UpdateNote[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    version: "",
    type: "feature",
    author: "Admin"
  })

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken")
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
      fetchUpdates(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUpdates = async (authToken?: string) => {
    try {
      const response = await fetch("/api/admin/updates", {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      })
      if (response.ok) {
        const data = await response.json()
        setUpdates(data.updates || [])
      }
    } catch (error) {
      console.error("Erro ao carregar atualizações:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    const username = prompt("Username:")
    const password = prompt("Password:")
    
    if (!username || !password) return

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setIsAuthenticated(true)
        localStorage.setItem("adminToken", data.token)
        fetchUpdates(data.token)
      } else {
        alert("Credenciais inválidas")
      }
    } catch (error) {
      alert("Erro ao fazer login")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const method = editingId ? "PUT" : "POST"
    const body = editingId 
      ? { ...formData, id: editingId }
      : formData

    try {
      const response = await fetch("/api/admin/updates", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        
        if (editingId) {
          setUpdates(updates.map(update => 
            update.id === editingId ? data.update : update
          ))
        } else {
          setUpdates([data.update, ...updates])
        }
        
        resetForm()
        alert(editingId ? "Atualização editada com sucesso!" : "Atualização criada com sucesso!")
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar atualização")
      }
    } catch (error) {
      alert("Erro ao salvar atualização")
    }
  }

  const handleEdit = (update: UpdateNote) => {
    setFormData({
      title: update.title,
      content: update.content,
      version: update.version,
      type: update.type,
      author: update.author
    })
    setEditingId(update.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta atualização?")) return

    try {
      const response = await fetch(`/api/admin/updates?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setUpdates(updates.filter(update => update.id !== id))
        alert("Atualização deletada com sucesso!")
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao deletar atualização")
      }
    } catch (error) {
      alert("Erro ao deletar atualização")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      version: "",
      type: "feature",
      author: "Admin"
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature": return "bg-emerald-600"
      case "bugfix": return "bg-red-600"
      case "improvement": return "bg-blue-600"
      case "breaking": return "bg-orange-600"
      default: return "bg-gray-600"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "feature": return "Nova Funcionalidade"
      case "bugfix": return "Correção"
      case "improvement": return "Melhoria"
      case "breaking": return "Mudança Importante"
      default: return "Atualização"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
          <CardHeader>
            <CardTitle>Admin - Notas de Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Notas de Atualização</h1>
            <p className="text-gray-400">Criar e editar atualizações da plataforma</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Atualização
          </Button>
        </motion.div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingId ? "Editar Atualização" : "Nova Atualização"}
                </h2>
                <Button variant="ghost" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Versão</label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: e.target.value})}
                      placeholder="1.0.0"
                      required
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                        <SelectItem value="improvement">Melhoria</SelectItem>
                        <SelectItem value="bugfix">Correção</SelectItem>
                        <SelectItem value="breaking">Mudança Importante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Autor</label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Conteúdo (HTML permitido)</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={8}
                    required
                    className="bg-gray-700 border-gray-600"
                    placeholder="Descreva as mudanças desta atualização..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "Salvar Alterações" : "Criar Atualização"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Updates List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : updates.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">Nenhuma atualização criada</h3>
                <p className="text-gray-400">
                  Clique em "Nova Atualização" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            updates.map((update) => (
              <Card key={update.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getTypeColor(update.type)} text-white`}>
                        {getTypeLabel(update.type)}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        v{update.version}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(update)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(update.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-white">{update.title}</CardTitle>
                  <p className="text-sm text-gray-400">
                    {new Date(update.date).toLocaleDateString("pt-BR")} • {update.author}
                  </p>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-gray-300 prose prose-invert max-w-none prose-sm"
                    dangerouslySetInnerHTML={{ __html: update.content }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
