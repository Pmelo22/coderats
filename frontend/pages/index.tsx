import { signIn, signOut, useSession } from "next-auth/react";
import "../styles/globals.css"; // Importando estilos globais

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Coderats 🚀</h1>
      {session ? (
        <>
          <p>Bem-vindo, {session.user?.name}!</p>
          <button onClick={() => signOut()}>Sair</button>
        </>
      ) : (
        <button onClick={() => signIn("github")}>Entrar com GitHub</button>
      )}
    </div>
  );
}
