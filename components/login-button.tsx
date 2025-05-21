"use client"

import { Button } from "@/components/ui/button"
import { GithubIcon } from "lucide-react"
import { useState } from "react"
import { signInWithPopup, GithubAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const provider = new GithubAuthProvider()
      await signInWithPopup(auth, provider)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          <GithubIcon className="mr-2 h-5 w-5" />
          Login with GitHub
        </>
      )}
    </Button>
  )
}
