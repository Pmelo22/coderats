// app/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  ArrowLeft,
  GitCommitHorizontal,
  GitPullRequestIcon,
  Star,
  GitForkIcon,
  Code,
  Calendar,
  RefreshCw,
  Users,
  AlertTriangle,
} from "lucide-react";
import ScoreRecommendations from "@/components/score-recommendations";
import UserRepositories from "@/components/user-repositories";
import PlatformConnector from "@/components/PlatformConnector";
import PlatformContributionBadges from "@/components/PlatformContributionBadges";
import { useUserDataSync } from "@/hooks/use-user-data-sync";
import { updateUserData } from "@/lib/firestore-user";
import { useToast } from "@/hooks/use-toast";


interface UserStats {
  commits: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
  diversity: number;
  activeDays: number;
  platforms?: {
    [key: string]: {
      username: string;
      commits: number;
      pull_requests: number;
      issues: number;
      repositories: number;
      last_updated?: string;
    }
  };
}

// Utilitário para garantir compatibilidade de nomes de propriedades vindas do Firestore ou do hook
function normalizeStats(stats: any) {
  if (!stats) return stats;
  return {
    ...stats,
    codeReviews: stats.codeReviews ?? stats.code_reviews ?? 0,
    diversity: stats.diversity ?? stats.projects ?? 0,
    activeDays: stats.activeDays ?? stats.active_days ?? 0,
  };
}

