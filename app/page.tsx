"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function HomePage() {
  const { data: session, status } = useSession()
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
          Compete with other developers and track your GitHub contributions in real-time.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {status === "authenticated" ? (
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg" asChild>
              <Link href="/profile">View Your Profile</Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
              onClick={() => signIn("github")}
            >
              Login with GitHub
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="border-gray-600 text-gray-200 hover:bg-gray-700 px-8 py-6 text-lg"
            asChild
          >
            <Link href="/ranking">View Ranking</Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-emerald-500 text-xl font-bold mb-2">1. Connect</div>
              <p className="text-gray-300">Sign in with your GitHub account to join the competition</p>
            </motion.div>
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-emerald-500 text-xl font-bold mb-2">2. Contribute</div>
              <p className="text-gray-300">Make commits, open PRs, and contribute to repositories</p>
            </motion.div>
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-emerald-500 text-xl font-bold mb-2">3. Compete</div>
              <p className="text-gray-300">Watch your ranking rise as you become more active</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
