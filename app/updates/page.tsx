"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"

interface UpdateNote {
  id: string
  title: string
  content: string
  version: string
  date: string
  author: string
  type: "feature" | "bugfix" | "improvement" | "breaking"
}

export default function UpdatesPage() {
  const { toast } = useToast()
  const [updates, setUpdates] = useState<UpdateNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpdates()
  }, [])
  const fetchUpdates = async () => {
    try {
      const response = await fetch("/api/admin/updates")
      if (response.ok) {
        const data = await response.json()
        setUpdates(data.updates || [])
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao carregar atualizações",
          description: "Não foi possível carregar as notas de atualização.",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar atualizações:", error)
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Falha na conexão com o servidor. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-emerald-600"
      case "bugfix":
        return "bg-red-600"
      case "improvement":
        return "bg-blue-600"
      case "breaking":
        return "bg-orange-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "feature":
        return "Nova Funcionalidade"
      case "bugfix":
        return "Correção"
      case "improvement":
        return "Melhoria"
      case "breaking":
        return "Mudança Importante"
      default:
        return "Atualização"
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Notas de Atualização</h1>
            <p className="text-gray-400 text-sm sm:text-base">Acompanhe as últimas melhorias da plataforma</p>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Updates List */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >          {!loading && updates.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 sm:p-8 text-center">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Nenhuma atualização ainda</h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  As notas de atualização aparecerão aqui quando disponíveis.
                </p>
              </CardContent>
            </Card>
          )}

          {updates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <Badge className={`${getTypeColor(update.type)} text-white text-xs sm:text-sm`}>
                        {getTypeLabel(update.type)}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs sm:text-sm">
                        v{update.version}
                      </Badge>
                    </div>                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(update.date).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {update.author}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg sm:text-xl mt-2">{update.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div
                    className="text-gray-300 prose prose-invert prose-sm sm:prose-base max-w-none"
                    dangerouslySetInnerHTML={{ __html: update.content }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>        {/* Call to Action */}
        {!loading && (
          <motion.div
            className="mt-8 sm:mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Tem sugestões ou encontrou algum problema?
            </p>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href="mailto:suporte@coderats.com">
                Entrar em Contato
              </a>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
