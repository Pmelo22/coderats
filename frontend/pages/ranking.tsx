import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";

interface RankingEntry {
  id: string;
  username: string;
  commits: number;
}

const RankingPage: React.FC = () => {
  const { data: session } = useSession();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  // Função para buscar os rankings na coleção "rankings"
  const fetchRankings = async () => {
    try {
      const rankingSnapshot = await getDocs(collection(db, "rankings"));
      
      // Se estiver vazia e houver um usuário logado, cria automaticamente uma entrada
      if (rankingSnapshot.empty && session?.user) {
        await addDoc(collection(db, "rankings"), {
          username: session.user.name || "Usuário desconhecido",
          commits: 0,
        });
        // Após criar a entrada, refaz a busca
        return fetchRankings();
      }

      const rankingList: RankingEntry[] = rankingSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username || "Usuário desconhecido",
          commits: data.commits !== undefined ? data.commits : 0,
        };
      });
      setRanking(rankingList);
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
    }
  };

  // Busca o ranking somente se o usuário estiver autenticado
  useEffect(() => {
    if (session) {
      fetchRankings();
    }
  }, [session]);

  return (
    <div className="container">
      {session && (
        <div className="user-info">
          <p>Bem-vindo, {session.user?.name}</p>
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
            </li>
          ))
        ) : (
          <p>Carregando ranking...</p>
        )}
      </ul>

      <style jsx>{`
        /* Estilos globais em dark mode */
        .container {
          background-color: #121212;
          color: #ffffff;
          font-family: "Arial", sans-serif;
          margin: 0;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          text-align: center;
        }

        /* Seção de informações do usuário */
        .user-info {
          margin-bottom: 2rem;
        }

        .user-info p {
          margin: 0.5rem 0;
        }

        /* Estilo do título */
        h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 20px;
          color: #00e6e6;
        }

        /* Estilo da lista de ranking */
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
          justify-content: space-between;
          align-items: center;
          font-size: 1.2rem;
          transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
        }

        .ranking-item:hover {
          background-color: #2a2a2a;
          transform: scale(1.02);
        }

        .position {
          margin-right: 10px;
        }

        .commits {
          font-weight: bold;
          color: #00e6e6;
        }
      `}</style>
    </div>
  );
};

export default RankingPage;
