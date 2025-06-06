'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, GitForkIcon, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Repo {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
}

export default function UserRepositories({ username }: { username: string }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRepositories = async (showToast = false) => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (showToast) {
        toast({
          title: "Atualizando repositórios",
          description: "Carregando os repositórios mais recentes...",
        });
      }

      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRepos(data);
        if (showToast) {
          toast({
            variant: "success",
            title: "Repositórios atualizados",
            description: `${data.length} repositórios carregados com sucesso.`,
          });
        }
      } else {
        throw new Error("Dados inválidos recebidos da API");
      }
    } catch (err) {
      const errorMessage = "Erro ao buscar repositórios.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro ao carregar repositórios",
        description: "Não foi possível carregar seus repositórios. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepositories();
  }, [username]);

  const handleRefresh = () => {
    loadRepositories(true);
  };

  const openRepository = (url: string, repoName: string) => {
    window.open(url, "_blank");
    toast({
      title: "Abrindo repositório",
      description: `Abrindo ${repoName} em uma nova aba.`,
    });
  };
  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-4 text-emerald-500" />
        <p className="text-gray-400">Carregando repositórios...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }
  
  if (!repos.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">Nenhum repositório encontrado.</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">{repos.length} repositórios encontrados</p>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      {repos.map((repo) => (
        <Card key={repo.id} className="bg-gray-900/50 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-emerald-400">{repo.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{repo.description}</p>
              </div>              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-700"
                onClick={() => openRepository(repo.html_url, repo.name)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver
              </Button>
            </div>
            <div className="flex items-center mt-4 text-sm text-gray-400 gap-4">
              {repo.language && (
                <Badge variant="outline" className="bg-gray-700/50">
                  {repo.language}
                </Badge>
              )}
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {repo.stargazers_count}
              </div>
              <div className="flex items-center">
                <GitForkIcon className="h-4 w-4 mr-1" />
                {repo.forks_count}
              </div>
              <div className="text-xs">Atualizado {new Date(repo.updated_at).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
