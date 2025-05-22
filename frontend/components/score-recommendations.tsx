import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitCommitHorizontal, GitPullRequestIcon, GitForkIcon, Code, Users, Calendar, Trophy } from "lucide-react"

export default function ScoreRecommendations({ userData }: { userData: any }) {
  // Determinar recomendações com base nos dados do usuário
  const recommendations = []

  if (userData.commits < 100) {
    recommendations.push({
      icon: <GitCommitHorizontal className="h-5 w-5 text-emerald-500" />,
      title: "Aumente seus commits",
      description: "Tente fazer commits menores e mais frequentes para aumentar sua pontuação.",
      impact: "Alto (40% do score)",
    })
  }

  if (userData.pullRequests < 20) {
    recommendations.push({
      icon: <GitPullRequestIcon className="h-5 w-5 text-purple-500" />,
      title: "Crie mais Pull Requests",
      description: "Contribua com PRs para projetos open source ou seus próprios projetos.",
      impact: "Médio (25% do score)",
    })
  }

  if (userData.issues < 30) {
    recommendations.push({
      icon: <GitForkIcon className="h-5 w-5 text-blue-500" />,
      title: "Abra e resolva mais Issues",
      description: "Reporte bugs ou sugira melhorias em projetos que você utiliza.",
      impact: "Médio (15% do score)",
    })
  }

  if (userData.codeReviews < 10) {
    recommendations.push({
      icon: <Code className="h-5 w-5 text-amber-500" />,
      title: "Faça mais Code Reviews",
      description: "Revisar PRs de outros desenvolvedores ajuda a comunidade e aumenta sua pontuação.",
      impact: "Baixo (10% do score)",
    })
  }

  if (userData.projects < 5) {
    recommendations.push({
      icon: <Users className="h-5 w-5 text-teal-500" />,
      title: "Contribua em mais projetos",
      description: "Diversifique suas contribuições participando de diferentes projetos.",
      impact: "Baixo (5% do score)",
    })
  }

  if (userData.activeDays < 20) {
    recommendations.push({
      icon: <Calendar className="h-5 w-5 text-gray-400" />,
      title: "Seja mais consistente",
      description: "Tente contribuir em mais dias diferentes ao longo do mês.",
      impact: "Baixo (3% do score)",
    })
  }

  if (userData.streak < 7) {
    recommendations.push({
      icon: <Trophy className="h-5 w-5 text-orange-500" />,
      title: "Aumente seu streak",
      description: "Faça pelo menos uma contribuição por dia para aumentar seu streak.",
      impact: "Baixo (2% do score)",
    })
  }

  // Limitar a 3 recomendações principais
  const topRecommendations = recommendations.slice(0, 3)

  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-amber-500" />
          Como Melhorar Seu Score
        </CardTitle>
        <CardDescription>Recomendações personalizadas para aumentar sua pontuação no ranking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topRecommendations.length > 0 ? (
            topRecommendations.map((rec, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="mr-3 mt-1">{rec.icon}</div>
                <div>
                  <h4 className="font-medium text-emerald-400">{rec.title}</h4>
                  <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                  <div className="mt-2 text-xs text-amber-500">Impacto no score: {rec.impact}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-300">Parabéns! Você está indo muito bem em todas as áreas.</p>
              <p className="text-sm text-gray-400 mt-2">
                Continue contribuindo consistentemente para manter sua posição no ranking.
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="font-medium mb-2">Como o Score é Calculado</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li className="flex items-center">
                <GitCommitHorizontal className="h-4 w-4 mr-2 text-emerald-500" />
                <span>Commits: 40%</span>
              </li>
              <li className="flex items-center">
                <GitPullRequestIcon className="h-4 w-4 mr-2 text-purple-500" />
                <span>Pull Requests: 25%</span>
              </li>
              <li className="flex items-center">
                <GitForkIcon className="h-4 w-4 mr-2 text-blue-500" />
                <span>Issues: 15%</span>
              </li>
              <li className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-amber-500" />
                <span>Code Reviews: 10%</span>
              </li>
              <li className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-teal-500" />
                <span>Projetos: 5%</span>
              </li>
              <li className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>Dias Ativos: 3%</span>
              </li>
              <li className="flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-orange-500" />
                <span>Streak: 2%</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
