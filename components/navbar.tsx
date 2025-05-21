"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GithubIcon, LogOut, User, BarChart2 } from "lucide-react"
import { useFirebaseAuth } from "@/components/firebase-session-provider"
import { signInWithPopup, GithubAuthProvider, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Navbar() {
  const { user, loading } = useFirebaseAuth()
  const isAuthenticated = !!user

  const handleSignIn = async () => {
    const provider = new GithubAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const handleSignOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <GithubIcon className="h-6 w-6" />
              <span className="text-lg font-bold">GitHub Ranking</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <Link href="/ranking" className="text-sm font-medium hover:text-emerald-400 transition-colors">
              Ranking
            </Link>
            {isAuthenticated && (
              <Link href="/profile" className="text-sm font-medium hover:text-emerald-400 transition-colors">
                Meu Perfil
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {loading ? (
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse" />
              </Button>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.displayName || ""} />
                      <AvatarFallback>{user.displayName?.substring(0, 2) || "GH"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">@{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/ranking" className="cursor-pointer flex w-full items-center">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      <span>Ranking</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSignIn}>
                <GithubIcon className="mr-2 h-4 w-4" />
                Login with GitHub
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
