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

// Interface para os eventos retornados pela API do GitHub
interface GitHubEvent {
  type: string;
  payload: {
    commits?: {
      message: string;
    }[];
  };
}

interface CustomUser {
  id: string;
  login: string; // Agora garantimos que `login` existe
  image?: string; // Adiciona a propriedade 'image'
}

interface CustomSession {
  user?: CustomUser;
}


const RankingPage: React.FC = () => {
  const { data: session } = useSession() as { data: CustomSession | null };
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  // Função para buscar os rankings na coleção "rankings"
  const fetchRankings = async () => {
    try {
      if (!session?.user?.login) return;

      // Busca a entrada do usuário
      const userRankingQuery = query(
        collection(db, "rankings"),
        where("username", "==", session.user.login)
      );
      const userRankingSnapshot = await getDocs(userRankingQuery);
      console.log("Resultados da query de ranking para usuário:", userRankingSnapshot.docs);
      if (userRankingSnapshot.empty) {
        console.log("Nenhuma entrada encontrada. Criando entrada para o usuário.");
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
      console.log("Ranking obtido:", rankingList);
      setRanking(rankingList);
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
    }
  };

  // Função para atualizar o número de commits do usuário via API do GitHub
  async function updateCommitCount(username: string, rankingDocId: string) {
    try {
      console.log(`Atualizando commits para ${username} no documento ${rankingDocId}`);
  
      // Token de autenticação (adicione no .env.local e carregue com process.env)
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  
      // Configuração da requisição com autenticação
      const headers = GITHUB_TOKEN
        ? { Authorization: `token ${GITHUB_TOKEN}` }
        : {};
  
      // Consulta os eventos do usuário no GitHub
      const response = await axios.get<GitHubEvent[]>(
        `https://api.github.com/users/${username}/events`,
        { headers }
      );
  
      console.log("Resposta da API do GitHub:", response.data);
      const events = response.data;
  
      // Filtra apenas os eventos do tipo "PushEvent"
      const pushEvents = events.filter((event) => event.type === "PushEvent");
      console.log("Push events filtrados:", pushEvents);
  
      // Soma o número de commits de cada PushEvent
      const commitCount = pushEvents.reduce((total: number, event: GitHubEvent) => {
        return total + (event.payload.commits ? event.payload.commits.length : 0);
      }, 0);
  
      console.log("Total de commits calculado:", commitCount);
  
      // Atualiza o documento de ranking no Firestore
      const rankingDocRef = doc(db, "rankings", rankingDocId);
      await updateDoc(rankingDocRef, { commits: commitCount });
      console.log("Documento atualizado com commits:", commitCount);
  
      // Refaz a busca para atualizar a lista
      fetchRankings();
    } catch (error) {
      console.error("Erro ao atualizar commit count:", error);
    }
  }
  

  useEffect(() => {
    if (session) {
      console.log("Sessão ativa:", session);
      fetchRankings();
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
