"use client"

import { Button } from "@/components/ui/button"
import { signInWithPopup, GithubAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function JoinWithGitHubButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const provider = new GithubAuthProvider()
      provider.addScope("read:user")
      provider.addScope("user:email")
      provider.addScope("repo")
      provider.addScope("read:org")
      const result = await signInWithPopup(auth, provider)
      const credential = GithubAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken
      if (token) {
        // Chama a API para sincronizar dados do GitHub
        const res = await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        if (!res.ok) throw new Error("Erro ao sincronizar dados do GitHub")
      }
      router.push("/ranking")
    } catch (err) {
      alert("Erro ao fazer login ou sincronizar dados do GitHub.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleLogin} disabled={loading}>
      {loading ? "Sincronizando..." : "Join with GitHub"}
    </Button>
  )
}
