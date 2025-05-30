import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, GitCommitHorizontal, GitPullRequestIcon, Star, GitForkIcon, Code, Calendar, Share2, Trophy, Flame, Globe2, Github } from "lucide-react";
import UserPublicRepositories from "@/components/user-public-repositories";
import ClientProfileActions from "@/components/ClientProfileActions";

interface UserProfileProps {
  params: { username: string };
}

async function fetchUserData(username: string) {
  const userDoc = await getDoc(doc(db, "users", username));
  if (!userDoc.exists()) {
    return null;
  }
  return userDoc.data();
}

function getMedals(user: any, totalUsers: number) {
  const medals = [];
  if (user.rank === 1) medals.push({ icon: <Trophy className="text-yellow-400 w-5 h-5" />, label: "Top 1 Geral" });
  if (user.isTopCommitter) medals.push({ icon: <GitCommitHorizontal className="text-emerald-400 w-5 h-5" />, label: "Top Commits" });
  if (user.isTopPR) medals.push({ icon: <GitPullRequestIcon className="text-purple-400 w-5 h-5" />, label: "Top PRs" });
  if (user.isTopIssue) medals.push({ icon: <GitForkIcon className="text-blue-400 w-5 h-5" />, label: "Top Issues" });
  if (user.isTopReviewer) medals.push({ icon: <Code className="text-amber-400 w-5 h-5" />, label: "Top Reviewer" });
  if ((user.diversity ?? user.projects) >= 5) medals.push({ icon: <Globe2 className="text-teal-400 w-5 h-5" />, label: "Multi-Projetos" });
  if ((user.streak ?? 0) >= 7) medals.push({ icon: <Flame className="text-orange-400 w-5 h-5" />, label: `Streak ${user.streak} dias` });
  if (user.rank && totalUsers) {
    const percent = Math.round((user.rank / totalUsers) * 100);
    if (percent <= 3) medals.push({ icon: <Star className="text-pink-400 w-5 h-5" />, label: `Top ${percent}%` });
  }
  return medals;
}

function getRelativeRanking(rank: number, total: number) {
  if (!rank || !total) return null;
  const percent = ((rank / total) * 100).toFixed(1);
  return `Top ${percent}% entre ${total} desenvolvedores`;
}

function copyToClipboard(text: string) {
  if (typeof window !== "undefined") {
    navigator.clipboard.writeText(text);
  }
}

