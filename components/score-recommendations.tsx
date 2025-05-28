import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  GitCommitHorizontal, 
  GitPullRequestIcon, 
  GitForkIcon, 
  Code, 
  Users, 
  Calendar, 
  Trophy,
  Target,
  TrendingUp,
  ExternalLink,
  Clock,
  AlertTriangle,
  Flame,
  Award,
  Zap
} from "lucide-react"

interface Recommendation {
  icon: React.ReactNode
  title: string
  description: string
  impact: string
  priority: 'high' | 'medium' | 'low'
  category: 'weakness' | 'goal' | 'streak' | 'comparison'
  actionButton?: {
    text: string
    url: string
  }
  scoreImpact?: number
  badge?: string
}

interface WeeklyGoal {
  type: string
  target: number
  current: number
  description: string
  icon: React.ReactNode
}

export default function ScoreRecommendations({ userData, allUsers }: { userData: any, allUsers?: any[] }) {
  // Analisar pontos fracos do usuário
  const getWeakestMetrics = () => {
    const metrics = [
      { name: 'commits', value: userData.commits, weight: 40, label: 'Commits' },
      { name: 'pullRequests', value: userData.pullRequests, weight: 25, label: 'Pull Requests' },
      { name: 'issues', value: userData.issues, weight: 15, label: 'Issues' },
      { name: 'codeReviews', value: userData.codeReviews, weight: 10, label: 'Code Reviews' },
      { name: 'projects', value: userData.projects, weight: 5, label: 'Projetos' },
    ]
    
    return metrics.sort((a, b) => a.value - b.value).slice(0, 2)
  }

  // Calcular último update de cada métrica (simulado)
  const getLastActivity = () => {
    const now = new Date()
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return {
      lastPR: daysAgo(Math.floor(Math.random() * 30)),
      lastIssue: daysAgo(Math.floor(Math.random() * 20)),
      lastReview: daysAgo(Math.floor(Math.random() * 15)),
      lastCommit: daysAgo(Math.floor(Math.random() * 7))
    }
  }

  // Simulador de impacto no score
  const simulateScoreImpact = (metric: string, increase: number) => {
    const weights = {
      commits: 4,
      pullRequests: 2.5,
      issues: 1.5,
      codeReviews: 1,
      projects: 0.5
    }
    return Math.round(increase * weights[metric as keyof typeof weights])
  }

  // Encontrar próximo usuário no ranking
  const getNextRankUser = () => {
    if (!allUsers || !userData.rank) return null
    return allUsers.find(user => user.rank === userData.rank - 1)
  }

  // Gerar metas semanais baseadas nos pontos fracos
  const generateWeeklyGoals = (): WeeklyGoal[] => {
    const weakest = getWeakestMetrics()
    const goals: WeeklyGoal[] = []

    weakest.forEach(metric => {
      if (metric.name === 'commits') {
        goals.push({
          type: 'commits',
          target: 15,
          current: 3,
          description: 'Commits esta semana',
          icon: <GitCommitHorizontal className="h-4 w-4 text-emerald-500" />
        })
      } else if (metric.name === 'pullRequests') {
        goals.push({
          type: 'pullRequests',
          target: 3,
          current: 0,
          description: 'Pull Requests esta semana',
          icon: <GitPullRequestIcon className="h-4 w-4 text-purple-500" />
        })
      } else if (metric.name === 'issues') {
        goals.push({
          type: 'issues',
          target: 5,
          current: 1,
          description: 'Issues esta semana',
          icon: <GitForkIcon className="h-4 w-4 text-blue-500" />
        })
      }
    })

    return goals.slice(0, 2)
  }

  const weakestMetrics = getWeakestMetrics()
  const lastActivity = getLastActivity()
  const nextRankUser = getNextRankUser()
  const weeklyGoals = generateWeeklyGoals()

  // Gerar recomendações personalizadas
  const recommendations: Recommendation[] = []

  // 1. Recomendações por pontos fracos
  weakestMetrics.forEach((metric, index) => {
    if (metric.name === 'commits' && metric.value < 50) {
      recommendations.push({
        icon: <GitCommitHorizontal className="h-5 w-5 text-emerald-500" />,
        title: "Aumente seus commits",
        description: `Você fez poucos commits recentemente. Experimente fazer commits menores e mais frequentes.`,
        impact: "Alto impacto",
        priority: 'high',
        category: 'weakness',
        scoreImpact: simulateScoreImpact('commits', 10),
        badge: index === 0 ? "⚠️ Sua menor métrica" : undefined,
        actionButton: {
          text: "Ver projetos para contribuir",
          url: "https://github.com/trending"
        }
      })
    }

    if (metric.name === 'pullRequests' && metric.value < 10) {
      recommendations.push({
        icon: <GitPullRequestIcon className="h-5 w-5 text-purple-500" />,
        title: "Crie mais Pull Requests",
        description: `Você fez poucos PRs nas últimas semanas. Experimente contribuir com um repositório que você já segue.`,
        impact: "Médio impacto",
        priority: 'high',
        category: 'weakness',
        scoreImpact: simulateScoreImpact('pullRequests', 3),
        badge: index === 0 ? "⚠️ Sua menor métrica" : undefined,
        actionButton: {
          text: "Buscar Issues para resolver",
          url: "https://github.com/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
        }
      })
    }

    if (metric.name === 'issues' && metric.value < 15) {
      recommendations.push({
        icon: <GitForkIcon className="h-5 w-5 text-blue-500" />,
        title: "Abra mais Issues",
        description: `Você abriu poucas issues recentemente. Reporte bugs ou sugira melhorias em projetos que utiliza.`,
        impact: "Médio impacto",
        priority: 'medium',
        category: 'weakness',
        scoreImpact: simulateScoreImpact('issues', 5),
        badge: index === 0 ? "⚠️ Sua menor métrica" : undefined,
      })
    }
  })

  // 2. Recomendações por tempo de inatividade
  const daysSinceLastPR = Math.floor((new Date().getTime() - lastActivity.lastPR.getTime()) / (1000 * 60 * 60 * 24))
  const daysSinceLastIssue = Math.floor((new Date().getTime() - lastActivity.lastIssue.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceLastPR > 14) {
    recommendations.push({
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      title: "Tempo sem PRs",
      description: `⏰ Último PR há ${daysSinceLastPR} dias. Que tal abrir um novo?`,
      impact: "Médio impacto",
      priority: 'medium',
      category: 'weakness',
      scoreImpact: simulateScoreImpact('pullRequests', 1),
    })
  }

  if (daysSinceLastIssue > 20) {
    recommendations.push({
      icon: <Clock className="h-5 w-5 text-blue-400" />,
      title: "Tempo sem Issues",
      description: `⏰ Última issue há ${daysSinceLastIssue} dias. Você está contribuindo todo dia, mas não abriu nenhuma issue este mês.`,
      impact: "Baixo impacto",
      priority: 'low',
      category: 'weakness',
      scoreImpact: simulateScoreImpact('issues', 2),
    })
  }

  // 3. Comparação com próximo no ranking
  if (nextRankUser) {
    const scoreDiff = nextRankUser.score - userData.score
    if (scoreDiff < 50) {
      recommendations.push({
        icon: <TrendingUp className="h-5 w-5 text-amber-500" />,
        title: "Quase ultrapassando!",
        description: `Você está ${scoreDiff} pontos atrás de @${nextRankUser.username} — 1 PR e 1 Review te colocam à frente!`,
        impact: "Alta motivação",
        priority: 'high',
        category: 'comparison',
        scoreImpact: 4,
      })
    }
  }

  // 4. Recomendações de streak
  if (userData.streak < 7) {
    recommendations.push({
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      title: "Desenvolva seu streak",
      description: `Faça pelo menos uma contribuição por dia. Você está a ${7 - userData.streak} dias de uma semana completa!`,
      impact: "Baixo impacto",
      priority: 'low',
      category: 'streak',
      badge: userData.streak > 0 ? `🔥 ${userData.streak} dias` : undefined,
    })
  }

  // 5. Mini conquistas/objetivos
  const achievements = []
  if (userData.pullRequests >= 5 && userData.pullRequests < 10) {
    achievements.push({
      icon: <Award className="h-5 w-5 text-purple-400" />,
      title: "Próxima conquista",
      description: `Você está a ${10 - userData.pullRequests} PRs de desbloquear: "Contribuidor Frequente"`,
      impact: "Conquista",
      priority: 'medium' as const,
      category: 'goal' as const,
    })
  }

  recommendations.push(...achievements)

  // Ordenar por prioridade e limitar
  const sortedRecommendations = recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    .slice(0, 4)
  return (
    <div className="space-y-6">
      {/* Recomendações Principais */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-amber-500" />
            Recomendações Personalizadas
          </CardTitle>
          <CardDescription>Dicas baseadas nos seus pontos fracos e atividade recente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedRecommendations.length > 0 ? (
              sortedRecommendations.map((rec, index) => (
                <div key={index} className={`flex items-start p-4 rounded-lg border transition-all hover:bg-gray-700/30 ${
                  rec.priority === 'high' 
                    ? "bg-red-900/20 border-red-500/30" 
                    : rec.priority === 'medium' 
                    ? "bg-yellow-900/20 border-yellow-500/30" 
                    : "bg-gray-900/50 border-gray-700"
                }`}>
                  <div className="mr-3 mt-1">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${
                            rec.priority === 'high' ? 'text-red-400' :
                            rec.priority === 'medium' ? 'text-yellow-400' : 'text-emerald-400'
                          }`}>
                            {rec.title}
                          </h4>
                          {rec.badge && (
                            <Badge variant="outline" className="text-xs px-2 py-0 border-amber-500/50 text-amber-400">
                              {rec.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-xs text-gray-400">
                            {rec.impact}
                          </div>
                          {rec.scoreImpact && (
                            <div className="text-xs text-emerald-400">
                              +{rec.scoreImpact} pontos potenciais
                            </div>
                          )}
                        </div>
                      </div>
                      {rec.actionButton && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-4 border-gray-600 hover:bg-gray-700"
                          asChild
                        >
                          <a href={rec.actionButton.url} target="_blank" rel="noopener noreferrer">
                            {rec.actionButton.text}
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <p className="text-gray-300 font-medium">Parabéns! Você está indo muito bem em todas as áreas.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Continue contribuindo consistentemente para manter sua posição no ranking.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metas Semanais */}
      {weeklyGoals.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-500" />
              Foco Semanal
            </CardTitle>
            <CardDescription>Metas curtas baseadas nos seus pontos fracos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {goal.icon}
                      <span className="font-medium text-blue-400">{goal.description}</span>
                    </div>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                      {goal.current}/{goal.target}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Progresso: {Math.round((goal.current / goal.target) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulador de Impacto */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
            Simulador de Impacto
          </CardTitle>
          <CardDescription>Veja como suas contribuições podem impactar seu score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-gray-900/50">
              <div className="flex items-center gap-3">
                <GitCommitHorizontal className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">+10 Commits</span>
              </div>
              <span className="text-emerald-400 font-medium">+40 pontos</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-gray-900/50">
              <div className="flex items-center gap-3">
                <GitPullRequestIcon className="h-4 w-4 text-purple-500" />
                <span className="text-sm">+5 Pull Requests</span>
              </div>
              <span className="text-purple-400 font-medium">+12.5 pontos</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-gray-900/50">
              <div className="flex items-center gap-3">
                <GitForkIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm">+3 Issues</span>
              </div>
              <span className="text-blue-400 font-medium">+4.5 pontos</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-gray-900/50">
              <div className="flex items-center gap-3">
                <Code className="h-4 w-4 text-amber-500" />
                <span className="text-sm">+5 Code Reviews</span>
              </div>
              <span className="text-amber-400 font-medium">+5 pontos</span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-500/30">
            <div className="text-sm font-medium text-emerald-400">💡 Combinação recomendada:</div>
            <div className="text-xs text-gray-300 mt-1">
              5 commits + 2 PRs + 1 review = +27 pontos no seu score!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progressão Visual */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-purple-500" />
            Seu Nível em Cada Área
          </CardTitle>
          <CardDescription>Progresso estilo XP em cada critério</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Commits', value: userData.commits, max: 100, color: 'emerald', weight: '40%' },
              { name: 'Pull Requests', value: userData.pullRequests, max: 30, color: 'purple', weight: '25%' },
              { name: 'Issues', value: userData.issues, max: 50, color: 'blue', weight: '15%' },
              { name: 'Code Reviews', value: userData.codeReviews, max: 20, color: 'amber', weight: '10%' },
              { name: 'Projetos', value: userData.projects, max: 10, color: 'teal', weight: '5%' },
            ].map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      {metric.weight}
                    </Badge>
                  </div>
                  <span className={`text-sm font-medium text-${metric.color}-400`}>
                    {metric.value}/{metric.max}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {Math.round(Math.min((metric.value / metric.max) * 100, 100))}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Links Úteis */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="mr-2 h-5 w-5 text-cyan-500" />
            Links Úteis & CTAs
          </CardTitle>
          <CardDescription>Ações rápidas para aumentar suas contribuições</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 border-gray-600 hover:bg-gray-700" asChild>
              <a href="https://github.com/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22" target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-center text-center">
                  <GitForkIcon className="h-6 w-6 mb-2 text-blue-500" />
                  <span className="font-medium">Buscar Issues</span>
                  <span className="text-xs text-gray-400">Good first issues</span>
                </div>
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 border-gray-600 hover:bg-gray-700" asChild>
              <a href="https://github.com/trending" target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="h-6 w-6 mb-2 text-emerald-500" />
                  <span className="font-medium">Projetos Trending</span>
                  <span className="text-xs text-gray-400">Para contribuir</span>
                </div>
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 border-gray-600 hover:bg-gray-700" asChild>
              <a href="https://github.com/pulls" target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-center text-center">
                  <GitPullRequestIcon className="h-6 w-6 mb-2 text-purple-500" />
                  <span className="font-medium">Seus Pull Requests</span>
                  <span className="text-xs text-gray-400">Revisar e atualizar</span>
                </div>
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 border-gray-600 hover:bg-gray-700" asChild>
              <a href="https://github.com/pulls/review-requested" target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-center text-center">
                  <Code className="h-6 w-6 mb-2 text-amber-500" />
                  <span className="font-medium">PRs para Revisar</span>
                  <span className="text-xs text-gray-400">Pendentes</span>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Como o Score é Calculado */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-amber-500" />
            Como o Score é Calculado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <GitCommitHorizontal className="h-4 w-4 text-emerald-500" />, label: "Commits", weight: "40%" },
              { icon: <GitPullRequestIcon className="h-4 w-4 text-purple-500" />, label: "Pull Requests", weight: "25%" },
              { icon: <GitForkIcon className="h-4 w-4 text-blue-500" />, label: "Issues", weight: "15%" },
              { icon: <Code className="h-4 w-4 text-amber-500" />, label: "Code Reviews", weight: "10%" },
              { icon: <Users className="h-4 w-4 text-teal-500" />, label: "Projetos", weight: "5%" },
              { icon: <Calendar className="h-4 w-4 text-gray-400" />, label: "Dias Ativos", weight: "3%" },
              { icon: <Flame className="h-4 w-4 text-orange-500" />, label: "Streak", weight: "2%" },
            ].map((item, index) => (
              <div key={index} className="text-center p-3 rounded bg-gray-900/50">
                <div className="flex justify-center mb-2">{item.icon}</div>
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">{item.weight}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
