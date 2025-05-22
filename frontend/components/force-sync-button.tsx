"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ForceSyncButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/force-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to sync data")
      }

      // Recarregar a página após a sincronização
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error("Error syncing data:", error)
      alert("Erro ao sincronizar dados. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-amber-600 text-amber-400 hover:bg-amber-900/20"
      onClick={handleSync}
      disabled={isLoading}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Sincronizando..." : "Forçar Sincronização"}
    </Button>
  )
}
