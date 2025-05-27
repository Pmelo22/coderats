import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, GitForkIcon } from "lucide-react";

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

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRepos(data);
        else setError("Erro ao buscar repositórios.");
      })
      .catch(() => setError("Erro ao buscar repositórios."))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando repositórios...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;
  if (!repos.length) return <div className="text-center py-8 text-gray-400">Nenhum repositório encontrado.</div>;

  return (
    <div className="space-y-4">
      {repos.map((repo) => (
        <Card key={repo.id} className="bg-gray-900/50 border border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-emerald-400">{repo.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{repo.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-700"
                onClick={() => window.open(repo.html_url, "_blank")}
              >
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
