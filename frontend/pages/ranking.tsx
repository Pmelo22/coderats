import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
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
      const username = session.user.login;

      // 1. Buscar repositórios públicos do usuário
      const reposResponse = await axios.get<GitHubRepo[]>(
        `https://api.github.com/users/${username}/repos`
      );

      let totalCommits = 0;

      // 2. Para cada repositório, contar commits feitos pelo usuário
      for (const repo of reposResponse.data) {
        const commitsResponse = await axios.get<GitHubCommit[]>(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?author=${username}`
        );
        totalCommits += commitsResponse.data.length;
      }

      // 3. Verificar se já existe no Firestore
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

      // Atualizar ranking completo
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

  useEffect(() => {
    fetchRankings();
  }, [session]);

  return (
    <div>
      <h1>Ranking de Commits</h1>
      <ul>
        {ranking.map((entry, index) => (
          <li key={entry.id}>
            {index + 1}. {entry.username}: {entry.commits} commits
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankingPage;
