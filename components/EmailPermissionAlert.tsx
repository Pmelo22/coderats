'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, X, ExternalLink } from "lucide-react"
import { useSession } from 'next-auth/react'

export default function EmailPermissionAlert() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [showAlert, setShowAlert] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Verifica se o usuário está logado mas pode não ter email
    if (session?.user && !dismissed) {
      // Verifica se há um parâmetro de erro na URL
      const urlParams = new URLSearchParams(window.location.search)
      const hasEmailError = urlParams.get('error') === 'email'
      
      // Mostra o alerta se houve erro de email ou se é um novo usuário
      if (hasEmailError || !session.user.email) {
        setShowAlert(true)
      }
    }
  }, [session, dismissed])

  useEffect(() => {
    // Verifica se o usuário foi redirecionado por falta de email
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('error') === 'email') {
      setShowAlert(true)
    }
  }, [])

  if (!showAlert || dismissed) return null

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto">
      <Alert className="border-orange-500/50 bg-orange-500/10 shadow-lg">
        <Mail className="h-4 w-4 text-orange-400" />
        <AlertDescription className="text-orange-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium mb-2">⚠️ Permissão de Email Necessária</p>
              <p className="text-sm mb-3">
                Para usar todas as funcionalidades do CodeRats, precisamos acessar seu email do GitHub.
              </p>
              <div className="flex gap-2">                <Button 
                  size="sm" 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => {
                    window.open('https://github.com/settings/emails', '_blank')
                    toast({
                      variant: "default",
                      title: "Configuração aberta",
                      description: "Configure seu email no GitHub e faça login novamente.",
                    })
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Configurar
                </Button>                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-orange-500 text-orange-300 hover:bg-orange-500/20"
                  onClick={() => {
                    setDismissed(true)
                    toast({
                      variant: "default",
                      title: "Alerta dispensado",
                      description: "Você pode configurar o email a qualquer momento nas configurações do GitHub.",
                    })
                  }}
                >
                  Entendi
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-orange-400 hover:text-orange-300 p-1 h-auto"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
