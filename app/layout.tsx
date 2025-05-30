import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { SessionProvider } from "@/components/session-provider"
import "./globals.css"

export const metadata = {
  title: "GitHub Contributions Ranking",
  description: "Track and compete with other developers based on GitHub contributions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1541985397530485"
          crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-screen bg-gray-900 text-white">
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}


import './globals.css'