function ContributionEvolution({ weeks }: { weeks: { week: string, commits: number, score: number }[] }) {
  // Gráfico simples de barras horizontais
  return (
    <div className="w-full mt-2">
      <div className="flex flex-col gap-2">
        {weeks.map((w, i) => (
          <div key={w.week} className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-400">{w.week}</span>
            <div className="flex-1 bg-gray-700 rounded h-4 relative">
              <div className="absolute left-0 top-0 h-4 rounded bg-emerald-500" style={{ width: `${Math.min(w.commits * 5, 100)}%` }} />
              <div className="absolute left-0 top-0 h-4 rounded bg-yellow-400/60" style={{ width: `${Math.min(w.score, 100)}%`, opacity: 0.5 }} />
            </div>
            <span className="text-xs text-emerald-400 font-bold">{w.commits} commits</span>
            <span className="text-xs text-yellow-400 font-bold">{w.score} pts</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-1">Barras verdes: commits | Amarelas: score</div>
    </div>
  );
}

export default async function PublicUserProfile({ params }: UserProfileProps) {
  const { username } = params;
  const userData = await fetchUserData(username);
  if (!userData) notFound();

  // Buscar ranking geral para medalhas e ranking relativo
  const leaderboardMod = await import("@/lib/firestore-user");
  const leaderboard = await leaderboardMod.getLeaderboard();
  const totalUsers = leaderboard.length;
  const user = (leaderboard.find((u: any) => u.username === username) as any) || {};

  // Preferir campos extras do Firestore (userData) se não existirem no ranking
  const getField = (field: string) => (user as any)[field] ?? (userData as any)[field];

  const medals = getMedals({ ...user, ...userData }, totalUsers);
  const relativeRanking = getRelativeRanking(getField('rank'), totalUsers);

  // Simular evolução das últimas 4 semanas (ideal: vir do backend)
  const now = new Date();
  const weeks = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const week = `${d.getDate()}/${d.getMonth() + 1}`;
    return {
      week,
      commits: Math.floor((getField('commits') ?? 0) / 4) + Math.floor(Math.random() * 3),
      score: Math.floor((getField('score') ?? 0) / 4) + Math.floor(Math.random() * 10),
    };
  }).reverse();

  // Chamada para ação
  const cta = getField('cta') || "Buscando projetos, oportunidades ou networking!";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Cabeçalho */}
        <Card className="bg-gray-900/80 border-emerald-700 shadow-lg">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 p-6">
            <Avatar className="h-32 w-32 border-4 border-emerald-500 shadow-lg">
              <AvatarImage src={getField('avatar_url') || "/placeholder.svg"} alt={username} />
              <AvatarFallback>{username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{getField('name') || username}</h1>
                <span className="text-gray-400 text-lg">@{username}</span>
                {getField('location') && <span className="ml-2 text-sm text-gray-400">{getField('location')}</span>}
              </div>
              {/* Redes sociais e GitHub */}
              <div className="flex gap-3 mt-2 flex-wrap items-center">
                {getField('github') && (
                  <a href={getField('github')} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="GitHub">
                    <Github className="w-6 h-6 text-gray-300 hover:text-emerald-400" />
                  </a>
                )}
                {getField('linkedin') && (
                  <a href={getField('linkedin')} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="LinkedIn">
                    <svg className="w-6 h-6 text-blue-400 hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v5.62z"/></svg>
                  </a>
                )}
                {getField('website') && (
                  <a href={getField('website')} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="Website">
                    <Globe2 className="w-6 h-6 text-teal-400 hover:text-teal-600" />
                  </a>
                )}
                {getField('twitter') && (
                  <a href={getField('twitter')} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="Twitter">
                    <svg className="w-6 h-6 text-sky-400 hover:text-sky-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482c-4.086-.205-7.713-2.164-10.141-5.144a4.822 4.822 0 0 0-.664 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z"/></svg>
                  </a>
                )}
              </div>
              {/* Bio */}
              {getField('bio') && <p className="text-gray-200 text-base italic mt-1">{getField('bio')}</p>}
              {/* Informações de contato */}
              <div className="flex gap-2 flex-wrap mt-2">
                {getField('email') && <Badge variant="outline">{getField('email')}</Badge>}
              </div>
              {/* Medalhas e ranking melhorados */}
              <div className="flex flex-col md:flex-row gap-2 mt-2 w-full">
                <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
                  {medals.map((m, i) => (
                    <div key={i} className="group relative">
                      <Badge className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 border-emerald-500 font-semibold cursor-pointer">
                        {m.icon}{m.label}
                      </Badge>
                      <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-xs text-white opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
                {relativeRanking && (
                  <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold px-3 py-1 rounded shadow text-xs border border-emerald-700 ml-0 md:ml-4 mt-2 md:mt-0">
                    {relativeRanking}
                  </span>
                )}
              </div>
            </div>
            <ClientProfileActions githubUrl={getField('github')} />
          </CardContent>
        </Card>

        {/* Destaques e evolução */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Resumo</CardTitle>
              <CardDescription>Estatísticas principais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <Star className="h-6 w-6 text-yellow-400 mb-1" />
                  <span className="text-xs text-gray-400">Score</span>
                  <span className="font-bold text-xl">{getField('score') ?? 0}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <Calendar className="h-6 w-6 text-orange-400 mb-1" />
                  <span className="text-xs text-gray-400">Streak</span>
                  <span className="font-bold text-xl">{getField('streak') ?? 0} dias</span>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <Users className="h-6 w-6 text-teal-400 mb-1" />
                  <span className="text-xs text-gray-400">Projetos</span>
                  <span className="font-bold text-xl">{getField('diversity') ?? getField('projects') ?? 0}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <GitCommitHorizontal className="h-6 w-6 text-emerald-400 mb-1" />
                  <span className="text-xs text-gray-400">Commits</span>
                  <span className="font-bold text-xl">{getField('commits') ?? 0}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <GitPullRequestIcon className="h-6 w-6 text-purple-400 mb-1" />
                  <span className="text-xs text-gray-400">Pull Requests</span>
                  <span className="font-bold text-xl">{getField('pull_requests') ?? 0}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <GitForkIcon className="h-6 w-6 text-blue-400 mb-1" />
                  <span className="text-xs text-gray-400">Issues</span>
                  <span className="font-bold text-xl">{getField('issues') ?? 0}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <Code className="h-6 w-6 text-amber-400 mb-1" />
                  <span className="text-xs text-gray-400">Code Reviews</span>
                  <span className="font-bold text-xl">{getField('code_reviews') ?? 0}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 p-3 rounded">
                  <Calendar className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Dias Ativos</span>
                  <span className="font-bold text-xl">{getField('active_days') ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Evolução nas últimas 4 semanas</CardTitle>
              <CardDescription>Commits e score por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ContributionEvolution weeks={weeks} />
            </CardContent>
          </Card>
        </div>

        {/* Repositórios */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl">Repositórios em destaque</CardTitle>
            <CardDescription>Até 5 repositórios que mais contribuiu</CardDescription>
          </CardHeader>
          <CardContent>
            <UserPublicRepositories username={username} />
          </CardContent>
        </Card>

        {/* Chamada para ação */}
        <Card className="bg-gray-900/80 border-emerald-700">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <div className="text-lg font-semibold text-emerald-400">{cta}</div>
            <Link href="/ranking">
              <Button variant="outline" className="border-emerald-500 hover:bg-emerald-900/40 transition">Ver Ranking de Desenvolvedores</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
