import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar se é após 1º de junho e executar reset se necessário
  const resetDate = new Date('2025-06-01T03:00:00.000Z') // Meia-noite de Brasília
  const now = new Date()
  
  if (now >= resetDate) {
    // Adicionar header para indicar que o reset deve ser executado no client
    const response = NextResponse.next()
    response.headers.set('x-should-reset', 'true')
  }
  // Proteger rotas administrativas
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acesso à página de login
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Para outras rotas admin, a verificação do JWT será feita no client-side
    // Aqui apenas garantimos que as rotas existem
    const response = NextResponse.next()
    response.headers.set('x-admin-route', 'true')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
