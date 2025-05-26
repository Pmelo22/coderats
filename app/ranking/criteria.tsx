import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitCommitHorizontal, GitPullRequestIcon, GitForkIcon, Calendar, Code, Users } from "lucide-react"

export default function RankingCriteria() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">📊 Critérios de Avaliação</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <GitCommitHorizontal className="mr-2 h-5 w-5 text-emerald-500" />
              Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Commits totais por repositório e período. Contribuições consistentes têm maior peso.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <GitPullRequestIcon className="mr-2 h-5 w-5 text-purple-500" />
              Pull Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              PRs abertos e mesclados. Demonstra colaboração e contribuições significativas.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <GitForkIcon className="mr-2 h-5 w-5 text-blue-500" />
              Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Issues abertas e fechadas. Mostra engajamento na resolução de problemas.</CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5 text-amber-500" />
              Revisões de Código
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Revisões de PR (code reviews). Indica qualidade e mentoria.</CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-teal-500" />
              Diversidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Commits em projetos diferentes. Valoriza contribuições em múltiplos contextos.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-orange-500" />
              Dias Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Quantidade de dias diferentes com contribuições. Premia consistência.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
