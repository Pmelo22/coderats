import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      login: string; // Agora garantimos que o login existe
      image?: string; // Garante que a imagem também seja reconhecida
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    login: string;
    image?: string;
  }
}
