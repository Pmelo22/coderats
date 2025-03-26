import { signIn, signOut, useSession } from "next-auth/react";
import "../styles/globals.css"; // Importando estilos globais

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="container">
      <header className="header">
        <img className="logo" src="/logo.png" alt="Logo Coderats" />
      </header>
      <main className="main-content">
        <h1>Coderats 🚀</h1>
        {session ? (
          <>
            <p>Bem-vindo, {session.user?.name}!</p>
            <button className="btn" onClick={() => signOut()}>Sair</button>
          </>
        ) : (
          <div className="button-container">
            <button className="btn" onClick={() => signIn("github")}>Entrar com GitHub</button>
            <button className="btn" onClick={() => window.location.href = "/ranking"}>Acessar Ranking</button>
          </div>
        )}
      </main>
    </div>
  );
}
