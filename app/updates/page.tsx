"use client"

import { useEffect, useState } from "react"
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
      }
    } catch (error) {
      console.error("Erro ao carregar atualizações:", error)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notas de Atualização</h1>
            <p className="text-gray-400">Acompanhe as últimas melhorias da plataforma</p>
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
        >
          {!loading && updates.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">Nenhuma atualização ainda</h3>
                <p className="text-gray-400">
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
            >
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getTypeColor(update.type)} text-white`}>
                        {getTypeLabel(update.type)}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        v{update.version}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
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
                  <CardTitle className="text-white">{update.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-gray-300 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: update.content }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        {!loading && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-gray-400 mb-4">
              Tem sugestões ou encontrou algum problema?
            </p>
            <Button variant="outline" asChild>
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
