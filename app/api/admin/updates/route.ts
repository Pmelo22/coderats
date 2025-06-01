import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-admin-key"

function verifyAdminToken(authorization: string | null) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Token não fornecido")
  }

  const token = authorization.split(" ")[1]
  const decoded = jwt.verify(token, JWT_SECRET) as any
  
  if (!decoded.admin) {
    throw new Error("Token inválido")
  }

  return decoded
}

// GET - Listar todas as atualizações (público)
export async function GET(req: Request) {
  try {
    const updatesRef = collection(db, "updates")
    const q = query(updatesRef, orderBy("date", "desc"))
    const snapshot = await getDocs(q)
    
    const updates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ updates })
  } catch (error) {
    console.error("Erro ao buscar atualizações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Criar nova atualização (admin only)
export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    const body = await req.json()
    const { title, content, version, type, author } = body

    if (!title || !content || !version || !type) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      )
    }

    const updateData = {
      title,
      content,
      version,
      type, // feature, bugfix, improvement, breaking
      author: author || "Admin",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, "updates"), updateData)

    return NextResponse.json({
      message: "Atualização criada com sucesso",
      id: docRef.id,
      update: { id: docRef.id, ...updateData }
    })
  } catch (error: any) {
    console.error("Erro ao criar atualização:", error)
    if (error.message === "Token não fornecido" || error.message === "Token inválido") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar uma atualização (admin only)
export async function PUT(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    const body = await req.json()
    const { id, title, content, version, type, author } = body

    if (!id || !title || !content || !version || !type) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      )
    }

    const updateData = {
      title,
      content,
      version,
      type,
      author: author || "Admin",
      updatedAt: new Date().toISOString()
    }

    const docRef = doc(db, "updates", id)
    await updateDoc(docRef, updateData)

    return NextResponse.json({
      message: "Atualização editada com sucesso",
      update: { id, ...updateData }
    })
  } catch (error: any) {
    console.error("Erro ao editar atualização:", error)
    if (error.message === "Token não fornecido" || error.message === "Token inválido") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Deletar uma atualização (admin only)
export async function DELETE(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID da atualização não fornecido" },
        { status: 400 }
      )
    }

    const docRef = doc(db, "updates", id)
    await deleteDoc(docRef)

    return NextResponse.json({
      message: "Atualização deletada com sucesso"
    })
  } catch (error: any) {
    console.error("Erro ao deletar atualização:", error)
    if (error.message === "Token não fornecido" || error.message === "Token inválido") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
