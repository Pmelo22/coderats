import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import "../styles/globals.css"; // Importando estilos globais

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redireciona para /ranking após login
  useEffect(() => {
    if (session) {
      router.push("/ranking");
    }
  }, [session, router]);

  return (
    <div className="container">
      <header className="header">
        <img className="logo" src="/logo.png" alt="Logo Coderats" />
      </header>
      <main className="main-content">
        <h1>Coderats 🚀</h1>
        {!session ? (
          <div className="button-container">
            <button className="btn" onClick={() => signIn("github")}>
              Entrar com GitHub
            </button>
            <button className="btn" onClick={() => router.push("/ranking")}>
              Acessar Ranking
            </button>
          </div>
        ) : (
          <p>Redirecionando...</p>
        )}
      </main>
    </div>
  );
}
