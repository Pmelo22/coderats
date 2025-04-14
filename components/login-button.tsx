"use client"

import { Button } from "@/components/ui/button"
import { GithubIcon } from "lucide-react"
import { useState } from "react"

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    // Redirecionar diretamente para a rota de API que inicia o fluxo de autenticação
    window.location.href = "/api/auth/signin/github"
  }

  return (
    <Button
      size="lg"
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          <GithubIcon className="mr-2 h-5 w-5" />
          Login with GitHub
        </>
      )}
    </Button>
  )
}
