// app/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getGitHubUserStats } from '@/lib/github/getUserStats'
import { updateUserData } from '@/app/ranking/page';


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
  const [synced, setSynced] = useState(false);

  function syncData() {
    setSynced(true);
  }

  useEffect(() => {
    async function loadStats() {
      if (!session?.accessToken || !session?.user || !synced) return
      await updateUserData({
        username: session.user.login!,
        token: session.accessToken as string,
        avatar_url: session.user.image,
        name: session.user.name,
      });
      const username = session.user?.login
      if (!username) {
        console.warn("⚠️ Nome de usuário do GitHub não disponível na sessão.")
        setLoading(false)
        return
      }

      try {
        const stats = await getGitHubUserStats(username, session.accessToken as string)
        setStats(stats)
      } catch (error) {
        console.error("Erro ao buscar dados do GitHub:", error)
      } finally {
        setLoading(false)
      }
    }

    syncData();
    loadStats()
  }, [session, synced])


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
            <h2 className="text-2xl font-semibold">{session?.user?.login}</h2>
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

function syncData() {
  throw new Error('Function not implemented.');
}
