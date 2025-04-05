// [...nextauth].ts
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Quando é feito login com GitHub, o "profile" contém dados do usuário
      if (account?.provider === "github") {
        token.login = (profile as { login?: string })?.login;  // <- Armazenando o login do GitHub no token JWT
      }
      return token;
    },
    async session({ session, token }) {
      // Passando "token.login" para "session.user.login"
      if (token?.login) {
        session.user.login = token.login as string;
      }
      return session;
    },
  },
});
