'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'Signin':
        return {
          title: "Erro de Autenticação",
          description: "Email é obrigatório para acessar o sistema. Por favor, autorize o acesso ao seu email no GitHub.",
          details: "Para usar o CodeRats, precisamos do seu email para comunicações importantes e funcionalidades do sistema."
        }
      case 'OAuthSignin':
        return {
          title: "Erro no Login GitHub",
          description: "Houve um problema na autenticação com o GitHub.",
          details: "Verifique se você autorizou todas as permissões necessárias."
        }
      case 'OAuthCallback':
        return {
          title: "Erro de Callback",
          description: "Email não foi fornecido durante a autenticação.",
          details: "Certifique-se de que seu email no GitHub está público ou autorize o acesso durante o login."
        }
      default:
        return {
          title: "Erro de Autenticação",
          description: "Ocorreu um erro durante o login.",
          details: "Tente novamente e certifique-se de autorizar todas as permissões."
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        <Card className="bg-gray-800 border-red-500/20 shadow-2xl">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-white text-lg sm:text-xl">{errorInfo.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            <Alert className="border-red-500/50 bg-red-500/10">
              <Mail className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {errorInfo.description}
              </AlertDescription>
            </Alert>            <div className="text-gray-300 text-sm">
              <p>{errorInfo.details}</p>
            </div>

            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Como resolver:</h4>
              <ol className="text-gray-300 text-xs sm:text-sm space-y-1 list-decimal list-inside">
                <li>Acesse as configurações do seu GitHub</li>
                <li>Torne seu email público OU</li>
                <li>Autorize o acesso ao email durante o login</li>
                <li>Tente fazer login novamente</li>
              </ol>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 w-full text-sm sm:text-base"
              >
                <Link href="/">
                  Tentar Login Novamente
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full text-sm sm:text-base"
              >
                <Link href="https://github.com/settings/emails" target="_blank">
                  <Mail className="h-4 w-4 mr-2" />
                  Configurar Email no GitHub
                </Link>
              </Button>

              <Button
                asChild 
                variant="ghost" 
                className="text-gray-400 hover:text-gray-300 w-full text-sm sm:text-base"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Início
                </Link>
              </Button>
            </div>          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="bg-gray-800 border-red-500/20 shadow-2xl">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-white text-sm sm:text-base">Carregando...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