export default function UserProfile() {
  const { data: session, status } = useSession();
  const { syncUserData, isUpdating } = useUserDataSync();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);
  
  function syncData() {
    setSynced(true);
  }

  // Listen for platform data sync events
  useEffect(() => {
    const handlePlatformSync = () => {
      setSynced(false); // This will trigger a reload of stats
    };

    window.addEventListener('platformDataSynced', handlePlatformSync);
    return () => {
      window.removeEventListener('platformDataSynced', handlePlatformSync);
    };
  }, []);
  
  useEffect(() => {
    async function loadStats() {
      if (!session?.user || synced) return;
      setLoading(true);
      try {
        const result = await syncUserData(false, false);
        if (result) {
          setStats(normalizeStats(result.userStats));
          setAllUsers(result.leaderboard);
          setSynced(true);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      loadStats();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status, synced, syncUserData]);



  // Preparar dados para o gráfico de contribuições
  // Como não há contributionHistory, passar array vazio para o calendário
  const contributionData = prepareContributionData([]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/ranking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ranking
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Seu Perfil</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/ranking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ranking
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Seu Perfil</h1>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Perfil não encontrado
              </CardTitle>
              <CardDescription>Não foi possível carregar seus dados de perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Isso pode acontecer se você acabou de fazer login e seus dados ainda não foram sincronizados corretamente.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Voltar para a página inicial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-6 lg:p-8 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="mr-4" asChild>
              <Link href="/ranking">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ranking
              </Link>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Seu Perfil</h1>
          </div>
          <Button
            onClick={async () => {
              try {
                const result = await updateUserData({
                  username: session.user.login ?? "",
                  token: session.accessToken ?? "",
                  avatar_url: session.user.image || undefined,
                  name: session.user.name || undefined,
                  email: session.user.email || undefined,
                  force: true, // ⬅️ atualização manual
                });
                setSynced(false); // Trigger reload
                toast({
                  variant: "success",
                  title: "Perfil atualizado",
                  description: "Seus dados foram atualizados com sucesso.",
                });
              } catch (error) {
                console.error("Erro ao atualizar perfil:", error);
                toast({
                  variant: "destructive",
                  title: "Erro na atualização",
                  description: "Não foi possível atualizar seus dados. Tente novamente.",
                });
              }
            }}
            className="w-full sm:w-auto flex-shrink-0"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar agora
          </Button>
        </div><div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mb-4 border-2 border-emerald-500">
                    <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.login} />
                    <AvatarFallback>{session.user.login?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl sm:text-2xl">@{session.user.login}</CardTitle>
                  <CardDescription className="text-gray-400">{session.user.name || ""}</CardDescription>
                  <p className="mt-2 text-sm text-gray-300 break-words">{session.user.email}</p>
                  <div className="mt-3">
                    <PlatformContributionBadges 
                      platforms={stats?.platforms} 
                      showDetails={true}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="pt-2 border-t border-gray-700">
                    <h3 className="font-medium mb-2">Estatísticas de Contribuição</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900/50 p-2 sm:p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Commits</div>
                        <div className="font-bold text-sm sm:text-base">{stats?.commits ?? 0}</div>
                      </div>
                      <div className="bg-gray-900/50 p-2 sm:p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Pull Requests</div>
                        <div className="font-bold text-purple-500 text-sm sm:text-base">{stats?.pullRequests ?? 0}</div>
                      </div>
                      <div className="bg-gray-900/50 p-2 sm:p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Issues</div>
                        <div className="font-bold text-blue-500 text-sm sm:text-base">{stats?.issues ?? 0}</div>
                      </div>                      <div className="bg-gray-900/50 p-2 sm:p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Revisões de Código</div>
                        <div className="font-bold text-amber-500 text-sm sm:text-base">{stats?.codeReviews ?? 0}</div>
                      </div>
                      <div className="bg-gray-900/50 p-2 sm:p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Projetos</div>
                        <div className="font-bold text-teal-500 text-sm sm:text-base">{stats?.diversity ?? 0}</div>
                      </div>
                      <div className="bg-gray-900/50 p-2 sm:p-3 rounded text-center">
                        <div className="text-gray-400 text-xs">Dias Ativos</div>
                        <div className="font-bold text-orange-500 text-sm sm:text-base">{stats?.activeDays ?? 0} dias</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">            <Tabs defaultValue="overview">              <TabsList className="bg-gray-800 border-gray-700 grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
                <TabsTrigger value="platforms" className="text-xs sm:text-sm">Plataformas</TabsTrigger>
                <TabsTrigger value="repositories" className="text-xs sm:text-sm">Repositórios</TabsTrigger>
                <TabsTrigger value="recommendations" className="text-xs sm:text-sm">Recomendações</TabsTrigger>
              </TabsList>              {/* Visão Geral */}
              <TabsContent value="overview" className="mt-4 sm:mt-6">                <Card className="bg-gray-800 border-gray-700 mb-4 sm:mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Contribuições
                      {stats?.platforms && Object.keys(stats.platforms).length > 1 && (
                        <Badge variant="outline" className="text-xs bg-emerald-600/20 text-emerald-300 border-emerald-500/50">
                          Multi-plataforma
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {(stats?.commits ?? 0) + (stats?.pullRequests ?? 0) + (stats?.issues ?? 0) + (stats?.codeReviews ?? 0)} contribuições recentes
                      {stats?.platforms && Object.keys(stats.platforms).length > 1 && (
                        <span className="text-emerald-400 ml-2">
                          • Dados agregados de {Object.keys(stats.platforms).length} plataformas
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <ContributionCalendar data={contributionData} />
                    </div>
                    {/* Painel visual das contribuições contadas */}
                    <div className="mb-8">
                      <Card className="bg-gray-900/50 p-4 mb-4">
                        <CardTitle className="text-lg mb-2">Como sua pontuação é calculada</CardTitle>
                        <CardDescription className="mb-4">Essas são as contribuições que contam para o ranking:</CardDescription>
                        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <li className="flex items-center gap-2"><GitCommitHorizontal className="h-4 w-4 text-emerald-500" /> <span>Commits: <b>{stats?.commits ?? 0}</b></span></li>
                          <li className="flex items-center gap-2"><GitPullRequestIcon className="h-4 w-4 text-purple-500" /> <span>Pull Requests: <b>{stats?.pullRequests ?? 0}</b></span></li>
                          <li className="flex items-center gap-2"><GitForkIcon className="h-4 w-4 text-blue-500" /> <span>Issues: <b>{stats?.issues ?? 0}</b></span></li>
                          <li className="flex items-center gap-2"><Code className="h-4 w-4 text-amber-500" /> <span>Code Reviews: <b>{stats?.codeReviews ?? 0}</b></span></li>
                        </ul>
                      </Card>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">                      <div className="bg-gray-900/50 p-4 sm:p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Resumo de Contribuições</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitCommitHorizontal className="h-5 w-5 mr-2 text-emerald-500" />
                              <span>Commits</span>
                            </div>
                            <span className="font-bold">{stats?.commits ?? 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitPullRequestIcon className="h-5 w-5 mr-2 text-purple-500" />
                              <span>Pull Requests</span>
                            </div>
                            <span className="font-bold">{stats?.pullRequests ?? 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GitForkIcon className="h-5 w-5 mr-2 text-blue-500" />
                              <span>Issues</span>
                            </div>
                            <span className="font-bold">{stats?.issues ?? 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Code className="h-5 w-5 mr-2 text-amber-500" />
                              <span>Code Reviews</span>
                            </div>
                            <span className="font-bold">{stats?.codeReviews ?? 0}</span>
                          </div>
                        </div>
                      </div>                      <div className="bg-gray-900/50 p-4 sm:p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Estatísticas Adicionais</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 mr-2 text-teal-500" />
                              <span>Projetos Contribuídos</span>
                            </div>
                            <span className="font-bold">{stats?.diversity ?? 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                              <span>Dias Ativos</span>
                            </div>
                            <span className="font-bold">{stats?.activeDays ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>              </TabsContent>              {/* Plataformas */}
              <TabsContent value="platforms" className="mt-4 sm:mt-6">
                <PlatformConnector />
              </TabsContent>              {/* Repositórios */}
              <TabsContent value="repositories" className="mt-4 sm:mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Repositórios</CardTitle>
                    <CardDescription>Veja seus repositórios públicos do GitHub</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserRepositories username={session.user.login ?? ""} />
                  </CardContent>
                </Card>
              </TabsContent>              {/* Recomendações */}
              <TabsContent value="recommendations" className="mt-4 sm:mt-6">
                <ScoreRecommendations userData={stats} allUsers={allUsers} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// Função para preparar os dados para o calendário de contribuições
function prepareContributionData(contributionHistory: any[]) {
  if (!contributionHistory || contributionHistory.length === 0) {
    return [];
  }
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  oneYearAgo.setDate(today.getDate() + 1);
  const contributionMap = new Map();
  contributionHistory.forEach((item) => {
    contributionMap.set(item.date, item.count);
  });
  const allDays = [];
  const currentDate = new Date(oneYearAgo);
  while (currentDate <= today) {
    const dateString = currentDate.toISOString().split("T")[0];
    allDays.push({
      date: dateString,
      count: contributionMap.get(dateString) || 0,
      weekday: currentDate.getDay(),
      month: currentDate.getMonth(),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return allDays;
}

// Componente de calendário de contribuições estilo GitHub
function ContributionCalendar({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-400">Nenhum dado de contribuição disponível</div>;
  }
  const totalContributions = data.reduce((sum, day) => sum + day.count, 0);
  const weeks = [];
  let currentWeek = [];
  const firstDay = data[0];
  if (firstDay && firstDay.weekday > 0) {
    for (let i = 0; i < firstDay.weekday; i++) {
      currentWeek.push(null);
    }
  }
  for (const day of data) {
    currentWeek.push(day);
    if (day.weekday === 6) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  const months = Array.from(new Set(data.map((day) => day.month)))
    .sort((a, b) => a - b)
    .map((month) => {
      const date = new Date();
      date.setMonth(month);
      return date.toLocaleString("default", { month: "short" });
    });
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-800";
    if (count < 5) return "bg-emerald-900";
    if (count < 10) return "bg-emerald-700";
    if (count < 15) return "bg-emerald-600";
    return "bg-emerald-500";
  };
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
  );
}
