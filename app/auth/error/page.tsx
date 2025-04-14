"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Erro de Autenticação</h1>

        <div className="mb-6">
          {error === "Configuration" && (
            <p className="text-gray-300">
              Há um problema com a configuração do OAuth. Verifique se o URL de redirecionamento está configurado
              corretamente no GitHub.
            </p>
          )}
          {error === "AccessDenied" && (
            <p className="text-gray-300">
              Acesso negado. Você pode ter recusado a autorização ou não tem permissão para acessar este recurso.
            </p>
          )}
          {error === "OAuthSignin" && (
            <p className="text-gray-300">Erro ao iniciar o fluxo de autenticação OAuth. Tente novamente mais tarde.</p>
          )}
          {error === "OAuthCallback" && (
            <p className="text-gray-300">
              Erro durante o callback OAuth. Verifique se o URL de redirecionamento está configurado corretamente.
            </p>
          )}
          {!error && (
            <p className="text-gray-300">Ocorreu um erro durante a autenticação. Por favor, tente novamente.</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>

          <div className="text-sm text-gray-400">
            <p>Certifique-se de que o URL de redirecionamento está configurado corretamente no GitHub OAuth App.</p>
            <p className="mt-2">
              URL de redirecionamento deve ser:{" "}
              <code>{process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/github</code>
            </p>
            <p className="mt-4">Detalhes técnicos: {error || "Erro desconhecido"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
