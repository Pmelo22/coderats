import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - CodeRats',
  description: 'Descubra insights sobre desenvolvimento, open source e estratégias para melhorar seu ranking no GitHub.',
  keywords: 'blog, desenvolvimento, open source, github, programação, tecnologia',
  openGraph: {
    title: 'Blog - CodeRats',
    description: 'Descubra insights sobre desenvolvimento, open source e estratégias para melhorar seu ranking no GitHub.',
    type: 'website',
  },
}

const blogPosts = [
  {
    id: 'contribuicoes-open-source',
    title: 'Como Maximizar Suas Contribuições Open Source',
    description: 'Descubra estratégias eficazes para aumentar suas contribuições em projetos open source e melhorar seu perfil de desenvolvedor.',
    date: '2024-01-15',
    readTime: '8 min',
    author: 'CodeRats Team',
    category: 'Open Source',
    tags: ['GitHub', 'Contribuições', 'Open Source', 'Desenvolvimento'],
    excerpt: 'Aprenda técnicas práticas para encontrar projetos relevantes, fazer contribuições significativas e construir uma reputação sólida na comunidade open source.'
  },
  {
    id: 'estrategias-ranking-github',
    title: 'Estratégias Avançadas para Melhorar seu Ranking no GitHub',
    description: 'Explore métodos comprovados para otimizar seu perfil GitHub e escalar no ranking de desenvolvedores.',
    date: '2024-01-10',
    readTime: '12 min',
    author: 'CodeRats Team',
    category: 'GitHub',
    tags: ['GitHub', 'Ranking', 'Perfil', 'Carreira'],
    excerpt: 'Descubra como a consistência, qualidade do código e engajamento comunitário podem transformar seu perfil GitHub em uma ferramenta poderosa para sua carreira.'
  },
  {
    id: 'tendencias-desenvolvimento-2024',
    title: 'Tendências de Desenvolvimento em 2024',
    description: 'Análise das principais tendências tecnológicas que estão moldando o futuro do desenvolvimento de software.',
    date: '2024-01-05',
    readTime: '10 min',
    author: 'CodeRats Team',
    category: 'Tecnologia',
    tags: ['Tendências', '2024', 'Tecnologia', 'IA', 'Web3'],
    excerpt: 'Uma visão abrangente das tecnologias emergentes, desde IA e Machine Learning até Web3 e desenvolvimento sustentável.'
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog CodeRats
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, estratégias e conhecimento para desenvolvedores que querem crescer na comunidade open source
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {blogPosts.map((post, index) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {new Date(post.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <Link 
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2 w-full"
                >
                  Ler artigo
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Quer mais conteúdo? Siga-nos nas redes sociais e fique por dentro das novidades!
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="#"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Twitter
            </Link>
            <Link 
              href="#"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              LinkedIn
            </Link>
            <Link 
              href="#"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}