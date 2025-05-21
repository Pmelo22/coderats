import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { setUser, getUserByUid } from "@/lib/firestore-user"
import { Octokit } from "@octokit/rest"
import { doc, setDoc, getDoc } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    // Recupera o token do usuário autenticado pelo Firebase (via header Authorization: Bearer <token>)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const idToken = authHeader.split(" ")[1]

    // Verifica o token (mock para dev, em produção use firebase-admin)
    const uid = idToken // Em produção, decodifique o token para obter o uid

    // Busca o usuário autenticado no Firestore
    let user = await getUserByUid(uid)

    // Se não existir, cria um novo usuário com dados mínimos
    if (!user) {
      user = {
        uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await setUser(uid, user)
    }

    // Se quiser buscar dados do GitHub, use Octokit (opcional)
    // const octokit = new Octokit({ auth: "GITHUB_PERSONAL_ACCESS_TOKEN" })
    // const { data: githubUser } = await octokit.users.getAuthenticated()

    // Inicializa/atualiza coleções auxiliares (contributions, rankings) se necessário
    // Exemplo: await setDoc(doc(db, "contributions", uid), { ... })
    // Exemplo: await setDoc(doc(db, "leaderboard", uid), { ... })

    return NextResponse.json({
      success: true,
      message: user ? "User updated successfully" : "User created successfully",
      user,
    })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
  }
}
