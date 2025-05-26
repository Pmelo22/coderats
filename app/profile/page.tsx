// app/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserStats {
  commits: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
  diversity: number;
  activeDays: number;
}

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGitHubData() {
      if (session?.accessToken && session.user?.name) {
        const headers = {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        };

        const username = session.user.name;

        const [commitsRes, prRes, issuesRes, reviewsRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/search/commits?q=author:${username}`, {
            headers: { ...headers, Accept: 'application/vnd.github.cloak-preview' },
          }),
          fetch(`https://api.github.com/search/issues?q=type:pr+author:${username}`, { headers }),
          fetch(`https://api.github.com/search/issues?q=type:issue+author:${username}`, { headers }),
          fetch(`https://api.github.com/search/issues?q=reviewed-by:${username}`, { headers }),
          fetch(`https://api.github.com/users/${username}/events`, { headers }),
        ]);

        const [commitsData, prData, issuesData, reviewsData, eventsData] = await Promise.all([
          commitsRes.json(),
          prRes.json(),
          issuesRes.json(),
          reviewsRes.json(),
          eventsRes.json(),
        ]);

        const activeDays = new Set(eventsData.map((event: any) => event.created_at.slice(0, 10)));
        const diversity = new Set(eventsData.map((event: any) => event.repo.name));

        setStats({
          commits: commitsData.total_count || 0,
          pullRequests: prData.total_count || 0,
          issues: issuesData.total_count || 0,
          codeReviews: reviewsData.total_count || 0,
          diversity: diversity.size,
          activeDays: activeDays.size,
        });

        setLoading(false);
      }
    }

    fetchGitHubData();
  }, [session]);

  if (status === 'loading' || loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Meu Perfil</h1>

      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <img
            src={session?.user?.image || '/default-avatar.png'}
            alt="User avatar"
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-semibold">{session?.user?.name}</h2>
            <p className="text-gray-400">{session?.user?.email}</p>
          </div>
        </div>

        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold">Commits</h3>
              <p className="text-3xl font-bold">{stats.commits}</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold">Pull Requests</h3>
              <p className="text-3xl font-bold">{stats.pullRequests}</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold">Issues</h3>
              <p className="text-3xl font-bold">{stats.issues}</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold">Revisões de Código</h3>
              <p className="text-3xl font-bold">{stats.codeReviews}</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold">Diversidade</h3>
              <p className="text-3xl font-bold">{stats.diversity} Projetos</p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold">Dias Ativos</h3>
              <p className="text-3xl font-bold">{stats.activeDays} Dias</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}