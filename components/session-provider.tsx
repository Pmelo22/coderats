"use client"

import type React from "react"
import { FirebaseSessionProvider } from "@/components/firebase-session-provider"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseSessionProvider>{children}</FirebaseSessionProvider>
}
