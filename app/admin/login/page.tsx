"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"

export default function AdminLogin() {
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Verificar se já está logado
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (adminToken) {
      router.push("/admin/dashboard")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!credentials.username || !credentials.password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json();

      if (response.ok) {
        // Armazenar token de admin no localStorage
        localStorage.setItem("adminToken", data.token)
        
        toast({
          variant: "success",
          title: "Login realizado com sucesso",
          description: "Redirecionando para o painel administrativo...",
        })
        
        // Feedback visual de sucesso
        setError("") 
        
        // Redirecionar após pequeno delay para melhor UX
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 100)      } else {
        setError(data.error || "Credenciais inválidas")
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: data.error || "Credenciais inválidas. Verifique seus dados.",
        })
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.")
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível conectar com o servidor. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <Card className="w-full max-w-md bg-gray-800/95 border-gray-700 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-blue-600/20 rounded-full">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-white">Painel Administrativo</CardTitle>
            <p className="text-gray-400 mt-2">CodeRats - Acesso Restrito</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Digite seu usuário"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white pr-10 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistema protegido por autenticação JWT
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
