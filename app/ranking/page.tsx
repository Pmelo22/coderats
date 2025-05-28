import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  ArrowUpRight,
  Trophy,
  GitCommitHorizontal,
  GitPullRequestIcon,
  GitForkIcon,
  Code,
  Users,
} from "lucide-react"
import { getLeaderboard, LeaderboardUser, updateUserData } from "@/lib/firestore-user"
import RankingNote from "./note"
import RankingCriteria from "./criteria"

export const revalidate = 0


export default async function RankingPage() {
  // Busca o ranking e a última atualização usando a função utilitária
  const { users, lastUpdated } = await (async () => {
    const leaderboard: LeaderboardUser[] = await getLeaderboard()
    // Busca a última atualização (pode ser melhorado para buscar do Firestore)
    let lastUpdated = new Date().toISOString()
    if (leaderboard.length > 0 && leaderboard[0].updated_at) {
      lastUpdated = leaderboard[0].updated_at
    }
    return { users: leaderboard, lastUpdated }
  })()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">GitHub Contributions Ranking</h1>
          <Button asChild variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <RankingNote />

        <RankingCriteria />

        <Card className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <CardHeader className="px-0 pt-0">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <CardTitle className="text-2xl font-bold mb-4 md:mb-0">Ranking Geral</CardTitle>
              <div className="text-sm text-gray-400">
                Last updated: {new Date(lastUpdated).toLocaleString()} • Updates daily
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {users.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {users.slice(0, 3).map((user: LeaderboardUser) => (
                    <div
                      key={user.id}
                      className={`relative p-6 rounded-lg border ${user.rank === 1
                        ? "bg-gradient-to-br from-amber-900/40 to-amber-700/20 border-amber-500/50"
                        : user.rank === 2
                          ? "bg-gradient-to-br from-gray-800 to-gray-700/30 border-gray-500/50"
                          : "bg-gradient-to-br from-amber-800/20 to-amber-700/10 border-amber-700/30"
                        }`}
                    >
                      <div className="absolute -top-4 -right-4">
                        <Trophy
                          className={`h-12 w-12 ${user.rank === 1 ? "text-amber-500" : user.rank === 2 ? "text-gray-400" : "text-amber-700"
                            }`}
                        />
                      </div>
                      <div className="flex items-center mb-4">
                        <Avatar className="h-16 w-16 border-2 border-emerald-500">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="font-bold text-xl">@{user.username}</div>
                          <div className="text-sm text-gray-400">Score: {user.score}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-gray-400 text-xs">Commits</div>
                          <div className="font-bold text-emerald-500">{user.commits}</div>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-gray-400 text-xs">PRs</div>
                          <div className="font-bold text-purple-500">{user.pull_requests}</div>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-gray-400 text-xs">Issues</div>
                          <div className="font-bold text-blue-500">{user.issues}</div>
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded">
                          <div className="text-gray-400 text-xs">Reviews</div>
                          <div className="font-bold text-amber-500">{user.code_reviews}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full border-gray-600 hover:bg-gray-700" asChild>
                        <Link href={`/profile/${user.username}`}>
                          View Profile <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-4 px-4">Rank</th>
                        <th className="text-left py-4 px-4">User</th>
                        <th className="text-right py-4 px-4">Score</th>
                        <th className="text-right py-4 px-4 hidden md:table-cell">Commits</th>
                        <th className="text-right py-4 px-4 hidden md:table-cell">PRs</th>
                        <th className="text-right py-4 px-4 hidden md:table-cell">Issues</th>
                        <th className="text-right py-4 px-4 hidden lg:table-cell">Reviews</th>
                        <th className="text-right py-4 px-4 hidden lg:table-cell">Projects</th>
                        <th className="text-right py-4 px-4 hidden lg:table-cell">Days</th>
                        <th className="text-right py-4 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: LeaderboardUser) => (
                        <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                          <td className="py-4 px-4">
                            <Badge
                              variant={user.rank <= 3 ? "default" : "outline"}
                              className={
                                user.rank === 1
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : user.rank === 2
                                    ? "bg-gray-400 hover:bg-gray-500"
                                    : user.rank === 3
                                      ? "bg-amber-700 hover:bg-amber-800"
                                      : ""
                              }
                            >
                              #{user.rank}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-emerald-500">{user.score}</td>
                          <td className="py-4 px-4 text-right hidden md:table-cell">
                            <div className="flex items-center justify-end">
                              <GitCommitHorizontal className="h-4 w-4 mr-1 text-gray-400" />
                              {user.commits}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right hidden md:table-cell">
                            <div className="flex items-center justify-end">
                              <GitPullRequestIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {user.pull_requests}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right hidden md:table-cell">
                            <div className="flex items-center justify-end">
                              <GitForkIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {user.issues}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right hidden lg:table-cell">
                            <div className="flex items-center justify-end">
                              <Code className="h-4 w-4 mr-1 text-gray-400" />
                              {user.code_reviews}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right hidden lg:table-cell">
                            <div className="flex items-center justify-end">
                              <Users className="h-4 w-4 mr-1 text-gray-400" />
                              {user.projects}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right hidden lg:table-cell">
                            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                              {user.active_days} days
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" asChild>
                              <Link href={`/profile/${user.username}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No users found in the ranking.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitCommitHorizontal className="mr-2 h-5 w-5 text-emerald-500" />
                Top Commiters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users
                  .slice(0, 5)
                  .sort((a: LeaderboardUser, b: LeaderboardUser) => b.commits - a.commits)
                  .map((user: LeaderboardUser, index: number) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-3 w-8 text-center">
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">@{user.username}</div>
                      </div>
                      <div className="font-bold">{user.commits}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitPullRequestIcon className="mr-2 h-5 w-5 text-purple-500" />
                Top PR Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users
                  .slice(0, 5)
                  .sort((a: LeaderboardUser, b: LeaderboardUser) => b.pull_requests - a.pull_requests)
                  .map((user: LeaderboardUser, index: number) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-3 w-8 text-center">
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">@{user.username}</div>
                      </div>
                      <div className="font-bold">{user.pull_requests}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5 text-amber-500" />
                Top Code Reviewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users
                  .slice(0, 5)
                  .sort((a: LeaderboardUser, b: LeaderboardUser) => b.code_reviews - a.code_reviews)
                  .map((user: LeaderboardUser, index: number) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-3 w-8 text-center">
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">@{user.username}</div>
                      </div>
                      <div className="font-bold">{user.code_reviews}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-teal-500" />
                Most Diverse Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users
                  .slice(0, 5)
                  .sort((a: LeaderboardUser, b: LeaderboardUser) => b.projects - a.projects)
                  .map((user: LeaderboardUser, index: number) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-3 w-8 text-center">
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">@{user.username}</div>
                      </div>
                      <div className="font-bold">{user.projects} projects</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle>Como o Ranking é Calculado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              O ranking é calculado com base em uma pontuação que considera todos os critérios listados acima, com pesos
              diferentes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>
                <strong>Commits (40%):</strong> Valorizamos contribuições consistentes de código
              </li>
              <li>
                <strong>Pull Requests (25%):</strong> PRs demonstram contribuições significativas e colaboração
              </li>
              <li>
                <strong>Issues (15%):</strong> Identificar e resolver problemas é fundamental
              </li>
              <li>
                <strong>Revisões de Código (10%):</strong> Ajudar outros desenvolvedores melhora a qualidade do projeto
              </li>
              <li>
                <strong>Diversidade de Projetos (5%):</strong> Contribuir em diferentes contextos é valorizado
              </li>
              <li>
                <strong>Dias Ativos (3%):</strong> Quantidade de dias com contribuições mostra consistência
              </li>
              <li>
                <strong>Streak (2%):</strong> Dias consecutivos de contribuição demonstram comprometimento
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
