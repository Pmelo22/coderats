"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginButton from "../components/login-button"
import { useFirebaseAuth } from "@/components/firebase-session-provider"

export default function HomePage() {
  const { user, loading } = useFirebaseAuth()
  const router = useRouter()
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  useEffect(() => {
    // Se o usuário estiver autenticado, sincroniza os dados no Firestore
    if (!loading && user && syncStatus === "idle") {
      setSyncStatus("syncing");
      (async () => {
        try {
          const { getFirestore, doc, setDoc } = await import("firebase/firestore");
          const { app } = await import("@/lib/firebase");
          const db = getFirestore(app);
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          setSyncStatus("success");
          console.log("User synced successfully (client-side)");
        } catch (error) {
          console.error("Error syncing user (client-side):", error);
          setSyncStatus("error");
        }
      })();
    }
  }, [loading, user, router, syncStatus])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">GitHub Contributions Ranking</h1>
        <p className="text-xl text-gray-300">
          Compete with other developers and track your GitHub contributions in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {user ? (
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg" asChild>
              <Link href="/profile">View Your Profile</Link>
            </Button>
          ) : (
            <LoginButton />
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
