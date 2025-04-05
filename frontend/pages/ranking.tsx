import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

interface RankingEntry {
  id: string;
  username: string;
  commits: number;
}

interface GitHubRepo {
  name: string;
  owner: {
    login: string;
  };
}

interface GitHubCommit {
  sha: string;
}

const RankingPage: React.FC = () => {
  const { data: session } = useSession();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  // Responsável por buscar (ou criar) o ranking de todos os usuários
  // e retornar a lista para que possamos atualizá-la posteriormente.
  const fetchRankings = async (): Promise<RankingEntry[]> => {
    try {
      // Se não existir session ou session.user.login, aborta
      if (!session?.user?.login) return [];

      // Verifica se o usuário logado já existe no "rankings"
      const userRankingQuery = query(
        collection(db, "rankings"),
        where("username", "==", session.user.login)
      );
      const userRankingSnapshot = await getDocs(userRankingQuery);

      // Se o usuário ainda não foi cadastrado, cria-o
      if (userRankingSnapshot.empty) {
        await addDoc(collection(db, "rankings"), {
          username: session.user.login,
          commits: 0,
        });
      }

      // Busca todos os documentos de ranking
      const rankingSnapshot = await getDocs(collection(db, "rankings"));
      const rankingList: RankingEntry[] = rankingSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          username: data.username || "Usuário desconhecido",
          commits: data.commits ?? 0,
        };
      });

      // Ordena do maior para o menor número de commits
      rankingList.sort((a, b) => b.commits - a.commits);

      // Atualiza o estado local
      setRanking(rankingList);

      // Retorna a lista atualizada para uso posterior
      return rankingList;
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
      return [];
    }
  };

  // Atualiza a contagem de commits no Firestore
  const updateCommitCount = async (username: string, rankingDocId: string) => {
    try {
      // GITHUB_TOKEN definido no .env
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const headers = GITHUB_TOKEN
        ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
        : {};

      // 1. Buscar todos os repositórios do usuário
      const reposResponse = await axios.get<GitHubRepo[]>(
        `https://api.github.com/users/${username}/repos`,
        { headers }
      );
      const repos = reposResponse.data;

      // 2. Somar o total de commits desse usuário em cada repositório
      let totalCommits = 0;
      for (const repo of repos) {
        // Filtra por autor = username
        const commitsUrl = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?author=${username}`;
        const commitsResponse = await axios.get<GitHubCommit[]>(commitsUrl, {
          headers,
        });
        totalCommits += commitsResponse.data.length;
      }

      // 3. Atualizar o doc no Firestore
      const rankingDocRef = doc(db, "rankings", rankingDocId);
      await updateDoc(rankingDocRef, { commits: totalCommits });
    } catch (error) {
      console.error("Erro ao atualizar commit count:", error);
    }
  };

  useEffect(() => {
    // Quando a session estiver disponível, busca o ranking
    // e, em seguida, atualiza os commits de cada usuário.
    if (session) {
      (async () => {
        const rankingList = await fetchRankings();
        // Para cada usuário, chama updateCommitCount
        for (const entry of rankingList) {
          await updateCommitCount(entry.username, entry.id);
        }
        // Após atualizar todos, busca o ranking novamente para refletir as mudanças
        await fetchRankings();
      })();
    }
  }, [session]);

  return (
    <div className="container">
      {session && (
        <div className="user-info">
          <p>Bem-vindo, {session.user?.login}</p>
          {session.user?.image && (
            <img src={session.user.image} alt="Avatar" width={50} />
          )}
        </div>
      )}

      <h1>Ranking de Contribuições 🚀</h1>
      <ul className="ranking-list">
        {ranking.length > 0 ? (
          ranking.map((entry, index) => (
            <li key={entry.id} className="ranking-item">
              <span className="position">{index + 1}.</span>
              <span className="username">{entry.username}</span>
              <span className="commits">{entry.commits} commits</span>
              {session && session.user?.login === entry.username && (
                <button
                  className="update-button"
                  onClick={async () => {
                    await updateCommitCount(entry.username, entry.id);
                    await fetchRankings(); // Recarrega ranking para exibir commits atualizados
                  }}
                >
                  Atualizar Commits
                </button>
              )}
            </li>
          ))
        ) : (
          <p>Carregando ranking...</p>
        )}
      </ul>

      <style jsx>{`
        .container {
          background-color: #121212;
          color: #ffffff;
          font-family: "Arial", sans-serif;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          text-align: center;
        }

        .user-info {
          margin-bottom: 2rem;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 20px;
          color: #00e6e6;
        }

        .ranking-list {
          list-style: none;
          padding: 0;
          width: 100%;
          max-width: 600px;
        }

        .ranking-item {
          background-color: #1e1e1e;
          margin: 8px 0;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          font-size: 1.2rem;
          justify-content: space-between;
        }

        .ranking-item:hover {
          background-color: #2a2a2a;
          transform: scale(1.02);
        }

        .commits {
          font-weight: bold;
          color: #00e6e6;
        }

        .update-button {
          background-color: #00e6e6;
          color: #121212;
          border: none;
          padding: 8px 12px;
          font-size: 1rem;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 8px;
        }

        .update-button:hover {
          background-color: #00cccc;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default RankingPage;
