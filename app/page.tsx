"use client"

import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import AdminNotices from "@/components/AdminNotices"

export default function HomePage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{ position: "absolute", top: "20%", left: "10%" }}
        />
        <motion.div
          className="w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          style={{ position: "absolute", bottom: "20%", right: "10%" }}
        />
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 z-10">
        {/* Admin Notices */}
        <AdminNotices location="home" />
        
        <motion.h1
          className="text-5xl font-bold tracking-tight"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Coderats
        </motion.h1>

        <motion.p
          className="text-xl text-gray-300"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Compete com outros desenvolvedores e acompanhe suas contribuições do GitHub em tempo real.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {status === "authenticated" ? (
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg" asChild>
              <Link href="/profile">Ver Seu Perfil</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg border border-gray-600"
                onClick={async () => {
                  try {
                    await signIn("github")
                    toast({
                      variant: "default",
                      title: "Redirecionando...",
                      description: "Conectando com o GitHub.",
                    })
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Erro no login",
                      description: "Não foi possível conectar com o GitHub. Tente novamente.",
                    })
                  }
                }}
              >
                Login com GitHub
              </Button>
              <p className="text-sm text-gray-400 text-center">
                Conecte outras plataformas após o login
              </p>
            </div>
          )}

          <Button
            variant="outline"
            size="lg"
            className="border-gray-600 text-gray-200 hover:bg-gray-700 px-8 py-6 text-lg"
            asChild
          >
            <Link href="/ranking">Ver Ranking</Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-emerald-500 text-xl font-bold mb-2">1. Conecte</div>
              <p className="text-gray-300">Faça login com GitHub para começar</p>
            </motion.div>
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-emerald-500 text-xl font-bold mb-2">2. Contribua</div>
              <p className="text-gray-300">Faça commits, abra PRs e contribua em todas as plataformas</p>
            </motion.div>
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-emerald-500 text-xl font-bold mb-2">3. Compete</div>
              <p className="text-gray-300">Veja seu ranking subir com atividades de múltiplas plataformas</p>
            </motion.div>
          </div>

          {/* Botão de Notas de Atualização */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-blue-600 text-blue-300 hover:bg-blue-900/30 px-8 py-4"
              asChild
            >
              <Link href="/updates">
                📋 Ver Notas de Atualização
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
