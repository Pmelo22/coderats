"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  ArrowLeft,
  GitCommitHorizontal,
  GitPullRequestIcon,
  Star,
  GitForkIcon,
  Code,
  Calendar,
  Link2,
  Users,
  AlertTriangle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setDebugInfo({
          username: params.username,
          sessionUsername: session?.user?.name,
          timestamp: new Date().toISOString(),
        })

        // Verificar se é o próprio perfil do usuário
        if (session?.user?.name === params.username) {
          setIsOwnProfile(true)
        }

        const response = await fetch(`/api/profile/${params.username}`)

        setDebugInfo((prev) => ({
          ...prev,
          responseStatus: response.status,
        }))

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found")
          } else {
            setError("Failed to load user data")
          }
          return
        }

        const data = await response.json()
        setUserData(data)

        setDebugInfo((prev) => ({
          ...prev,
          dataReceived: true,
          contributionDataLength: data.contributionData?.length || 0,
        }))
      } catch (err: any) {
        setError("Failed to load user data")
        console.error(err)
        setDebugInfo((prev) => ({
          ...prev,
          error: err.message,
          errorStack: err.stack,
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.username, session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/ranking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ranking
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Developer Profile</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/ranking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ranking
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Developer Profile</h1>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Perfil não encontrado
              </CardTitle>
              <CardDescription>{error || "Não foi possível carregar os dados deste perfil."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/ranking">Voltar para o Ranking</Link>
              </Button>

              <Alert className="bg-gray-700 border-gray-600 mt-6">
                <AlertTitle>Informações de depuração</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 text-xs font-mono overflow-auto max-h-40 p-2 bg-gray-800 rounded">
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Preparar dados para o gráfico de contribuições
  const contributionData = prepareContributionData(userData.contributionData || [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/ranking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ranking
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Developer Profile</h1>
          </div>

          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-600 text-emerald-400 hover:bg-emerald-900/20"
              asChild
            >
              <Link href="/profile">Ver Seu Perfil Completo</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4 border-2 border-emerald-500">
                    <AvatarImage
                      src={userData.avatarUrl || "/placeholder.svg"}
                      alt={userData.name || userData.username}
                    />
                    <AvatarFallback>{(userData.name || userData.username).substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">@{userData.username}</CardTitle>
                  <CardDescription className="text-gray-400">{userData.name || ""}</CardDescription>
                  <p className="mt-2 text-sm text-gray-300">{userData.bio}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="pt-2 border-t border-gray-700">
                    <h3 className="font-medium mb-2">Estatísticas de Contribuição</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Rank</div>
                        <div className="font-bold text-amber-500">#{userData.rank}</div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Score</div>
                        <div className="font-bold text-emerald-500">{userData.score}</div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Commits</div>
                        <div className="font-bold">{userData.commits}</div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Pull Requests</div>
                        <div className="font-bold text-purple-500">{userData.pullRequests}</div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Issues</div>
                        <div className="font-bold text-blue-500">{userData.issues}</div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Code Reviews</div>
                        <div className="font-bold text-amber-500">{userData.codeReviews}</div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Projetos</div>
                        <div className="font-bold text-teal-500">{userData.projects}</div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded">
                        <div className="text-gray-400 text-xs">Streak</div>
                        <div className="font-bold text-orange-500">{userData.streak} dias</div>
                      </div>
                    </div>
                  </div>

                  {userData.website && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Link2 className="h-4 w-4 mr-2" />
                      <a
                        href={userData.website.startsWith("http") ? userData.website : `https://${userData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline"
                      >
                        {userData.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="overview">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="repositories">Repositories</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card className="bg-gray-800 border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle>Contribuições</CardTitle>
                    <CardDescription>{userData.contributions} contribuições desde 1º de abril de 2025</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <ContributionCalendar data={contributionData} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-900/50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Resumo de Contribuições</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitCommitHorizontal className="h-5 w-5 mr-2 text-emerald-500" />
                              <span>Commits</span>
                            </div>
                            <span className="font-bold">{userData.commits}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitPullRequestIcon className="h-5 w-5 mr-2 text-purple-500" />
                              <span>Pull Requests</span>
                            </div>
                            <span className="font-bold">{userData.pullRequests}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitForkIcon className="h-5 w-5 mr-2 text-blue-500" />
                              <span>Issues</span>
                            </div>
                            <span className="font-bold">{userData.issues}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Code className="h-5 w-5 mr-2 text-amber-500" />
                              <span>Code Reviews</span>
                            </div>
                            <span className="font-bold">{userData.codeReviews}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900/50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Estatísticas Adicionais</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 mr-2 text-teal-500" />
                              <span>Projetos Contribuídos</span>
                            </div>
                            <span className="font-bold">{userData.projects}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                              <span>Dias Ativos</span>
                            </div>
                            <span className="font-bold">{userData.activeDays}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                              <span>Streak Atual</span>
                            </div>
                            <span className="font-bold">{userData.streak} dias</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Star className="h-5 w-5 mr-2 text-amber-500" />
                              <span>Pontuação Total</span>
                            </div>
                            <span className="font-bold">{userData.score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Popular Repositories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.repositories && userData.repositories.length > 0 ? (
                      <div className="space-y-4">
                        {userData.repositories.slice(0, 3).map((repo: any) => (
                          <div key={repo.id} className="p-4 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-emerald-400">{repo.name}</h3>
                                <p className="text-sm text-gray-300 mt-1">{repo.description}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 hover:bg-gray-700"
                                onClick={() =>
                                  window.open(`https://github.com/${userData.username}/${repo.name}`, "_blank")
                                }
                              >
                                View
                              </Button>
                            </div>
                            <div className="flex items-center mt-4 text-sm text-gray-400">
                              {repo.language && (
                                <Badge variant="outline" className="mr-4 bg-gray-700/50">
                                  {repo.language}
                                </Badge>
                              )}
                              <div className="flex items-center mr-4">
                                <Star className="h-4 w-4 mr-1" />
                                {repo.stars_count}
                              </div>
                              <div className="flex items-center mr-4">
                                <GitForkIcon className="h-4 w-4 mr-1" />
                                {repo.forks_count}
                              </div>
                              <div className="text-xs">Updated {new Date(repo.updated_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        Nenhum repositório encontrado para este usuário.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="repositories" className="mt-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Repositories</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userData.repositories && userData.repositories.length > 0 ? (
                      <div className="space-y-4">
                        {userData.repositories.map((repo: any) => (
                          <div key={repo.id} className="p-4 border border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-emerald-400">{repo.name}</h3>
                                <p className="text-sm text-gray-300 mt-1">{repo.description}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 hover:bg-gray-700"
                                onClick={() =>
                                  window.open(`https://github.com/${userData.username}/${repo.name}`, "_blank")
                                }
                              >
                                View
                              </Button>
                            </div>
                            <div className="flex items-center mt-4 text-sm text-gray-400">
                              {repo.language && (
                                <Badge variant="outline" className="mr-4 bg-gray-700/50">
                                  {repo.language}
                                </Badge>
                              )}
                              <div className="flex items-center mr-4">
                                <Star className="h-4 w-4 mr-1" />
                                {repo.stars_count}
                              </div>
                              <div className="flex items-center mr-4">
                                <GitForkIcon className="h-4 w-4 mr-1" />
                                {repo.forks_count}
                              </div>
                              <div className="text-xs">Updated {new Date(repo.updated_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        Nenhum repositório encontrado para este usuário.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contributions" className="mt-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Atividade de Contribuição</CardTitle>
                    <CardDescription>Contribuições a partir de 1º de abril de 2025</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-8">
                      <ContributionCalendar data={contributionData} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-900/50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Resumo de Contribuições</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitCommitHorizontal className="h-5 w-5 mr-2 text-emerald-500" />
                              <span>Commits</span>
                            </div>
                            <span className="font-bold">{userData.commits}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitPullRequestIcon className="h-5 w-5 mr-2 text-purple-500" />
                              <span>Pull Requests</span>
                            </div>
                            <span className="font-bold">{userData.pullRequests}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitForkIcon className="h-5 w-5 mr-2 text-blue-500" />
                              <span>Issues</span>
                            </div>
                            <span className="font-bold">{userData.issues}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Code className="h-5 w-5 mr-2 text-amber-500" />
                              <span>Code Reviews</span>
                            </div>
                            <span className="font-bold">{userData.codeReviews}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900/50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Streak Atual</h3>
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-orange-500">{userData.streak}</div>
                            <div className="text-gray-400 mt-2">dias</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-80 w-full">
                      <ContributionGraph data={userData.contributionData || []} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função para preparar os dados para o calendário de contribuições
function prepareContributionData(contributionHistory: any[]) {
  // Se não houver dados, retornar um array vazio
  if (!contributionHistory || contributionHistory.length === 0) {
    return []
  }

  // Obter a data atual e a data de um ano atrás
  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)
  oneYearAgo.setDate(today.getDate() + 1) // +1 para incluir o dia atual

  // Criar um mapa de datas para contagens
  const contributionMap = new Map()
  contributionHistory.forEach((item) => {
    contributionMap.set(item.date, item.count)
  })

  // Criar um array de todos os dias no último ano
  const allDays = []
  const currentDate = new Date(oneYearAgo)

  while (currentDate <= today) {
    const dateString = currentDate.toISOString().split("T")[0]
    allDays.push({
      date: dateString,
      count: contributionMap.get(dateString) || 0,
      weekday: currentDate.getDay(), // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
      month: currentDate.getMonth(), // 0 = Janeiro, 1 = Fevereiro, ..., 11 = Dezembro
    })

    // Avançar para o próximo dia
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return allDays
}

// Componente de calendário de contribuições estilo GitHub
function ContributionCalendar({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-400">Nenhum dado de contribuição disponível</div>
  }

  // Obter o total de contribuições
  const totalContributions = data.reduce((sum, day) => sum + day.count, 0)

  // Agrupar por semanas
  const weeks = []
  let currentWeek = []

  // Preencher com dias vazios até o primeiro dia da semana (domingo = 0)
  const firstDay = data[0]
  if (firstDay && firstDay.weekday > 0) {
    for (let i = 0; i < firstDay.weekday; i++) {
      currentWeek.push(null)
    }
  }

  // Adicionar todos os dias
  for (const day of data) {
    currentWeek.push(day)

    if (day.weekday === 6) {
      // Sábado
      weeks.push([...currentWeek])
      currentWeek = []
    }
  }

  // Adicionar a última semana se não estiver vazia
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  // Obter todos os meses únicos para os rótulos
  const months = Array.from(new Set(data.map((day) => day.month)))
    .sort((a, b) => a - b)
    .map((month) => {
      const date = new Date()
      date.setMonth(month)
      return date.toLocaleString("default", { month: "short" })
    })

  // Determinar a intensidade da cor com base na contagem
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-800"
    if (count < 5) return "bg-emerald-900"
    if (count < 10) return "bg-emerald-700"
    if (count < 15) return "bg-emerald-600"
    return "bg-emerald-500"
  }

  return (
    <div className="rounded-lg border border-gray-700 p-4 bg-gray-800/50">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">{totalContributions} contribuições no último ano</div>
        <div className="flex items-center text-xs text-gray-400">
          <span className="mr-1">Menos</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          </div>
          <span className="ml-1">Mais</span>
        </div>
      </div>

      <div className="relative">
        <div className="flex text-xs text-gray-500 mb-1">
          {months.map((month, i) => (
            <div key={i} className="flex-1 text-center">
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          <div className="flex flex-col mr-2 text-xs text-gray-500 justify-around h-full">
            <div>Seg</div>
            <div>Qua</div>
            <div>Sex</div>
          </div>

          <div className="flex-1 grid grid-flow-col gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-flow-row gap-1">
                {week.map((day, dayIndex) =>
                  day === null ? (
                    <div key={`empty-${dayIndex}`} className="w-3 h-3"></div>
                  ) : (
                    <div
                      key={`${day.date}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getColorClass(day.count)} group relative`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                        {day.count} contribuições em {new Date(day.date).toLocaleDateString()}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de gráfico de contribuições
function ContributionGraph({ data }: { data: { date: string; count: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="w-full flex items-center justify-center text-gray-400">No contribution data available</div>
  }

  const maxCount = Math.max(...data.map((item) => item.count), 1)

  return (
    <div className="w-full h-full flex items-end">
      {data.map((item, index) => {
        const height = (item.count / maxCount) * 100
        return (
          <div key={index} className="flex-1 flex flex-col items-center group">
            <div className="relative">
              <div className="w-full px-1" style={{ height: "20px" }}>
                <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  {new Date(item.date).toLocaleDateString("en-US", { month: "short" })}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 p-1 rounded text-xs text-center z-10">
                {item.count} contribuições
              </div>
            </div>
            <div className="w-full px-1" style={{ height: `calc(${height}% - 20px)` }}>
              <div
                className={`w-full h-full rounded-t ${
                  item.count > maxCount * 0.75
                    ? "bg-emerald-500"
                    : item.count > maxCount * 0.5
                      ? "bg-emerald-600"
                      : item.count > maxCount * 0.25
                        ? "bg-emerald-700"
                        : "bg-emerald-900"
                }`}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
