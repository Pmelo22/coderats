import { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  params: { id: string }
}

const blogPosts = {
  'contribuicoes-open-source': {
    id: 'contribuicoes-open-source',
    title: 'Como Maximizar Suas Contribuições Open Source',
    description: 'Descubra estratégias eficazes para aumentar suas contribuições em projetos open source e melhorar seu perfil de desenvolvedor.',
    date: '2024-01-15',
    readTime: '8 min',
    author: 'CodeRats Team',
    category: 'Open Source',
    tags: ['GitHub', 'Contribuições', 'Open Source', 'Desenvolvimento'],
    content: `
# Como Maximizar Suas Contribuições Open Source

Contribuir com projetos open source é uma das melhores maneiras de desenvolver suas habilidades como programador, construir um portfólio sólido e fazer parte da comunidade global de desenvolvedores.

## Por que contribuir?

### 1. Desenvolvimento profissional
- **Experiência real**: Trabalhe em projetos reais usados por milhares de pessoas
- **Code review**: Receba feedback de desenvolvedores experientes
- **Networking**: Conecte-se com outros desenvolvedores ao redor do mundo

### 2. Crescimento técnico
- **Aprenda novas tecnologias**: Explore diferentes linguagens e frameworks
- **Boas práticas**: Aprenda padrões de código e arquitetura
- **Ferramentas**: Domine Git, CI/CD, testes automatizados

## Como começar

### 1. Encontre projetos adequados
- Use o GitHub Explore para descobrir projetos populares
- Procure por labels como "good first issue" ou "help wanted"
- Considere projetos que você já usa no seu dia a dia

### 2. Entenda o projeto
- Leia o README.md cuidadosamente
- Estude o CONTRIBUTING.md se existir
- Navegue pelo código para entender a estrutura

### 3. Faça sua primeira contribuição
- Comece com documentação ou correção de bugs simples
- Siga as diretrizes de contribuição do projeto
- Seja respeitoso e paciente com os maintainers

## Dicas importantes

- **Qualidade sobre quantidade**: É melhor fazer poucas contribuições bem feitas
- **Seja consistente**: Contribua regularmente, mesmo que sejam pequenas melhorias
- **Comunique-se**: Participe de discussões e seja ativo na comunidade

## Ferramentas úteis

### GitHub CLI
O GitHub CLI permite interagir com o GitHub diretamente do terminal, facilitando o processo de contribuição.

### VS Code Extensions
- GitLens: Visualize histórico e autoria do código
- GitHub Pull Requests: Gerencie PRs diretamente no editor
- GitGraph: Visualize branches e commits

## Conclusão

Contribuir com projetos open source é um investimento no seu futuro como desenvolvedor. Comece pequeno, seja consistente e sempre busque aprender. A comunidade open source é acolhedora e está sempre disposta a ajudar novos contribuidores.
`
  },
  'estrategias-ranking-github': {
    id: 'estrategias-ranking-github',
    title: 'Estratégias Avançadas para Melhorar seu Ranking no GitHub',
    description: 'Explore métodos comprovados para otimizar seu perfil GitHub e escalar no ranking de desenvolvedores.',
    date: '2024-01-10',
    readTime: '12 min',
    author: 'CodeRats Team',
    category: 'GitHub',
    tags: ['GitHub', 'Ranking', 'Perfil', 'Carreira'],
    content: `
# Estratégias Avançadas para Melhorar seu Ranking no GitHub

Seu perfil GitHub é muito mais que um repositório de código - é sua vitrine profissional. Neste artigo, vamos explorar estratégias comprovadas para otimizar seu perfil e melhorar seu ranking.

## Entendendo o sistema de ranking

### Fatores que influenciam o ranking
- **Contribuições consistentes**: Commits regulares demonstram disciplina
- **Qualidade do código**: Código limpo e bem documentado
- **Engajamento comunitário**: Stars, forks e colaborações
- **Diversidade de projetos**: Diferentes linguagens e tecnologias

## Estratégias de otimização

### 1. Consistência é fundamental
- Mantenha um streak de commits
- Contribua regularmente, mesmo que sejam pequenas melhorias
- Use GitHub Actions para automatizar contribuições

### 2. Qualidade do código
- Escreva README.md detalhados
- Use comentários explicativos
- Implemente testes automatizados
- Siga padrões de codificação

### 3. Projetos showcase
- Crie projetos que demonstrem suas habilidades
- Documente o processo de desenvolvimento
- Inclua demos e screenshots

## Técnicas avançadas

### Green squares optimization
- Planeje suas contribuições
- Use ferramentas como GitHub Calendar
- Mantenha atividade mesmo durante feriados

### Profile optimization
- Use um README no seu perfil principal
- Adicione estatísticas do GitHub
- Inclua links para projetos importantes

### Community engagement
- Participe de discussões
- Faça code reviews construtivos
- Contribua com projetos populares

## Métricas importantes

### Stars e Forks
- Crie projetos úteis para a comunidade
- Compartilhe em redes sociais
- Participe de hackathons

### Pull Requests
- Contribua com projetos open source
- Documente bem suas contribuições
- Seja responsivo aos feedbacks

## Ferramentas recomendadas

### GitHub Analytics
- GitHub Stats
- Profile Trophy
- Streak Stats

### Automação
- GitHub Actions para CI/CD
- Dependabot para atualizações
- CodeQL para análise de segurança

## Conclusão

Melhorar seu ranking no GitHub é um processo gradual que requer consistência e estratégia. Foque na qualidade, seja ativo na comunidade e sempre busque aprender novas tecnologias.
`
  },
  'tendencias-desenvolvimento-2024': {
    id: 'tendencias-desenvolvimento-2024',
    title: 'Tendências de Desenvolvimento em 2024',
    description: 'Análise das principais tendências tecnológicas que estão moldando o futuro do desenvolvimento de software.',
    date: '2024-01-05',
    readTime: '10 min',
    author: 'CodeRats Team',
    category: 'Tecnologia',
    tags: ['Tendências', '2024', 'Tecnologia', 'IA', 'Web3'],
    content: `
# Tendências de Desenvolvimento em 2024

O mundo do desenvolvimento de software está em constante evolução. Em 2024, várias tendências estão moldando o futuro da nossa área. Vamos explorar as principais tecnologias e práticas que todo desenvolvedor deveria conhecer.

## Inteligência Artificial e Machine Learning

### IA Generativa
- **GitHub Copilot**: Assistente de código alimentado por IA
- **ChatGPT e GPT-4**: Para documentação e resolução de problemas
- **Stable Diffusion**: Geração de imagens para interfaces

### MLOps
- Pipelines automatizados de machine learning
- Monitoramento de modelos em produção
- Versionamento de datasets e modelos

## Desenvolvimento Web Moderno

### Frameworks Meta
- **Next.js 14**: Server components e edge computing
- **Nuxt 3**: Vue.js com foco em performance
- **SvelteKit**: Simplicidade e performance

### Edge Computing
- Cloudflare Workers
- Vercel Edge Functions
- AWS Lambda@Edge

## Web3 e Blockchain

### Desenvolvimento Descentralizado
- Smart contracts com Solidity
- DApps (Aplicações Descentralizadas)
- NFTs e tokenização

### Ferramentas Web3
- Hardhat para desenvolvimento Ethereum
- IPFS para armazenamento descentralizado
- MetaMask SDK para integração de wallets

## DevOps e Cloud

### Containers e Orquestração
- **Docker**: Containerização universal
- **Kubernetes**: Orquestração em escala
- **Podman**: Alternativa segura ao Docker

### Infrastructure as Code
- Terraform para provisionamento
- Ansible para configuração
- GitOps com ArgoCD

## Linguagens em Alta

### Rust
- Performance próxima ao C/C++
- Segurança de memória
- Crescimento em sistemas e web

### TypeScript
- Tipagem estática para JavaScript
- Melhor tooling e DX
- Adoção em larga escala

### Go
- Simplicidade e performance
- Ideal para microservices
- Forte ecossistema cloud

## Segurança

### DevSecOps
- Security by design
- Testes de segurança automatizados
- Compliance as code

### Zero Trust Architecture
- Verificação contínua
- Acesso baseado em contexto
- Segurança em camadas

## Mobile e Cross-Platform

### Flutter
- UI nativa em múltiplas plataformas
- Dart como linguagem
- Crescimento empresarial

### React Native
- Código compartilhado iOS/Android
- Expo para desenvolvimento rápido
- New Architecture com Fabric

## Sustentabilidade

### Green Computing
- Código eficiente em energia
- Infraestrutura sustentável
- Métricas de carbono

## Conclusão

2024 promete ser um ano transformador para o desenvolvimento de software. A chave é manter-se atualizado, experimentar novas tecnologias e sempre focar na solução de problemas reais. O futuro pertence àqueles que conseguem adaptar-se rapidamente às mudanças.
`
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts[params.id as keyof typeof blogPosts]
  
  if (!post) {
    return {
      title: 'Post não encontrado - CodeRats'
    }
  }

  return {
    title: `${post.title} - CodeRats Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  }
}

export default function BlogPost({ params }: Props) {
  const post = blogPosts[params.id as keyof typeof blogPosts]

  if (!post) {
    notFound()
  }

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{line.substring(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">{line.substring(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium text-gray-700 mb-3 mt-4">{line.substring(4)}</h3>
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-2 text-gray-600">{line.substring(2)}</li>
        }
        if (line.trim() === '') {
          return <br key={index} />
        }
        return <p key={index} className="mb-4 text-gray-600 leading-relaxed">{line}</p>
      })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {post.readTime}
              </div>
            </div>
            
            <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {post.title}
            </CardTitle>
            
            <p className="text-xl text-gray-600 mt-4">
              {post.description}
            </p>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-2" />
                  {post.author}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(post.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="pt-6">
            <article className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed">
                {formatContent(post.content)}
              </div>
            </article>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Gostou do conteúdo?
            </h3>
            <p className="text-gray-600 mb-6">
              Siga-nos para mais dicas sobre desenvolvimento e open source!
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/blog" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2">
                Mais artigos
              </Link>
              <Link href="/contato" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Entre em contato
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
