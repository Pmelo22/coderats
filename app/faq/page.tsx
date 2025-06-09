import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle, ChevronDown, Github, Star, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'FAQ - Perguntas Frequentes - CodeRats',
  description: 'Encontre respostas para as principais dúvidas sobre o CodeRats, rankings do GitHub, pontuação e como participar da comunidade.',
  keywords: 'faq, perguntas frequentes, coderats, dúvidas, github, ranking, pontuação, como funciona',
  openGraph: {
    title: 'FAQ - Perguntas Frequentes - CodeRats',
    description: 'Encontre respostas para as principais dúvidas sobre o CodeRats, rankings do GitHub, pontuação e como participar da comunidade.',
    type: 'website',
  },
}

const faqData = [
  {
    category: "Geral",
    icon: HelpCircle,
    color: "text-emerald-400",
    questions: [
      {
        question: "O que é o CodeRats?",
        answer: "O CodeRats é uma plataforma que cria rankings de desenvolvedores brasileiros baseados em suas atividades no GitHub. Analisamos commits, pull requests, issues e outros indicadores para reconhecer os talentos mais ativos da comunidade."
      },
      {
        question: "Como funciona o sistema de ranking?",
        answer: "Nosso algoritmo analisa diversos fatores como número de commits, qualidade dos repositórios, engajamento da comunidade, linguagens utilizadas e consistência na atividade. Cada métrica tem um peso diferente na pontuação final."
      },
      {
        question: "É gratuito usar o CodeRats?",
        answer: "Sim! O CodeRats é completamente gratuito para todos os desenvolvedores. Nossa missão é promover e reconhecer talentos, não lucrar com isso."
      }
    ]
  },
  {
    category: "Ranking",
    icon: TrendingUp,
    color: "text-blue-400",
    questions: [
      {
        question: "Como minha pontuação é calculada?",
        answer: "A pontuação considera: commits (30%), pull requests (25%), issues abertas/resolvidas (20%), stars recebidas (15%) e diversidade de linguagens (10%). Os valores são atualizados diariamente."
      },
      {
        question: "Por que minha posição mudou?",
        answer: "Os rankings são dinâmicos e atualizados diariamente. Sua posição pode mudar com base na sua atividade recente e na dos outros desenvolvedores. Mantenha-se ativo para subir no ranking!"
      },
      {
        question: "Posso disputar em diferentes categorias?",
        answer: "Sim! Temos rankings por linguagem de programação, região, tipo de projeto e ranking geral. Você pode se destacar em múltiplas categorias simultaneamente."
      }
    ]
  },
  {
    category: "Participação",
    icon: Users,
    color: "text-purple-400",
    questions: [
      {
        question: "Como me cadastro no CodeRats?",
        answer: "Não é necessário cadastro! Basta ter um perfil público no GitHub. Nosso sistema coleta automaticamente os dados públicos e você aparece no ranking baseado na sua atividade."
      },
      {
        question: "Posso remover meu perfil do ranking?",
        answer: "Sim, respeitamos sua privacidade. Entre em contato conosco se desejar remover seu perfil dos rankings. Também respeitamos configurações de privacidade do GitHub."
      },
      {
        question: "Como posso melhorar minha posição?",
        answer: "Seja ativo no GitHub! Faça commits regulares, contribua para projetos open source, abra issues construtivas, revise pull requests e mantenha repositórios bem documentados."
      }
    ]
  },
  {
    category: "Técnico",
    icon: Github,
    color: "text-orange-400",
    questions: [
      {
        question: "Com que frequência os dados são atualizados?",
        answer: "Os dados são sincronizados diariamente com a API do GitHub. Rankings são recalculados toda noite, garantindo informações sempre atualizadas."
      },
      {
        question: "Que dados do GitHub vocês coletam?",
        answer: "Coletamos apenas dados públicos: repositórios, commits, pull requests, issues, linguagens utilizadas e informações básicas do perfil. Nunca acessamos dados privados."
      },
      {
        question: "Posso usar a API do CodeRats?",
        answer: "Estamos desenvolvendo uma API pública! Em breve você poderá integrar nossos dados em suas aplicações. Acompanhe nossas atualizações."
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Perguntas Frequentes</h1>
        </div>

        {/* Introdução */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardContent className="pt-6">
            <p className="text-gray-300 leading-relaxed">
              Aqui você encontra respostas para as principais dúvidas sobre o CodeRats. 
              Se sua pergunta não estiver listada, entre em contato conosco!
            </p>
          </CardContent>
        </Card>

        {/* FAQ por Categoria */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <category.icon className={`h-6 w-6 ${category.color}`} />
                <h2 className="text-xl font-semibold">{category.category}</h2>
              </div>
              
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => (
                  <Card key={questionIndex} className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium flex items-center justify-between">
                        <span className="text-gray-200">{item.question}</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-emerald-400/30 mt-12">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ainda tem dúvidas?</h3>
              <p className="text-gray-300">
                Nossa equipe está sempre pronta para ajudar! Entre em contato conosco.
              </p>              <div className="flex gap-4 justify-center">
                <Link href="/contato" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 py-2">
                  Fale Conosco
                </Link>
                <Link 
                  href="https://github.com/coderats" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-gray-600 text-gray-300 hover:bg-gray-700 h-9 px-4 py-2"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}