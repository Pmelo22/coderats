import { useEffect, useState } from "react";
import axios from "axios";

interface RankingUser {
  username: string;
  commits: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/ranking")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setRanking(response.data as RankingUser[]);
        } else {
          console.error("Erro: resposta inválida", response.data);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar ranking:", error);
      });

  }, []);

  return (
    <div>
      <h1>Ranking de Contribuições 🚀</h1>
      <ul>
        {ranking.length > 0 ? (
          ranking.map((user, index) => (
            <li key={index}>
              {index + 1}. {user.username} - {user.commits} commits
            </li>
          ))
        ) : (
          <p>Carregando ranking...</p>
        )}
      </ul>
    </div>
  );
}
