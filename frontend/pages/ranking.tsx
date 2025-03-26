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
  where
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

  const fetchRankings = async () => {
    try {
      if (!session?.user?.login) return;

      const userRankingQuery = query(
        collection(db, "rankings"),
        where("username", "==", session.user.login)
      );
      const userRankingSnapshot = await getDocs(userRankingQuery);
      if (userRankingSnapshot.empty) {
        await addDoc(collection(db, "rankings"), {
          username: session.user.login,
          commits: 0,
        });
        return fetchRankings();
      }

      const rankingSnapshot = await getDocs(collection(db, "rankings"));
      const rankingList: RankingEntry[] = rankingSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          username: data.username || "Usuário desconhecido",
          commits: data.commits !== undefined ? data.commits : 0,
        };
      });
      setRanking(rankingList);
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
    }
  };

  async function updateCommitCount(username: string, rankingDocId: string) {
    try {
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const headers = GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};

      const reposResponse = await axios.get<GitHubRepo[]>(`https://api.github.com/users/${username}/repos`, { headers });
      const repos = reposResponse.data;

      let totalCommits = 0;

      for (const repo of repos) {
        const commitsUrl = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?author=${username}`;

        try {
          const commitsResponse = await axios.get<GitHubCommit[]>(commitsUrl, { headers });
          totalCommits += commitsResponse.data.length;
        } catch (error: any) {
          if (error.response?.status === 409) {
            console.warn(`Conflito ao buscar commits para ${repo.name}. Pode ser um repositório vazio.`);
            continue; // Pula este repositório
          } else {
            console.error(`Erro ao buscar commits de ${repo.name}:`, error.message);
          }
        }
      }

      const rankingDocRef = doc(db, "rankings", rankingDocId);
      await updateDoc(rankingDocRef, { commits: totalCommits });
      fetchRankings();
    } catch (error) {
      console.error("Erro ao atualizar commit count:", error);
    }
  }


  useEffect(() => {
    if (session) {
      fetchRankings().then(() => {
        ranking.forEach((entry) => updateCommitCount(entry.username, entry.id));
      });
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
                  onClick={() => updateCommitCount(entry.username, entry.id)}
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
