import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { SessionProvider } from "@/components/session-provider"
import EmailPermissionAlert from "@/components/EmailPermissionAlert"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata = {
  title: {
    default: "CodeRats - Ranking de Desenvolvedores GitHub",
    template: "%s | CodeRats"
  },
  description: "Acompanhe e compare seu desempenho com outros desenvolvedores através do ranking baseado em contribuições do GitHub. Descubra, aprenda e evolua na comunidade de desenvolvedores.",
  keywords: ["GitHub", "ranking", "desenvolvedores", "programação", "open source", "contributions", "coding", "software", "Brasil"],
  authors: [{ name: "Patrick Albuquerque" }, { name: "Luis Guilherme" }],
  creator: "CodeRats Team",
  publisher: "CodeRats",
  applicationName: "CodeRats",
  generator: "Next.js",
  metadataBase: new URL('https://coderats.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "CodeRats - Ranking de Desenvolvedores GitHub",
    description: "Acompanhe e compare seu desempenho com outros desenvolvedores através do ranking baseado em contribuições do GitHub.",
    url: 'https://coderats.com.br',
    siteName: 'CodeRats',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CodeRats - Ranking de Desenvolvedores',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CodeRats - Ranking de Desenvolvedores GitHub",
    description: "Acompanhe e compare seu desempenho com outros desenvolvedores através do ranking baseado em contribuições do GitHub.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code',
  },
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
          <Toaster />          <footer className="w-full mt-16 border-t border-gray-800 bg-gray-900/80 text-gray-300 py-8 px-4">
            <div className="max-w-6xl mx-auto">
              {/* Links úteis */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-3">Navegação</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/" className="hover:text-emerald-400 transition-colors">Home</a></li>
                    <li><a href="/sobre" className="hover:text-emerald-400 transition-colors">Sobre</a></li>
                    <li><a href="/ranking" className="hover:text-emerald-400 transition-colors">Ranking</a></li>
                    <li><a href="/blog" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-3">Suporte</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/faq" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
                    <li><a href="/contato" className="hover:text-emerald-400 transition-colors">Contato</a></li>
                    <li><a href="mailto:contato@coderats.com" className="hover:text-emerald-400 transition-colors">Email</a></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-emerald-400 font-semibold mb-3">Legal</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/privacidade" className="hover:text-emerald-400 transition-colors">Política de Privacidade</a></li>
                    <li><a href="/termos" className="hover:text-emerald-400 transition-colors">Termos de Uso</a></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-emerald-400 font-semibold mb-3">Social</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="https://github.com/Pmelo22" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">GitHub</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a></li>
                    <li><a href="#" className="hover:text-emerald-400 transition-colors">LinkedIn</a></li>
                  </ul>
                </div>
              </div>

              {/* Informações da empresa */}
              <div className="border-t border-gray-700 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                  <div>
                    <p className="text-sm">
                      &copy; {new Date().getFullYear()} Coderats. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Desenvolvido por{" "}
                      <a href="https://github.com/Pmelo22" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400">Patrick Albuquerque</a>
                      {" e "}
                      <a href="https://github.com/Luluzao0" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400">Luis Guilherme</a>
                    </p>
                  </div>
                  
                  {/* Dedicatória */}
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-2">Para a pessoa que mais amo nesse mundo, mesmo distante, amar-te-ei para sempre. L</p>
                    <iframe
                      style={{ borderRadius: '8px' }}
                      src="https://open.spotify.com/embed/track/4IiviKTCCIJSYsWzxCpqsD?utm_source=generator"
                      width="280"
                      height="100"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
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