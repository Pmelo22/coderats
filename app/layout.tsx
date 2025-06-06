import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { SessionProvider } from "@/components/session-provider"
import EmailPermissionAlert from "@/components/EmailPermissionAlert"
import { Toaster } from "@/components/ui/toaster"
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
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/svg+xml" href="/placeholder-logo.svg" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1541985397530485"
          crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-screen bg-gray-900 text-white">        <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">          <Navbar />
          <EmailPermissionAlert />
          <main>{children}</main>
          <Toaster />
          <footer className="w-full mt-16 border-t border-gray-800 bg-gray-900/80 text-gray-300 py-8 px-4 flex flex-col items-center gap-4">
            <div className="w-full flex flex-col md:flex-row justify-center items-start md:items-start gap-8 md:gap-0 max-w-4xl mx-auto text-center">
              {/* Contato */}
              <div className="flex-1 px-2 min-w-[200px]">
                <span className="block font-semibold text-emerald-400 mb-1">Contato com a equipe</span>
                <a href="mailto:contato@coderats.com" className="underline hover:text-emerald-400 break-all">contato@coderats.com</a>
              </div>
              {/* Desenvolvido por */}
              <div className="flex-1 px-2 min-w-[200px]">
                <span className="block font-semibold text-emerald-400 mb-1">Desenvolvido por</span>
                <span className="block text-xs">Equipe Coderats &copy; {new Date().getFullYear()}</span>
                <span className="block text-xs">
                  Créditos:
                  <a href="https://github.com/Pmelo22" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 ml-1">Patrick Albuquerque</a>
                  <span className="mx-1">|</span>
                  <a href="https://github.com/Luluzao0" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400">Luis Guilherme</a>
                </span>
              </div>
              {/* Dedicatória */}
              <div className="flex-1 px-2 min-w-[220px] flex flex-col items-center">
                <span className="block font-semibold text-emerald-400 mb-1">Dedicatória</span>
                <span className="block text-xs mb-2">Para a pessoa que mais amo nesse mundo, mesmo distante, amar-te-ei para sempre. L </span>
                <div className="flex justify-center w-full">
                  <iframe
                    style={{ borderRadius: '12px' }}
                    src="https://open.spotify.com/embed/track/4IiviKTCCIJSYsWzxCpqsD?utm_source=generator"
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </SessionProvider>
      </body>
    </html>
  )
}


import './globals.css'