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

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        if (!session?.user?.login) return;
        const username = session.user.login;

        const reposResponse = await axios.get<GitHubRepo[]>(
          `https://api.github.com/users/${username}/repos`
        );

        let totalCommits = 0;
        for (const repo of reposResponse.data) {
          const commitsResponse = await axios.get<GitHubCommit[]>(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?author=${username}`
          );
          totalCommits += commitsResponse.data.length;
        }

        const userRankingQuery = query(
          collection(db, "rankings"),
          where("username", "==", username)
        );
        const userRankingSnapshot = await getDocs(userRankingQuery);

        if (userRankingSnapshot.empty) {
          await addDoc(collection(db, "rankings"), {
            username,
            commits: totalCommits
          });
        } else {
          const docRef = userRankingSnapshot.docs[0].ref;
          await updateDoc(docRef, { commits: totalCommits });
        }

        const allDocs = await getDocs(collection(db, "rankings"));
        const allRanking = allDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as RankingEntry[];

        const sorted = allRanking.sort((a, b) => b.commits - a.commits);
        setRanking(sorted);
      } catch (error) {
        console.error("Erro ao buscar ranking:", error);
      }
    };

    fetchRankings();
  }, [session]);

  const updateCommitCount = async (username: string, docId: string) => {
    try {
      const reposResponse = await axios.get<GitHubRepo[]>(
        `https://api.github.com/users/${username}/repos`
      );

      let totalCommits = 0;
      for (const repo of reposResponse.data) {
        const commitsResponse = await axios.get<GitHubCommit[]>(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?author=${username}`
        );
        totalCommits += commitsResponse.data.length;
      }

      await updateDoc(doc(db, "rankings", docId), { commits: totalCommits });
      const updated = ranking.map((entry) =>
        entry.id === docId ? { ...entry, commits: totalCommits } : entry
      );
      setRanking(updated.sort((a, b) => b.commits - a.commits));
    } catch (error) {
      console.error("Erro ao atualizar commits:", error);
    }
  };

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
    </div>
  );
};

export default RankingPage;
