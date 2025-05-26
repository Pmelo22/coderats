"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">GitHub Contributions Ranking</h1>
        <p className="text-xl text-gray-300">
          Compete with other developers and track your GitHub contributions in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
        </div>


        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-emerald-500 text-xl font-bold mb-2">1. Connect</div>
              <p className="text-gray-300">Sign in with your GitHub account to join the competition</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-emerald-500 text-xl font-bold mb-2">2. Contribute</div>
              <p className="text-gray-300">Make commits, open PRs, and contribute to repositories</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-emerald-500 text-xl font-bold mb-2">3. Compete</div>
              <p className="text-gray-300">Watch your ranking rise as you become more active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
