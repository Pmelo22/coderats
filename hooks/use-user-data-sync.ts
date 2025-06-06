// hooks/use-user-data-sync.ts
'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { updateUserData, getLeaderboard } from '@/lib/firestore-user';
import { getGitHubUserStats } from '@/lib/github/getUserStats';
import { useToast } from '@/hooks/use-toast';

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

interface UpdateResult {
  userStats: UserStats | null;
  leaderboard: any[];
  lastUpdated: string;
}

export function useUserDataSync() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const syncUserData = useCallback(async (
    showToast = false,
    forceUpdate = false
  ): Promise<UpdateResult | null> => {
    if (!session?.user) {
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para sincronizar os dados.",
        });
      }
      return null;
    }

    const userEmail = session.user.email;
    const username = session.user.login;

    if (!userEmail) {
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Erro de configuração",
          description: "Email do usuário não disponível na sessão.",
        });
      }
      return null;
    }

    setIsUpdating(true);

    try {
      if (showToast) {
        toast({
          title: "Sincronizando dados",
          description: "Atualizando suas informações do GitHub...",
        });
      }

      // Step 1: Update user data in Firestore
      if (username && session.accessToken) {
        await updateUserData({
          username,
          token: session.accessToken as string,
          avatar_url: session.user.image || undefined,
          name: session.user.name || undefined,
          email: userEmail,
          force: forceUpdate,
        });
      }

      // Step 2: Fetch updated platform data
      const platformResponse = await fetch('/api/platforms/connect');
      const platformData = await platformResponse.json();
      const resetDate = platformData.lastResetDate || null;

      // Step 3: Get fresh GitHub stats and leaderboard
      const [githubStats, leaderboard] = await Promise.all([
        username && session.accessToken 
          ? getGitHubUserStats(username, session.accessToken as string, resetDate)
          : Promise.resolve({
              commits: 0,
              pullRequests: 0,
              issues: 0,
              codeReviews: 0,
              diversity: 0,
              activeDays: 0,
            }),
        getLeaderboard()
      ]);      // Step 4: Aggregate contributions from all platforms
      let userStats: UserStats = githubStats;
      if (platformData.platforms && Object.keys(platformData.platforms).length > 0) {
        const totalContributions = Object.values(platformData.platforms).reduce(
          (acc: { commits: number; pull_requests: number; issues: number; repositories: number }, platform: any) => {
            acc.commits += platform.commits || 0;
            acc.pull_requests += platform.pull_requests || 0;
            acc.issues += platform.issues || 0;
            acc.repositories += platform.repositories || 0;
            return acc;
          },
          { commits: 0, pull_requests: 0, issues: 0, repositories: 0 }
        );

        userStats = {
          ...githubStats,
          commits: Math.max(githubStats.commits, totalContributions.commits),
          pullRequests: Math.max(githubStats.pullRequests, totalContributions.pull_requests),
          issues: Math.max(githubStats.issues, totalContributions.issues),
          diversity: Math.max(githubStats.diversity, totalContributions.repositories),
          platforms: platformData.platforms
        } as UserStats;
      }      const result = {
        userStats,
        leaderboard,
        lastUpdated: new Date().toISOString()
      };

      // Find current user in leaderboard to get updated stats
      const currentUser = leaderboard.find((user: any) => user.username === username);
      if (currentUser) {
        result.userStats = {
          commits: currentUser.commits,
          pullRequests: currentUser.pull_requests,
          issues: currentUser.issues,
          codeReviews: currentUser.code_reviews,
          diversity: currentUser.projects,
          activeDays: currentUser.active_days,
          platforms: platformData.platforms
        };
      }

      if (showToast) {
        toast({
          variant: "success",
          title: "Dados sincronizados",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      }

      return result;

    } catch (error) {
      console.error("❌ Erro ao sincronizar dados do usuário:", error);
      
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Erro na sincronização",
          description: "Não foi possível atualizar seus dados. Tente novamente.",
        });
      }

      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [session, toast]);

  const syncLeaderboard = useCallback(async (showToast = false) => {
    setIsUpdating(true);

    try {
      if (showToast) {
        toast({
          title: "Atualizando ranking",
          description: "Carregando os dados mais recentes...",
        });
      }

      const leaderboard = await getLeaderboard();
      const lastUpdated = new Date().toISOString();

      if (showToast) {
        toast({
          variant: "success",
          title: "Ranking atualizado",
          description: `${leaderboard.length} usuários carregados com sucesso.`,
        });
      }

      return { leaderboard, lastUpdated };

    } catch (error) {
      console.error("❌ Erro ao carregar ranking:", error);
      
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar ranking",
          description: "Não foi possível carregar os dados do ranking. Tente novamente.",
        });
      }

      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  return {
    syncUserData,
    syncLeaderboard,
    isUpdating,
  };
}
