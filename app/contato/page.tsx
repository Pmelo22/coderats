import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, MessageCircle, Github, Clock, Send } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Contato - CodeRats',
  description: 'Entre em contato com a equipe CodeRats. Dúvidas, sugestões ou parcerias - estamos aqui para ajudar você.',
  keywords: 'contato, coderats, suporte, dúvidas, parcerias, desenvolvedor, github, ranking',
  openGraph: {
    title: 'Contato - CodeRats',
    description: 'Entre em contato com a equipe CodeRats. Dúvidas, sugestões ou parcerias - estamos aqui para ajudar você.',
    type: 'website',
  },
}

export default function ContatoPage() {
  return (    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Contato</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-emerald-400" />
                  Fale Conosco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Tem alguma dúvida, sugestão ou gostaria de fazer uma parceria? 
                  Entre em contato conosco! Estamos sempre dispostos a ouvir a comunidade 
                  e melhorar a plataforma.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="h-5 w-5 text-emerald-400" />
                    <span>contato@coderats.com.br</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <Github className="h-5 w-5 text-emerald-400" />
                    <span>github.com/coderats</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <span>Respondemos em até 24h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-6 w-6 text-emerald-400" />
                  Tipos de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400 border-emerald-400/30">
                      Suporte
                    </Badge>
                    <span className="text-gray-300 text-sm">Problemas técnicos e dúvidas</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-400/30">
                      Sugestões
                    </Badge>
                    <span className="text-gray-300 text-sm">Ideias para melhorar a plataforma</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-400/30">
                      Parcerias
                    </Badge>
                    <span className="text-gray-300 text-sm">Colaborações e oportunidades</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 border-orange-400/30">
                      Mídia
                    </Badge>
                    <span className="text-gray-300 text-sm">Imprensa e divulgação</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-emerald-400" />
                  Como Entrar em Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">
                    Para entrar em contato conosco, envie um email para:
                  </p>
                  <div className="inline-flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-md mb-4">
                    <Mail className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">contato@coderats.com.br</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Ou abra uma issue em nosso repositório do GitHub
                  </p>                  <Link 
                    href="https://github.com/coderats" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-600 text-gray-300 hover:bg-gray-700 h-9 px-4 py-2 mt-4"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Abrir Issue no GitHub
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400">
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-400">
                  • Todas as mensagens são tratadas com confidencialidade
                </p>
                <p className="text-xs text-gray-400">
                  • Tempo de resposta médio: 24 horas úteis
                </p>
                <p className="text-xs text-gray-400">
                  • Para bugs urgentes, use nosso GitHub Issues
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}