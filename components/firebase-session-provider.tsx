"use client"
import React, { createContext, useContext } from "react"

interface IFirebaseAuthContext {
  user: any
  loading: boolean
}

const FirebaseAuthContext = createContext<IFirebaseAuthContext>({ user: null, loading: true })

export function FirebaseSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthContext.Provider value={{ user: null, loading: false }}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext)
}
