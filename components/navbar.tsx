"use client"

import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GithubIcon, LogOut, User, BarChart2, Shield } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const isAuthenticated = status === "authenticated"
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Verificar se usuário tem token de admin no localStorage
    const adminToken = localStorage.getItem("adminToken")
    setIsAdmin(!!adminToken)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/icon.png" alt="Logo" className="h-7 w-7 rounded" />
              <span className="text-lg font-bold">Coderats</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <Link href="/ranking" className="text-sm font-medium hover:text-emerald-400 transition-colors">
              Ranking
            </Link>
            {isAuthenticated && (
              <Link href="/profile" className="text-sm font-medium hover:text-emerald-400 transition-colors">
                Meu Perfil
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={session?.user?.image ?? undefined} />
                      <AvatarFallback>{session?.user?.name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" /> Meu Perfil
                    </Link>
                  </DropdownMenuItem>                  <DropdownMenuItem asChild>
                    <Link href="/ranking">
                      <BarChart2 className="mr-2 h-4 w-4" /> Ranking
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">
                        <Shield className="mr-2 h-4 w-4" /> Administração
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        await signOut()
                        toast({
                          variant: "success",
                          title: "Logout realizado",
                          description: "Você foi desconectado com sucesso.",
                        })
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Erro no logout",
                          description: "Não foi possível desconectar. Tente novamente.",
                        })
                      }
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700" 
                onClick={async () => {
                  try {
                    await signIn("github")
                    toast({
                      variant: "success",
                      title: "Redirecionando...",
                      description: "Conectando com o GitHub.",
                    })
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Erro no login",
                      description: "Não foi possível conectar com o GitHub. Tente novamente.",
                    })
                  }
                }}
              >
                <GithubIcon className="mr-2 h-4 w-4" />
                Login with GitHub
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
