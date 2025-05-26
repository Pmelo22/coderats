"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function JoinWithGitHubButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signIn("github")
      router.push("/ranking")
    } catch (err) {
      alert("Erro ao fazer login ou sincronizar dados do GitHub.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleLogin} disabled={loading}>
      {loading ? "Entrando..." : "Entrar com GitHub"}
    </Button>
  )
}
