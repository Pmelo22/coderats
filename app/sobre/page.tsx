import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Github, Star, Users, TrendingUp, Globe, Code, BookOpen } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Sobre Nós - CodeRats',
  description: 'Conheça a CodeRats, plataforma dedicada a promover e reconhecer talentos em desenvolvimento de software através de rankings transparentes do GitHub.',
  keywords: 'sobre, coderats, desenvolvimento, github, ranking, desenvolvedores, open source, brasil',
  openGraph: {
    title: 'Sobre Nós - CodeRats',
    description: 'Conheça a CodeRats, plataforma dedicada a promover e reconhecer talentos em desenvolvimento de software através de rankings transparentes do GitHub.',
    type: 'website',
  },
}

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <div className="p-2 rounded-md hover:bg-gray-800 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold">Sobre o Coderats</h1>
        </div>

        <div className="space-y-8">
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-emerald-400" />
                  O que é o Coderats?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  O Coderats é uma plataforma inovadora que visa reconhecer e valorizar desenvolvedores brasileiros 
                  através de suas contribuições no GitHub. Nossa missão é criar uma comunidade onde programadores 
                  podem competir de forma saudável, compartilhar conhecimento e crescer profissionalmente.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Através de um sistema de ranking dinâmico, analisamos commits, pull requests, issues e outros 
                  indicadores de produtividade para criar uma classificação justa e transparente dos desenvolvedores 
                  mais ativos da comunidade.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-emerald-400" />
                  Nossa História
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  O projeto nasceu em 2024 da necessidade de criar uma forma mais visual e gamificada de 
                  acompanhar a evolução dos desenvolvedores. Dois amigos apaixonados por programação, 
                  Patrick Albuquerque e Luis Guilherme, decidiram unir forças para criar algo que beneficiasse 
                  toda a comunidade de desenvolvedores.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Começamos como um projeto pessoal para acompanhar nossas próprias contribuições, mas logo 
                  percebemos o potencial de expandir para toda a comunidade. Hoje, o Coderats é uma plataforma 
                  que conecta desenvolvedores e incentiva a colaboração em projetos open source.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Badge variant="secondary" className="w-fit">
                      <Github className="h-4 w-4 mr-2" />
                      Integração GitHub
                    </Badge>
                    <p className="text-sm text-gray-300">
                      Conectamos diretamente com sua conta GitHub para analisar suas contribuições de forma automática e segura.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Badge variant="secondary" className="w-fit">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Sistema de Pontuação
                    </Badge>
                    <p className="text-sm text-gray-300">
                      Desenvolvemos um algoritmo próprio que pondera diferentes tipos de contribuições para criar um score justo.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Badge variant="secondary" className="w-fit">
                      <Users className="h-4 w-4 mr-2" />
                      Ranking em Tempo Real
                    </Badge>
                    <p className="text-sm text-gray-300">
                      Acompanhe sua posição no ranking e veja como você se compara com outros desenvolvedores da comunidade.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Badge variant="secondary" className="w-fit">
                      <Globe className="h-4 w-4 mr-2" />
                      Perfis Públicos
                    </Badge>
                    <p className="text-sm text-gray-300">
                      Cada desenvolvedor tem um perfil público onde pode showcasar seus projetos e conquistas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-6 w-6 text-emerald-400" />
                  Quem Somos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      P
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-400">Patrick Albuquerque</h3>
                    <p className="text-sm text-gray-400 mb-2">Co-fundador & Desenvolvedor</p>
                    <p className="text-sm text-gray-300">
                      Especialista em desenvolvimento web e arquitetura de sistemas. Apaixonado por criar 
                      soluções que conectam pessoas e facilitam o crescimento profissional.
                    </p>
                    <a 
                      href="https://github.com/Pmelo22" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-3 py-1 border border-gray-600 rounded-md text-sm hover:bg-gray-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      L
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-400">Luis Guilherme</h3>
                    <p className="text-sm text-gray-400 mb-2">Co-fundador & Desenvolvedor</p>
                    <p className="text-sm text-gray-300">
                      Expert em desenvolvimento frontend e design de interfaces. Focado em criar experiências 
                      de usuário excepcionais e interfaces intuitivas.
                    </p>
                    <a 
                      href="https://github.com/Luluzao0" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-3 py-1 border border-gray-600 rounded-md text-sm hover:bg-gray-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-emerald-400">Junte-se à Comunidade!</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Faça parte de uma comunidade de desenvolvedores apaixonados por código. 
              Conecte-se, compita de forma saudável e cresça profissionalmente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/ranking"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-md transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                Ver Ranking
              </Link>
              <Link 
                href="/contato"
                className="inline-flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-md transition-colors"
              >
                Entrar em Contato
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
