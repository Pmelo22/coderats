"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function RankingNote() {
  return (
    <Alert className="bg-gray-800 border-emerald-600 mb-6">
      <Info className="h-4 w-4 text-emerald-500" />
      <AlertTitle>Informações sobre o Ranking</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>Este ranking considera apenas contribuições feitas a partir de 1º de abril de 2025.</p>
        <p>
          Os critérios de avaliação incluem commits, pull requests, issues, revisões de código, diversidade de projetos
          e consistência de contribuições.
        </p>
      </AlertDescription>
    </Alert>
  )
}
