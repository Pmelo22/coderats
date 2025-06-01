import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import nodemailer from "nodemailer"

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

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")
    verifyAdminToken(authorization)

    const { subject, message } = await req.json()

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Assunto e mensagem são obrigatórios" },
        { status: 400 }
      )
    }

    // Configurar transporter do email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou outro provedor
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Buscar emails dos usuários (assumindo que você tem os emails)
    // Como o projeto usa GitHub OAuth, você pode precisar buscar os emails via API do GitHub
    // Por enquanto, vou simular o envio
    
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => doc.data())
    
    // Filtrar usuários não banidos
    const activeUsers = users.filter(user => !user.isBanned)
    
    let emailsSent = 0
    const errors: string[] = []

    // Para cada usuário ativo, tentar enviar email
    for (const user of activeUsers) {
      try {
        // Se você tiver o email armazenado no Firestore
        if (user.email) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">CodeRats - Comunicado</h2>
                <p>Olá <strong>${user.username || user.name}</strong>,</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  ${message.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
                </div>
                <p>Atenciosamente,<br>Equipe CodeRats</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280;">
                  Este é um email automático. Para dúvidas, entre em contato conosco.
                </p>
              </div>
            `
          })
          emailsSent++
        }
      } catch (error) {
        console.error(`Erro ao enviar email para ${user.username}:`, error)
        errors.push(`Erro ao enviar para ${user.username}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${emailsSent} emails enviados com sucesso`,
      totalUsers: activeUsers.length,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error("Erro ao enviar emails:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Acesso negado" },
      { status: 401 }
    )
  }
}
